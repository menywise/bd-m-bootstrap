/* ═══════════════════════════════════════════════════════════════════════════
   PROJECT: Consensus Design System
   FILE: cds-storage.js v1.0
   CONTEXT: Abstraction storage (window.storage artifacts ⇄ localStorage)
   LAST UPDATE: 2026-01-11
   DISC: D
   DEPENDENCIES: Aucune
   CDN: https://cdn.jsdelivr.net/gh/menywise/BDB@latest/cds-storage.js
   ═══════════════════════════════════════════════════════════════════════════ */

const CDS_Storage = {
  useWindowStorage: typeof window.storage !== 'undefined',
  
  /**
   * Recupere une valeur du storage
   * @param {string} key - Cle storage
   * @returns {Promise<any|null>} Valeur parsee ou null
   */
  async get(key) {
    if (this.useWindowStorage) {
      try {
        const result = await window.storage.get(key);
        return result ? JSON.parse(result.value) : null;
      } catch (e) {
        console.warn(`Storage get error (${key}):`, e);
        return null;
      }
    } else {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (e) {
        console.warn(`LocalStorage get error (${key}):`, e);
        return null;
      }
    }
  },
  
  /**
   * Enregistre une valeur dans le storage
   * @param {string} key - Cle storage
   * @param {any} value - Valeur a enregistrer (sera JSONifiee)
   * @returns {Promise<boolean>} Succes operation
   */
  async set(key, value) {
    const jsonStr = JSON.stringify(value);
    
    if (this.useWindowStorage) {
      try {
        await window.storage.set(key, jsonStr);
        return true;
      } catch (e) {
        console.warn(`Storage set error (${key}):`, e);
        return false;
      }
    } else {
      try {
        localStorage.setItem(key, jsonStr);
        return true;
      } catch (e) {
        console.warn(`LocalStorage set error (${key}):`, e);
        return false;
      }
    }
  },
  
  /**
   * Supprime une cle du storage
   * @param {string} key - Cle a supprimer
   * @returns {Promise<boolean>} Succes operation
   */
  async delete(key) {
    if (this.useWindowStorage) {
      try {
        await window.storage.delete(key);
        return true;
      } catch (e) {
        console.warn(`Storage delete error (${key}):`, e);
        return false;
      }
    } else {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.warn(`LocalStorage delete error (${key}):`, e);
        return false;
      }
    }
  },
  
  /**
   * Verifie si une cle existe
   * @param {string} key - Cle a verifier
   * @returns {Promise<boolean>} Existence
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  },
  
  /**
   * Vide completement le storage
   * @returns {Promise<boolean>} Succes operation
   */
  async clear() {
    if (this.useWindowStorage) {
      try {
        const keys = await window.storage.list();
        for (const key of keys.keys) {
          await window.storage.delete(key);
        }
        return true;
      } catch (e) {
        console.warn('Storage clear error:', e);
        return false;
      }
    } else {
      try {
        localStorage.clear();
        return true;
      } catch (e) {
        console.warn('LocalStorage clear error:', e);
        return false;
      }
    }
  },
  
  /**
   * Liste toutes les cles disponibles
   * @param {string} prefix - Prefixe optionnel pour filtrer
   * @returns {Promise<string[]>} Liste cles
   */
  async keys(prefix = null) {
    if (this.useWindowStorage) {
      try {
        const result = await window.storage.list(prefix || undefined);
        return result.keys || [];
      } catch (e) {
        console.warn('Storage keys error:', e);
        return [];
      }
    } else {
      try {
        const allKeys = Object.keys(localStorage);
        return prefix ? allKeys.filter(k => k.startsWith(prefix)) : allKeys;
      } catch (e) {
        console.warn('LocalStorage keys error:', e);
        return [];
      }
    }
  },
  /**
   * Migration des anciennes cles planning_SWW_YYYY vers YYYY_WW_planning_week
   * Idempotent : ne modifie rien si deja migre
   */
  async migrateLegacyPlanningKeys() {
    const allKeys = await this.keys();
    const legacyRegex = /^planning_S(\d{1,2})_(\d{4})$/;

    for (const key of allKeys) {
      const matchKey = key.match(legacyRegex);
      if (!matchKey) continue;

      const semaine = Number(matchKey[1]);
      const annee = Number(matchKey[2]);

      if (typeof PlanningSchema === "undefined" || !PlanningSchema.makeStorageKey) continue;

      const newKey = PlanningSchema.makeStorageKey(annee, semaine, "planning_week");

      const alreadyExists = await this.has(newKey);
      if (alreadyExists) continue;

      const data = await this.get(key);
      if (!data) continue;

      const saved = await this.set(newKey, data);
      if (saved) {
        await this.delete(key);
      }
    }

    return true;
  }
};

// Export pour modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CDS_Storage;
}