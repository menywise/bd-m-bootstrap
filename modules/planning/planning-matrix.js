// ============================================
// PLANNING MATRIX V1.0 — FILE SAFE (IIFE global)
// Rendu matrice planning extrait de planning-controller.js
// AUCUN accès direct au DOM hors container fourni en paramètre
// AUCUN accès à PlanningEngine, CDS_Storage
// Dépend de : window.PlanningCore, window.PlanningSchema
// Expose window.PlanningMatrix
// ============================================

(function () {
  "use strict";

  if (!window.PlanningCore) {
    throw new Error("PlanningMatrix : PlanningCore requis");
  }

  const { escapeHtml, formatShortDayFR, computeWeekDates } = window.PlanningCore;

  // ── Résolution code CSV → fullName + affichage terrain ───────────────────

  function _registryLists() {
    const s = window.PlanningSchema;
    return {
      ides:  (Array.isArray(s && s.IDES)  && s.IDES.length)  ? s.IDES.map(String)  : [],
      chirs: (Array.isArray(s && s.CHIRURGIENS) && s.CHIRURGIENS.length) ? s.CHIRURGIENS.map(String) : []
    };
  }

  // Normalise accents pour comparaison : "É" → "E"
  // ── summarizeCell — rendu unifié par atome ───────────────────────────────

  function atomDiv(code, flags) {
    var d     = PlanningMembers.display(code);
    var known = PlanningMembers.isKnown(code);
    var name  = known ? escapeHtml(d) : '<span class="text-danger fw-semibold">' + escapeHtml(d) + '</span>';
    var cls;
    if (flags.ouverture && flags.visceral) {
      cls = "small text-truncate rounded-1 px-1 bg-success-subtle border border-warning";
    } else if (flags.ouverture && flags.nuit) {
      cls = "small text-truncate rounded-1 px-1 bg-success-subtle border border-info";
    } else if (flags.ouverture) {
      cls = "small text-truncate rounded-1 px-1 bg-success-subtle";
    } else if (flags.doublure) {
      cls = "small text-truncate rounded-1 px-1 bg-warning-subtle";
    } else if (flags.visceral) {
      cls = "small text-truncate rounded-1 px-1 bg-warning-subtle text-warning-emphasis";
    } else if (flags.nuit) {
      cls = "small text-truncate rounded-1 px-1 bg-info-subtle";
    } else if (flags.etudiant) {
      cls = "small text-truncate rounded-1 px-1 plan-bg-etudiant";
    } else {
      cls = "small text-truncate";
    }
    return '<div class="' + cls + '">' + name + '</div>';
  }

  function summarizeCell(list, opts) {
    opts = opts || {};
    var isCouloir = opts.isCouloir === true;
    if (!Array.isArray(list) || list.length === 0) return "";

    if (isCouloir) {
      return list
        .filter(function(a) { return String(a.ide || "").trim(); })
        .map(function(a) {
          return atomDiv(String(a.ide).trim(), {
            ouverture: Number(a.ouverture) === 1,
            doublure:  Number(a.doublure)  === 1,
            visceral:  Number(a.visceral)  === 1,
            nuit:      Number(a.nuit)      === 1,
            etudiant:  a.role === "ETUDIANT"
          });
        }).join("");
    }

    // ── SALLE ──
    var chirCode = "";
    for (var i = 0; i < list.length; i++) {
      var cc = String(list[i].chirurgien || "").trim();
      if (cc) { chirCode = cc; break; }
    }

    var html = "";
    if (chirCode) {
      var d     = PlanningMembers.display(chirCode);
      var known = PlanningMembers.isKnown(chirCode);
      var cls   = known ? "fw-semibold small text-truncate" : "fw-semibold small text-truncate text-danger";
      html += '<div class="' + cls + '">' + escapeHtml(d) + '</div>';
    }

    for (var i = 0; i < list.length; i++) {
      var a   = list[i];
      var ide = String(a.ide || "").trim();
      if (!ide) continue;
      html += atomDiv(ide, {
        ouverture: Number(a.ouverture) === 1,
        doublure:  Number(a.doublure)  === 1,
        visceral:  Number(a.visceral)  === 1,
        nuit:      Number(a.nuit)      === 1,
        etudiant:  a.role === "ETUDIANT"
      });
    }
    return html;
  }


  // ── Groupement local ─────────────────────────────────────────────────────
  // Reproduit groupAffectationsBySlot() du controller.
  // Clé : "JOUR__CRENEAU__SECTEUR__SALLE"

  function groupBySlot(affectations) {
    const map = new Map();
    for (const a of (affectations || [])) {
      const k = `${a.jour}__${a.creneau}__${a.secteur}__${a.salle ?? ""}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(a);
    }
    return map;
  }

  // ── Rendu bouton cellule ──────────────────────────────────────────────────
  // Reproduit cellButton() du controller (comportement identique).

  function cellButton(content, dataAttrs, filled, meta) {
    meta = meta || {};
    var classes = ["btn", "btn-sm", "w-100", "text-start"];

    if (meta.closedDegrade) classes.push("bg-closed-degrade");
    else if (meta.closed)   classes.push("bg-closed");
    else if (meta.visceral) classes.push("bg-visceral");
    else if (meta.couloir)  classes.push("bg-couloir");

    if (meta.dayAlt === 0) classes.push("day-alt-0");
    if (meta.dayAlt === 1) classes.push("day-alt-1");
    if (meta.dayEnd)   classes.push("day-end");
    if (meta.roomAlt)  classes.push("room-alt");

    var cls = classes.join(" ");

    var label = filled
      ? content
      : '<span class="text-secondary">+</span>';

    var attrs = Object.keys(dataAttrs || {}).map(function (k) {
      return 'data-' + k + '="' + escapeHtml(dataAttrs[k]) + '"';
    }).join(" ");

    var disabledAttr = meta.closed ? ' disabled aria-disabled="true"' : "";

    return '<button type="button" class="' + cls + '" ' + attrs + disabledAttr + '>' + label + '</button>';
  }

  // ── API publique ──────────────────────────────────────────────────────────

  /**
   * render(options)
   *
   * @param {HTMLElement} options.container   — div#matrixGrid
   * @param {Array}       options.affectations — tableau affectations de la semaine
   * @param {number}      options.semaine
   * @param {number}      options.annee
   * @param {number[]}    options.salles       — ex: [5,6,7,8]
   * @param {Function}    options.onCellClick  — callback({ jour, creneau, secteur, salle })
   */
  function render(options) {
    const { container, affectations, semaine, annee, salles, onCellClick } = options;

    if (!container) throw new Error("PlanningMatrix.render : container requis");

    const { days } = computeWeekDates(semaine, annee);
    const creneaux = (window.PlanningSchema && window.PlanningSchema.CRENEAUX) || ["MATIN", "APREM", "SOIR"];
    const jours    = (window.PlanningSchema && window.PlanningSchema.JOURS)    || ["LUNDI","MARDI","MERCREDI","JEUDI","VENDREDI"];
    const salleListe = (Array.isArray(salles) && salles.length) ? salles : [5, 6, 7, 8];

    const slotMap = groupBySlot(affectations);

    // ── Thead ──────────────────────────────────────────────────────────────

    // table-layout:fixed + largeurs explicites → colonnes stables, plus de stretch sur noms longs
    // Secteur: 80px | chaque créneau: 95px | total: 80 + 5×3×95 = 1505px → scroll horizontal tablette
    const COL_SECTEUR  = 80;
    const COL_CRENEAU  = 95;
    const totalWidth   = COL_SECTEUR + days.length * creneaux.length * COL_CRENEAU;
    let out = `<table class="table table-sm table-bordered align-middle mb-0" style="table-layout:fixed;width:${totalWidth}px;">`;
    out += '<thead>';

    // Ligne 1 : jours
    out += '<tr>';
    out += `<th class="bg-light" style="width:${COL_SECTEUR}px;">Secteur</th>`;
    for (const d of days) {
      const colspanWidth = creneaux.length * COL_CRENEAU;
      out += `<th class="text-center bg-light" colspan="${creneaux.length}" style="width:${colspanWidth}px;">${escapeHtml(formatShortDayFR(d))}</th>`;
    }
    out += '</tr>';

    // Ligne 2 : créneaux répétés
    out += '<tr>';
    out += `<th class="bg-light" style="width:${COL_SECTEUR}px;"></th>`;
    for (let j = 0; j < days.length; j++) {
      for (let ci = 0; ci < creneaux.length; ci++) {
        const c = creneaux[ci];
        const thCls = (ci === creneaux.length - 1)
          ? 'text-center small bg-light day-end'
          : 'text-center small bg-light';
        out += `<th class="${thCls}" style="width:${COL_CRENEAU}px;">${escapeHtml(String(c))}</th>`;
      }
    }
    out += '</tr>';
    out += '</thead>';

    // ── Tbody ──────────────────────────────────────────────────────────────

    out += '<tbody>';

    // Ligne COULOIR
    out += '<tr>';
    out += '<td class="fw-semibold">COULOIR</td>';
    for (let j = 0; j < 5; j++) {
      const jourLabel = jours[j];
      for (let ci = 0; ci < creneaux.length; ci++) {
        const c = creneaux[ci];
        const k = `${jourLabel}__${c}__COULOIR__`;
        const list = slotMap.get(k) || [];
        const sum  = summarizeCell(list, { isCouloir: true });
        const meta = {
          closed: false, opening: false, visceral: false, couloir: true,
          dayAlt: (j % 2),
          dayEnd: (ci === creneaux.length - 1),
          roomAlt: false
        };
        const tdCls = [
          "cell-slot", "cell-couloir",
          meta.dayAlt === 1 ? "day-alt-1" : "day-alt-0",
          meta.dayEnd ? "day-end" : ""
        ].filter(Boolean).join(" ");

        out += '<td class="' + tdCls + '">'
          + cellButton(sum, { action: "cell", jour: jourLabel, creneau: c, secteur: "COULOIR", salle: "" }, list.length > 0, meta)
          + '</td>';
      }
    }
    out += '</tr>';

    // Lignes SALLE
    for (let ri = 0; ri < salleListe.length; ri++) {
      const s = salleListe[ri];
      out += '<tr>';
      out += `<td class="fw-semibold">SALLE ${escapeHtml(String(s))}</td>`;
      for (let j = 0; j < 5; j++) {
        const jourLabel = jours[j];
        for (let ci = 0; ci < creneaux.length; ci++) {
          const c = creneaux[ci];
          const k = `${jourLabel}__${c}__SALLE__${s}`;
          const list = slotMap.get(k) || [];
          const sum  = summarizeCell(list, { isCouloir: false });
          const _hasChir    = list.some(function (x) { return String(x.chirurgien || "").trim(); });
          const _hasInstru  = list.some(function (x) { return x.role === "INSTRU"  && String(x.ide || "").trim(); });
          const _hasPanseur = list.some(function (x) { return x.role === "PANSEUR" && String(x.ide || "").trim(); });
          // Dégradé implicite : chirurgien présent mais INSTRU ou PANSEUR manquant
          const _implicitDegrade = list.length > 0
            && !list.some(function (x) { return Number(x.salle_fermee) === 1; })
            && _hasChir && (!_hasInstru || !_hasPanseur);
          const meta = {
            closed:   list.some(function (x) { return Number(x.salle_fermee) === 1; }),
            closedDegrade: _implicitDegrade || list.some(function (x) { return Number(x.salle_fermee) === 1 && Number(x.ferme_degrade) === 1; }),
            opening:  list.some(function (x) { return Number(x.ouverture) === 1; }),
            visceral: list.some(function (x) { return Number(x.visceral) === 1; }),
            couloir: false,
            dayAlt:  (j % 2),
            dayEnd:  (ci === creneaux.length - 1),
            roomAlt: (ri % 2 === 1)
          };
          const tdCls = [
            "cell-slot",
            meta.dayAlt === 1 ? "day-alt-1" : "day-alt-0",
            meta.dayEnd  ? "day-end"  : "",
            meta.roomAlt ? "room-alt" : ""
          ].filter(Boolean).join(" ");

          out += '<td class="' + tdCls + '">'
            + cellButton(sum, { action: "cell", jour: jourLabel, creneau: c, secteur: "SALLE", salle: String(s) }, list.length > 0, meta)
            + '</td>';
        }
      }
      out += '</tr>';
    }

    out += '</tbody></table>';
    container.innerHTML = out;

    // ── Délégation clic ────────────────────────────────────────────────────
    // Même logique que le controller original.

    container.querySelector("table")?.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action='cell']");
      if (!btn || btn.disabled) return;

      const jour    = btn.getAttribute("data-jour")    || "";
      const creneau = btn.getAttribute("data-creneau") || "";
      const secteur = btn.getAttribute("data-secteur") || "";
      const salle   = btn.getAttribute("data-salle")   || "";

      if (typeof onCellClick === "function") {
        onCellClick({
          jour,
          creneau,
          secteur,
          salle: salle ? PlanningSchema.normalizeSalle(salle) : ""
        });
      }
    });
  }

  // ── Export global ─────────────────────────────────────────────────────────

  window.PlanningMatrix = Object.freeze({
    render
  });

})();
