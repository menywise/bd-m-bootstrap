import { useState, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════
// SYSTEM PROMPT — Expertise métier condensée DATA_METIER
// ════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `Tu es un chirurgien orthopédiste et neurochirurgien sénior avec 25 ans d'expérience au bloc opératoire.
Tu enrichis un thesaurus de 420 protocoles opératoires (Ortho/Neuro/Septique/Traumato).

RÈGLES ABSOLUES :
- LIBELLE_CIBLE et FREQUENCE sont SACRÉS — ne jamais les modifier
- Anti-hallucination : ne jamais inventer un code CCAM, un synonyme ou une classification sans certitude
- Si information insuffisante : laisser le champ vide plutôt qu'inventer
- Périmètre strict : ORTHOPÉDIE + NEUROCHIRURGIE uniquement

ZONES ANATOMIQUES (13 zones + 2 défaut) :
RACHIS & NEURO-AXIAL | CRÂNE & NEUROCHIRURGIE | ÉPAULE | BRAS | COUDE | AVANT-BRAS | MAIN & POIGNET | HANCHE | CUISSE | GENOU | JAMBE | PIED & CHEVILLE | TISSUS MOUS & PEAU | MULTIPLES | EXCLUS

CLASSIFICATION TYPE (hiérarchie priorité) :
SEPTIQUE > TRAUMATO > NEURO > ORTHO. Les nerfs périphériques = ORTHO (pas NEURO).

TEMPLATE DEFINITION_EXPERT :
"[Nom technique précis]. [Description geste + indication]. Indication : [pathologie cible]. Objectif : [résultat thérapeutique]. [Détails techniques si pertinent : voie, matériel, fixation]."
Maximum 3-4 phrases. Style professionnel IBODE.

TEMPLATE SYNONYMES_RECHERCHE :
Inclure : jargon terrain, acronymes développés, éponymes, matériel associé, variantes linguistiques.
Format : séparés par virgules. Ex: "PTG, prothèse totale genou, arthroplastie genou, remplacement genou"

TEMPLATE PATHOLOGIE :
Précis (pas "Douleur" ni "Traumatisme"). Ex: "Gonarthrose fémoro-tibiale", "Rupture LCA", "Fracture per-trochantérienne"

CODES CCAM :
Format 7 caractères (ex: NFKA010). Uniquement si tu es CERTAIN du code. Sinon laisser vide.
Lettre initiale : N = membre inf, M = membre sup, L = rachis, A = nerfs.

ALERTES :
Uniquement si pertinent : antibiothérapie, position spécifique, garrot, ciment, scopie, matériel rare.

Réponds UNIQUEMENT en JSON valide, sans backticks, sans commentaires.`;

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function ThesaurusEnricher() {
  const [protocols, setProtocols] = useState([]);
  const [enriched, setEnriched] = useState({});
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("load");
  const [filter, setFilter] = useState("all");
  const [sqlReady, setSqlReady] = useState(false);
  const abortRef = useRef(false);

  const log = useCallback((level, msg) => {
    setLogs(prev => [...prev, { level, msg, time: new Date().toLocaleTimeString("fr-FR") }]);
  }, []);

  // ── Chargement données ──
  const handlePaste = (text) => {
    try {
      let data = JSON.parse(text);
      if (!Array.isArray(data)) data = [data];
      if (!data[0]?.id_protocole) throw new Error("Format invalide — clé id_protocole manquante");
      setProtocols(data.sort((a, b) => (b.frequence || 0) - (a.frequence || 0)));
      log("ok", `${data.length} protocoles chargés.`);
      setTab("audit");
    } catch (e) {
      log("err", "Erreur parsing JSON : " + e.message);
    }
  };

  // ── Audit champs vides ──
  const audit = () => {
    const fields = ["pathologie", "definition_expert", "synonymes_recherche", "codes_ccam", "alertes"];
    const stats = {};
    fields.forEach(f => {
      stats[f] = {
        empty: protocols.filter(p => !p[f] || p[f].trim() === "").length,
        filled: protocols.filter(p => p[f] && p[f].trim() !== "").length,
      };
    });
    return stats;
  };

  const paretoCounts = () => {
    const tiers = { Critique: [], Standard: [], Secondaire: [], Rare: [] };
    protocols.forEach(p => {
      const tier = p.pareto || "Rare";
      if (tiers[tier]) tiers[tier].push(p);
    });
    return tiers;
  };

  // ── Enrichissement batch via API Claude ──
  const enrichBatch = async (tierName) => {
    const tiers = paretoCounts();
    const batch = tierName === "all" ? protocols : (tiers[tierName] || []);
    const toProcess = batch.filter(p => {
      const e = enriched[p.id_protocole];
      return !e; // pas encore enrichi
    });

    if (!toProcess.length) { log("warn", "Aucun protocole à enrichir dans cette sélection."); return; }

    setProcessing(true);
    abortRef.current = false;
    setProgress({ done: 0, total: toProcess.length, current: "" });
    log("ok", `Démarrage enrichissement ${toProcess.length} protocoles (${tierName})…`);

    const BATCH_SIZE = 5;
    let done = 0;

    for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
      if (abortRef.current) { log("warn", "Enrichissement interrompu."); break; }

      const chunk = toProcess.slice(i, i + BATCH_SIZE);
      setProgress({ done, total: toProcess.length, current: chunk.map(p => p.id_protocole).join(", ") });

      const userPrompt = `Enrichis ces ${chunk.length} protocoles. Pour chaque protocole, génère les champs manquants ou améliore les existants.

Réponds avec un tableau JSON : [{ "id_protocole": "...", "pathologie": "...", "definition_expert": "...", "synonymes_recherche": "...", "codes_ccam": "...", "alertes": "..." }, ...]

Protocoles à enrichir :
${JSON.stringify(chunk.map(p => ({
  id_protocole: p.id_protocole,
  libelle_cible: p.libelle_cible,
  type: p.type,
  zone_anat: p.zone_anat,
  cat_parent: p.cat_parent,
  frequence: p.frequence,
  pareto: p.pareto,
  specialite: p.specialite,
  pathologie: p.pathologie || "",
  definition_expert: p.definition_expert || "",
  synonymes_recherche: p.synonymes_recherche || "",
  codes_ccam: p.codes_ccam || "",
  alertes: p.alertes || ""
})), null, 0)}`;

      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
        });

        const data = await response.json();
        const text = (data.content || []).map(c => c.text || "").join("");
        const clean = text.replace(/```json|```/g, "").trim();

        let results;
        try { results = JSON.parse(clean); } catch { log("err", `Parsing JSON échoué batch ${i / BATCH_SIZE + 1}`); continue; }

        if (!Array.isArray(results)) results = [results];

        setEnriched(prev => {
          const next = { ...prev };
          results.forEach(r => { if (r.id_protocole) next[r.id_protocole] = r; });
          return next;
        });

        done += chunk.length;
        log("ok", `Batch ${Math.floor(i / BATCH_SIZE) + 1} : ${chunk.length} protocoles enrichis.`);
      } catch (e) {
        log("err", `Erreur API batch ${Math.floor(i / BATCH_SIZE) + 1} : ${e.message}`);
      }

      // Petite pause entre batches
      if (i + BATCH_SIZE < toProcess.length) await new Promise(r => setTimeout(r, 800));
    }

    setProgress({ done, total: toProcess.length, current: "Terminé" });
    setProcessing(false);
    setSqlReady(true);
    log("ok", `Enrichissement terminé : ${done}/${toProcess.length} protocoles.`);
  };

  // ── Génération SQL ──
  const generateSQL = () => {
    const lines = ["-- ENRICHISSEMENT THESAURUS — Généré " + new Date().toISOString(),
      "-- INTERDIT-SQL-01 : fichier .sql AVANT exécution", ""];
    Object.entries(enriched).forEach(([id, data]) => {
      const sets = [];
      ["pathologie", "definition_expert", "synonymes_recherche", "codes_ccam", "alertes"].forEach(f => {
        if (data[f] && data[f].trim()) {
          sets.push(`  ${f} = '${data[f].replace(/'/g, "''")}'`);
        }
      });
      if (sets.length) {
        sets.push("  updated_at = now()");
        lines.push(`UPDATE public.thesaurus_protocoles SET`);
        lines.push(sets.join(",\n"));
        lines.push(`WHERE id_protocole = '${id}';`);
        lines.push("");
      }
    });
    return lines.join("\n");
  };

  const downloadSQL = () => {
    const sql = generateSQL();
    const blob = new Blob([sql], { type: "text/sql;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "019_thesaurus_enrichissement.sql";
    a.click();
  };

  // ── Modification manuelle d'un champ enrichi ──
  const updateField = (id, field, value) => {
    setEnriched(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const auditData = protocols.length ? audit() : null;
  const tiers = protocols.length ? paretoCounts() : {};
  const enrichedCount = Object.keys(enriched).length;

  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: "#0f172a", color: "#e2e8f0", minHeight: "100vh", padding: "0" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderBottom: "1px solid #334155", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🧬</div>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", letterSpacing: ".02em" }}>Thesaurus Enricher</div>
          <div style={{ fontSize: ".7rem", color: "#64748b", letterSpacing: ".05em", textTransform: "uppercase" }}>BDB · Enrichissement IA · {enrichedCount}/{protocols.length || "—"} protocoles</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {["load", "audit", "enrich", "review", "sql"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid " + (tab === t ? "#7c3aed" : "#334155"),
              background: tab === t ? "#7c3aed22" : "transparent", color: tab === t ? "#a78bfa" : "#64748b",
              fontSize: ".72rem", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: ".05em",
              fontFamily: "inherit"
            }}>
              {t === "load" ? "📥 Charger" : t === "audit" ? "🔍 Audit" : t === "enrich" ? "🧠 Enrichir" : t === "review" ? "✏️ Revue" : "💾 SQL"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>

        {/* ══ TAB CHARGER ══ */}
        {tab === "load" && (
          <div>
            <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem", border: "1px solid #334155" }}>
              <h3 style={{ margin: "0 0 .5rem", fontSize: ".85rem", color: "#94a3b8", fontWeight: 600 }}>Charger les protocoles depuis Supabase</h3>
              <p style={{ fontSize: ".75rem", color: "#64748b", margin: "0 0 1rem" }}>
                Dans Supabase Dashboard → SQL Editor, exécuter :<br />
                <code style={{ background: "#0f172a", padding: "2px 8px", borderRadius: 4, color: "#a78bfa", fontSize: ".72rem" }}>
                  SELECT * FROM thesaurus_protocoles ORDER BY frequence DESC;
                </code><br />
                Puis copier le JSON résultat et coller ci-dessous.
              </p>
              <textarea
                placeholder='Coller le JSON ici — format [{"id_protocole":"ACT-0001", ...}, ...]'
                style={{
                  width: "100%", minHeight: 200, background: "#0f172a", border: "1px solid #334155",
                  borderRadius: 8, color: "#e2e8f0", padding: "1rem", fontSize: ".78rem",
                  fontFamily: "inherit", resize: "vertical"
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handlePaste(e.target.value); }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => {
                  const ta = document.querySelector("textarea");
                  if (ta?.value) handlePaste(ta.value);
                }} style={{
                  padding: "8px 20px", borderRadius: 6, border: "none",
                  background: "#7c3aed", color: "#fff", fontWeight: 600, cursor: "pointer",
                  fontSize: ".78rem", fontFamily: "inherit"
                }}>
                  Charger (Ctrl+Enter)
                </button>
                <span style={{ fontSize: ".72rem", color: "#64748b", alignSelf: "center" }}>
                  {protocols.length > 0 ? `✅ ${protocols.length} protocoles en mémoire` : "Aucune donnée chargée"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB AUDIT ══ */}
        {tab === "audit" && auditData && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {Object.entries(auditData).map(([field, stat]) => {
                const pct = Math.round(stat.filled / protocols.length * 100);
                return (
                  <div key={field} style={{ background: "#1e293b", borderRadius: 10, padding: "1rem", border: "1px solid #334155" }}>
                    <div style={{ fontSize: ".68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{field}</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: pct > 80 ? "#4ade80" : pct > 40 ? "#facc15" : "#f87171" }}>{pct}%</div>
                    <div style={{ fontSize: ".7rem", color: "#94a3b8" }}>{stat.filled} remplis / {stat.empty} vides</div>
                    <div style={{ height: 4, background: "#334155", borderRadius: 2, marginTop: 8 }}>
                      <div style={{ height: "100%", borderRadius: 2, width: pct + "%", background: pct > 80 ? "#4ade80" : pct > 40 ? "#facc15" : "#f87171", transition: "width .5s" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: "1rem", border: "1px solid #334155" }}>
              <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#94a3b8", marginBottom: 10 }}>Répartition Pareto</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { tier: "Critique", color: "#ef4444", label: "≥1000" },
                  { tier: "Standard", color: "#f59e0b", label: "300-999" },
                  { tier: "Secondaire", color: "#06b6d4", label: "50-299" },
                  { tier: "Rare", color: "#64748b", label: "<50" },
                ].map(t => (
                  <div key={t.tier} style={{ textAlign: "center", padding: "12px 8px", background: "#0f172a", borderRadius: 8 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: t.color }}>{(tiers[t.tier] || []).length}</div>
                    <div style={{ fontSize: ".65rem", color: "#64748b" }}>{t.tier} ({t.label})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB ENRICHIR ══ */}
        {tab === "enrich" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ background: "#1e293b", borderRadius: 10, padding: "1.25rem", border: "1px solid #334155" }}>
              <div style={{ fontSize: ".8rem", fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>Lancer l'enrichissement IA</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { key: "Critique", label: "Critiques (" + (tiers.Critique || []).length + ")", color: "#ef4444" },
                  { key: "Standard", label: "Standards (" + (tiers.Standard || []).length + ")", color: "#f59e0b" },
                  { key: "Secondaire", label: "Secondaires (" + (tiers.Secondaire || []).length + ")", color: "#06b6d4" },
                  { key: "Rare", label: "Rares (" + (tiers.Rare || []).length + ")", color: "#64748b" },
                  { key: "all", label: "TOUS (420)", color: "#7c3aed" },
                ].map(t => (
                  <button key={t.key} disabled={processing || !protocols.length}
                    onClick={() => enrichBatch(t.key)}
                    style={{
                      padding: "8px 16px", borderRadius: 6, border: `1px solid ${t.color}44`,
                      background: `${t.color}15`, color: t.color, fontWeight: 600, cursor: processing ? "wait" : "pointer",
                      fontSize: ".72rem", fontFamily: "inherit", opacity: processing ? 0.5 : 1
                    }}>
                    🧠 {t.label}
                  </button>
                ))}
                {processing && (
                  <button onClick={() => { abortRef.current = true; }} style={{
                    padding: "8px 16px", borderRadius: 6, border: "1px solid #f87171",
                    background: "#f8717115", color: "#f87171", fontWeight: 600, cursor: "pointer",
                    fontSize: ".72rem", fontFamily: "inherit"
                  }}>⏹ Stop</button>
                )}
              </div>

              {progress.total > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "#94a3b8", marginBottom: 4 }}>
                    <span>{progress.done} / {progress.total}</span>
                    <span>{Math.round(progress.done / progress.total * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: "#334155", borderRadius: 3 }}>
                    <div style={{
                      height: "100%", borderRadius: 3, background: "#7c3aed",
                      width: Math.round(progress.done / progress.total * 100) + "%",
                      transition: "width .3s"
                    }} />
                  </div>
                  {progress.current && <div style={{ fontSize: ".65rem", color: "#64748b", marginTop: 4 }}>{progress.current}</div>}
                </div>
              )}

              <div style={{ fontSize: ".72rem", color: "#475569", marginTop: 8 }}>
                Chaque batch = 5 protocoles × 1 appel API Claude Sonnet. Données figées = résultat stable.
              </div>
            </div>

            {/* Logs */}
            <div style={{
              background: "#0f172a", borderRadius: 10, border: "1px solid #334155",
              maxHeight: 300, overflowY: "auto", padding: "1rem", fontFamily: "'Courier New', monospace", fontSize: ".72rem"
            }}>
              {logs.length === 0 ? (
                <span style={{ color: "#475569" }}>Aucun log.</span>
              ) : logs.map((l, i) => (
                <div key={i} style={{ color: l.level === "ok" ? "#4ade80" : l.level === "warn" ? "#facc15" : l.level === "err" ? "#f87171" : "#94a3b8", marginBottom: 2 }}>
                  [{l.time}] {l.msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB REVUE ══ */}
        {tab === "review" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {["all", "Critique", "Standard", "Secondaire", "Rare"].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "5px 12px", borderRadius: 5, border: "1px solid " + (filter === f ? "#7c3aed" : "#334155"),
                  background: filter === f ? "#7c3aed22" : "transparent", color: filter === f ? "#a78bfa" : "#64748b",
                  fontSize: ".68rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                }}>{f === "all" ? "Tous" : f}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: ".7rem", color: "#64748b", alignSelf: "center" }}>
                {enrichedCount} enrichis sur {protocols.length}
              </span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: ".72rem" }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    {["ID", "Libellé", "Pareto", "Pathologie", "Définition expert", "Synonymes", "CCAM", "Alertes"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #334155", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {protocols
                    .filter(p => filter === "all" || p.pareto === filter)
                    .filter(p => enriched[p.id_protocole])
                    .slice(0, 50)
                    .map(p => {
                      const e = enriched[p.id_protocole] || {};
                      return (
                        <tr key={p.id_protocole} style={{ borderBottom: "1px solid #1e293b" }}>
                          <td style={{ padding: "6px 10px", color: "#64748b", whiteSpace: "nowrap" }}>{p.id_protocole}</td>
                          <td style={{ padding: "6px 10px", fontWeight: 600, color: "#e2e8f0", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.libelle_cible}</td>
                          <td style={{ padding: "6px 10px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: ".65rem", fontWeight: 600,
                              background: p.pareto === "Critique" ? "#ef444420" : p.pareto === "Standard" ? "#f59e0b20" : "#06b6d420",
                              color: p.pareto === "Critique" ? "#f87171" : p.pareto === "Standard" ? "#fbbf24" : "#22d3ee"
                            }}>{p.pareto}</span>
                          </td>
                          {["pathologie", "definition_expert", "synonymes_recherche", "codes_ccam", "alertes"].map(f => (
                            <td key={f} style={{ padding: "4px 6px" }}>
                              <input
                                value={e[f] || ""}
                                onChange={(ev) => updateField(p.id_protocole, f, ev.target.value)}
                                style={{
                                  width: "100%", background: "#0f172a", border: "1px solid #334155", borderRadius: 4,
                                  color: e[f] ? "#e2e8f0" : "#475569", padding: "4px 6px", fontSize: ".68rem",
                                  fontFamily: "inherit", minWidth: f === "definition_expert" ? 200 : f === "synonymes_recherche" ? 150 : 80
                                }}
                                title={e[f] || ""}
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {enrichedCount === 0 && (
                <div style={{ textAlign: "center", padding: "2rem", color: "#475569", fontSize: ".78rem" }}>
                  Aucun protocole enrichi. Lancer l'enrichissement dans l'onglet 🧠 Enrichir.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB SQL ══ */}
        {tab === "sql" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={downloadSQL} disabled={!enrichedCount} style={{
                padding: "8px 20px", borderRadius: 6, border: "none",
                background: enrichedCount ? "#4ade80" : "#334155", color: enrichedCount ? "#0f172a" : "#64748b",
                fontWeight: 700, cursor: enrichedCount ? "pointer" : "default", fontSize: ".78rem", fontFamily: "inherit"
              }}>
                💾 Télécharger 019_thesaurus_enrichissement.sql
              </button>
              <span style={{ fontSize: ".7rem", color: "#64748b", alignSelf: "center" }}>
                {enrichedCount} UPDATE statements
              </span>
            </div>
            <pre style={{
              background: "#0f172a", border: "1px solid #334155", borderRadius: 10,
              padding: "1rem", fontSize: ".68rem", color: "#94a3b8", maxHeight: 500,
              overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all"
            }}>
              {enrichedCount ? generateSQL() : "-- Aucune donnée enrichie. Lancer l'enrichissement d'abord."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
