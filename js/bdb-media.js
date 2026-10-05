/* =========================================================
   BDB-MEDIA — Gestion centralisée des images BDB
   Version  : 1.0.0
   Chargement : après supabase-client.js, avant [module]-app.js
   Chaîne    : bootstrap.bundle → supabase@2 → supabase-client.js
               → bdb-shell.js → bdb-media.js → [module]-app.js
   Expose   : window.BdbMedia (classe)
   Contrat  : chaque module instancie sa propre instance
   Tables   : content_types · content_images
   Bucket   : content-images (tiret — bug Lovable hérité, ne pas corriger)
   CDS      : escHtml local, zéro console.log, zéro onclick inline
   ========================================================= */

'use strict';

(function () {

  /* Lazy — window.bdb peut ne pas exister au moment du parse de l'IIFE */
  function _db() { return window.bdb; }
  const BUCKET = 'content-images';
  const SIGNED_URL_TTL = 900; // 15 min

  /* ── escHtml local (INTERDIT-C6) ────────────────────────── */
  const _el = document.createElement('span');
  function _esc(s) { _el.textContent = s ?? ''; return _el.innerHTML; }

  /* ═══════════════════════════════════════════════════════════
     CLASSE BdbMedia
     ═══════════════════════════════════════════════════════════ */

  class BdbMedia {

    /**
     * @param {Object} opts
     * @param {Function} [opts.notify]   - callback(msg, type) pour feedback UI
     *                                     type = 'error' | 'success' | 'info'
     *                                     Si absent, erreurs silencieuses.
     * @param {number}   [opts.maxImages] - nombre max d'images par formulaire (défaut 3)
     * @param {number}   [opts.maxSizeMB] - taille max fichier en Mo (défaut 5)
     */
    constructor(opts = {}) {
      this._notify = opts.notify || (() => {});
      this._maxImages = opts.maxImages ?? 3;
      this._maxSizeMB = opts.maxSizeMB ?? 5;
      this._images = [];
      this._contentTypeIds = {};
    }

    /* ── Getters ──────────────────────────────────────────── */

    /** Images du formulaire en cours */
    get images() { return this._images; }

    /** Map code → uuid des content_types */
    get contentTypeIds() { return this._contentTypeIds; }

    /* ── Reset (ouverture modale / nouveau formulaire) ──── */

    reset() { this._images = []; }

    /* ── Content Type IDs ─────────────────────────────────── */

    async loadContentTypeIds() {
      const { data, error } = await _db().from('content_types').select('id, code');
      if (error) {
        this._notify('Erreur chargement types de contenu.', 'error');
        return;
      }
      (data || []).forEach(ct => { this._contentTypeIds[ct.code] = ct.id; });
    }

    /* ── Signed URL ───────────────────────────────────────── */

    async getSignedUrl(path) {
      if (!path) return null;
      const { data } = await _db().storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
      return data?.signedUrl || null;
    }

    /* ── Upload ───────────────────────────────────────────── */

    /**
     * Upload un fichier image vers le bucket.
     * Valide type MIME, taille, quota.
     * @param {File}   file   - Fichier à uploader
     * @param {string} folder - Sous-dossier bucket (ex: 'materiel', 'fiches')
     * @returns {string|null} chemin storage ou null si échec
     */
    async upload(file, folder) {
      if (this._images.length >= this._maxImages) {
        this._notify(`Maximum ${this._maxImages} images.`, 'error');
        return null;
      }
      if (!file.type.startsWith('image/')) {
        this._notify('Seules les images sont acceptées.', 'error');
        return null;
      }
      if (file.size > this._maxSizeMB * 1024 * 1024) {
        this._notify(`Image trop lourde (max ${this._maxSizeMB} Mo).`, 'error');
        return null;
      }

      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${folder}/${window.bdbUser.id}/${Date.now()}.${ext}`;

      const { error } = await _db().storage.from(BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) {
        this._notify('Erreur upload : ' + error.message, 'error');
        return null;
      }
      return path;
    }

    /* ── Aperçu images (rendu DOM) ────────────────────────── */

    /**
     * Rend les aperçus dans un conteneur HTML.
     * @param {string} containerId - ID du conteneur DOM
     */
    async renderPreviews(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      for (const img of this._images) {
        let url = img.url;
        if (!url) {
          url = await this.getSignedUrl(img.storage_path);
          img.url = url;
        }

        const div = document.createElement('div');
        div.className = 'position-relative';
        div.innerHTML = `
          <img src="${_esc(url || '')}" alt="Aperçu image" class="cds-thumbnail rounded">
          <button type="button"
                  class="btn btn-danger btn-sm position-absolute top-0 end-0 cds-img-remove-btn"
                  data-path="${_esc(img.storage_path)}" aria-label="Supprimer cette image">
            <i class="bi bi-x cds-text-xxs"></i>
          </button>`;
        container.appendChild(div);
      }

      /* addEventListener — INTERDIT onclick inline */
      container.querySelectorAll('[data-path]').forEach(btn => {
        btn.addEventListener('click', () => {
          this._images = this._images.filter(i => i.storage_path !== btn.dataset.path);
          this.renderPreviews(containerId);
        });
      });
    }

    /* ── Save (INSERT images neuves) ──────────────────────── */

    /**
     * Insère les images du formulaire dans content_images.
     * @param {string} recordId       - UUID de l'enregistrement parent
     * @param {string} contentTypeCode - code content_type (ex: 'materiel')
     */
    async save(recordId, contentTypeCode) {
      const contentTypeId = this._contentTypeIds[contentTypeCode];
      if (!contentTypeId || this._images.length === 0) return;
      const { error } = await _db().from('content_images').insert(
        this._images.map(img => ({
          content_type_id: contentTypeId,
          content_id: recordId,
          storage_path: img.storage_path,
          position: img.position,
        }))
      ).select();
      if (error) {
        this._notify('Erreur sauvegarde images.', 'error');
      }
    }

    /* ── Sync (diff add/delete pour édition) ──────────────── */

    /**
     * Synchronise les images : supprime les retirées, ajoute les nouvelles.
     * @param {string} recordId       - UUID de l'enregistrement parent
     * @param {string} contentTypeCode - code content_type
     */
    async sync(recordId, contentTypeCode) {
      const contentTypeId = this._contentTypeIds[contentTypeCode];
      if (!contentTypeId) return;

      const { data: existing } = await _db().from('content_images').select('*')
        .eq('content_type_id', contentTypeId).eq('content_id', recordId);

      const existingPaths = new Set((existing || []).map(i => i.storage_path));
      const newPaths = new Set(this._images.map(i => i.storage_path));

      /* Supprimer les images retirées du formulaire */
      const toDelete = (existing || []).filter(i => !newPaths.has(i.storage_path));
      if (toDelete.length) {
        // UX06 : confirm() fait par le caller (formulaire de sauvegarde)
        await _db().from('content_images').delete()
          .in('id', toDelete.map(i => i.id)).select();
        await _db().storage.from(BUCKET).remove(toDelete.map(i => i.storage_path));
      }

      /* Ajouter les nouvelles images */
      const toInsert = this._images.filter(i => !existingPaths.has(i.storage_path));
      if (toInsert.length) {
        await _db().from('content_images').insert(
          toInsert.map(img => ({
            content_type_id: contentTypeId,
            content_id: recordId,
            storage_path: img.storage_path,
            position: img.position,
          }))
        ).select();
      }
    }

    /* ── Load images existantes ───────────────────────────── */

    /**
     * Charge les images existantes pour un enregistrement.
     * Met à jour this._images.
     * @param {string} recordId       - UUID
     * @param {string} contentTypeCode - code content_type
     * @returns {Array} images chargées
     */
    async loadForRecord(recordId, contentTypeCode) {
      const contentTypeId = this._contentTypeIds[contentTypeCode];
      if (!contentTypeId) return [];
      const { data } = await _db().from('content_images').select('*')
        .eq('content_type_id', contentTypeId).eq('content_id', recordId);
      this._images = (data || []).map(img => ({
        id: img.id,
        storage_path: img.storage_path,
        position: img.position,
      }));
      return this._images;
    }

    /* ── Setup upload zone (drag & drop + click) ──────────── */

    /**
     * Branche le drag & drop et le clic sur une zone d'upload.
     * @param {string} areaId    - ID zone drop
     * @param {string} inputId   - ID input[type=file]
     * @param {string} btnId     - ID bouton déclencheur
     * @param {string} previewId - ID conteneur aperçus
     * @param {string} folder    - sous-dossier bucket
     */
    /**
     * @param {string} areaId    - ID zone drop
     * @param {string} inputId   - ID input[type=file]
     * @param {string} btnId     - ID bouton déclencheur
     * @param {string} previewId - ID conteneur aperçus
     * @param {string} folder    - sous-dossier bucket
     * @param {string} [dragClass='bdb-upload-active'] - classe CSS active au drag
     */
    setupUpload(areaId, inputId, btnId, previewId, folder, dragClass) {
      const cls = dragClass || 'bdb-upload-active';
      const area = document.getElementById(areaId);
      const input = document.getElementById(inputId);
      const btn = document.getElementById(btnId);
      if (!area || !input || !btn) return;

      btn.addEventListener('click', () => input.click());

      input.addEventListener('change', async (e) => {
        for (const file of Array.from(e.target.files || [])) {
          const path = await this.upload(file, folder);
          if (path) this._images.push({ storage_path: path, position: this._images.length + 1 });
        }
        this.renderPreviews(previewId);
        e.target.value = '';
      });

      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add(cls);
      });
      area.addEventListener('dragleave', () => area.classList.remove(cls));
      area.addEventListener('drop', async (e) => {
        e.preventDefault();
        area.classList.remove(cls);
        for (const file of Array.from(e.dataTransfer.files)) {
          const path = await this.upload(file, folder);
          if (path) this._images.push({ storage_path: path, position: this._images.length + 1 });
        }
        this.renderPreviews(previewId);
      });
    }
  }

  /* ── Expose global ────────────────────────────────────── */
  window.BdbMedia = BdbMedia;

})();
