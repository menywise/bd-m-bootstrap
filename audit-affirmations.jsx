import { useState, useCallback, useMemo } from "react";

const A = [
["arch","Architecture & Stack",[
["ARCH-001","BDB = vanilla HTML/JS/CSS + Bootstrap 5.3.3 + Supabase cloud.","Memory"],
["ARCH-002","Déploiement FTP sur OVH shared hosting.","Memory"],
["ARCH-003","URL prod : https://hashtag.manuelrohaut.fr/bdb/","Memory"],
["ARCH-004","Projet Supabase : ecpzrygzdugwwkqbsajn.supabase.co","DATA_MODEL"],
["ARCH-005","Zéro npm, zéro framework, CDN only.","Memory"],
["ARCH-006","Docker local abandonné. Supabase cloud = backend exclusif.","Memory"],
["ARCH-007","3 couches : L1 universel, L2 instance, L3 créateur (jamais shippé).","Memory"],
["ARCH-008","L3 dans createur/, gardé par isCreator.","Memory"],
["ARCH-009","theme-base.css @63905396 = norme CDS exclusive.","CATALOGUE_BS"],
["ARCH-010","cds-overrides.css v2.0.6.","Memory"],
["ARCH-011","bdb-shell.js v2.5.1.","Memory"],
["ARCH-012","Chaînage CSS : BS→theme-base→BI→cds-overrides→module.","skill:cds"],
["ARCH-013","Chaînage JS : BS→Supabase SDK→supabase-client→bdb-shell→module.","Memory"],
["ARCH-014","BDB jamais utilisé per-op.","Memory"],
["ARCH-015","BDB : bureau, smartphone, pause, domicile.","Memory"],
["ARCH-016","window.bdb = unique instance Supabase.","DATA_MODEL"],
["ARCH-017","PWA Android : sw.js v1.1.0, manifest.json, offline.html.","Memory"],
["ARCH-018","Manu = IDE (pas IBODE), 20 ans bloc.","Memory"],
["ARCH-019","Manu = seul créateur/architecte BDB.","Memory"],
["ARCH-020","Cible perf : FCP < 2s sur 4G.","skill:perf"],
]],
["acces","Accès & Niveaux",[
["ACC-001","Hiérarchie : isCreator → isAdmin → isMember → isDemo.","skill:acces"],
["ACC-002","Chaque niveau contient les droits inférieurs.","skill:acces"],
["ACC-003","isDemo = toujours true.","skill:acces"],
["ACC-004","isMember = role !== 'invite'.","skill:acces"],
["ACC-005","isAdmin = role === 'admin' || is_creator.","skill:acces"],
["ACC-006","isCreator = is_creator === true dans profiles.","skill:acces"],
["ACC-007","INTERDIT comparer role à 'member' (anglais). Enum = FR.","skill:acces"],
["ACC-008","INTERDIT recalculer isAdmin/isMember/isCreator dans un module.","skill:acces"],
["ACC-009","INTERDIT requêter profiles/user_roles pour vérifier rôle.","skill:acces"],
["ACC-010","window.bdbUser injecté par shell — jamais recoder.","skill:acces"],
]],
["interdits","Interdits Code",[
["INT-001","console.log interdit. Seul console.error dans catch.","DATA_MODEL"],
["INT-002","escHtml() obligatoire sur innerHTML + donnée DB.","DATA_MODEL"],
["INT-003","onclick= inline interdit.","skill:cds"],
["INT-004","style= statique interdit (sauf honeypot/progressbar).","skill:cds"],
["INT-005","Font Awesome interdit. Bootstrap Icons only.","skill:cds"],
["INT-006","Zéro Inter/Rubik/Google Fonts. Font = system-ui.","skill:cds"],
["INT-007","Zéro Flaticon.","skill:cds"],
["INT-008","Zéro @latest CDN. Versions figées.","skill:cds"],
["INT-009","Modifier shell/supabase-client/cds-overrides = accord Manu.","DATA_MODEL"],
["INT-010","Dupliquer URL/clé Supabase interdit.","DATA_MODEL"],
["INT-011","2e client Supabase interdit.","DATA_MODEL"],
["INT-012","Migration SQL = fichier .sql numéroté AVANT exécution.","DATA_MODEL"],
["INT-013","ERREUR-13 : jamais UPDATE protocole_operatoire si protocole_id mappé.","DATA_MODEL"],
["INT-014","Zéro CCAM inventé — vide > faux.","skill:ccam"],
["INT-015","Jamais fichiers delta — fichiers complets.","Memory"],
["INT-016","INTERDIT psql direct sur cloud.","Memory"],
["INT-017",".select() obligatoire sur .update()/.delete().","DATA_MODEL"],
["INT-018","Limite 1000 lignes Supabase — paginer.","DATA_MODEL"],
["INT-019","atelier_fondation n'existe pas en DB.","Memory"],
["INT-020","Noms propres INTERDITS dans livrables. Rôles seuls.","Memory"],
["INT-021","INTERDIT-CLINIQUE-01 : ortho ≠ neuro même nom.","skill:clinique"],
["INT-022","1 vote/user/item immuable.","skill:participatif"],
["INT-023","Admin ne voit jamais données nominatives.","skill:participatif"],
["INT-024","INTERDIT classement nominatif membres.","skill:participatif"],
["INT-025","INTERDIT thèmes dark artifacts/outils BDB.","Memory:userPrefs"],
["INT-026","Diagramme Venn ikigai = interdit.","PEDAGOGIE"],
["INT-027","INTERDIT container dans container (BS).","skill:bs5"],
]],
["db","Data Model",[
["DB-001","131 tables public.","DATA_MODEL"],
["DB-002","5 enums PostgreSQL.","DATA_MODEL"],
["DB-003","80+ CHECK constraints.","DATA_MODEL"],
["DB-004","35 RPC functions.","DATA_MODEL"],
["DB-005","51 triggers actifs.","DATA_MODEL"],
["DB-006","8 extensions (pg_trgm, unaccent, pgcrypto, uuid-ossp...).","DATA_MODEL"],
["DB-007","Dernière migration : 170.","DATA_MODEL"],
["DB-008","Max session : 112.","Memory"],
["DB-009","profiles : id (PK) ≠ user_id (FK auth.users).","DATA_MODEL"],
["DB-010","app_role = admin/membre/invite (FR).","DATA_MODEL"],
["DB-011","is_creator = booléen profiles.","DATA_MODEL"],
["DB-012","thesaurus_protocoles = 395.","DATA_MODEL"],
["DB-013","thesaurus_interventions = 89 653.","DATA_MODEL"],
["DB-014","referentiel_ccam = 8 292 ATIH V82.","DATA_MODEL"],
["DB-015","glossaire = 567.","DATA_MODEL"],
["DB-016","atelier_principes = 187 actifs, 18 catégories.","DATA_MODEL"],
["DB-017","atelier_sessions = 102.","DATA_MODEL"],
["DB-018","atelier_decisions = 424.","DATA_MODEL"],
["DB-019","17 tables demo_*.","DATA_MODEL"],
["DB-020","libelle_cible + FREQUENCE = immuables.","DATA_MODEL"],
["DB-021","id_protocole immuable (R25).","DATA_MODEL"],
["DB-022","codes_ccam dénormalisé, sync trigger.","DATA_MODEL"],
["DB-023","information_schema prime sur tout doc.","DATA_MODEL"],
["DB-024","profiles_directory = table matérialisée.","DATA_MODEL"],
["DB-025","planning.salle = strings '05','06','07','08'.","DATA_MODEL"],
["DB-026","id = UUID partout (sauf staging/chu).","DATA_MODEL"],
["DB-027","handle_new_user() trigger → profiles + user_roles.","DATA_MODEL"],
["DB-028","Glossaire 12 catégories valides.","skill:glossaire"],
]],
["cds","CDS & Bootstrap",[
["CDS-001","BS 5.3.3 + BI 1.11.1.","CATALOGUE_BS"],
["CDS-002","Cards = seul conteneur BO (RÈGLE-BO-03).","CATALOGUE_BS"],
["CDS-003","Carousel + Scrollspy = INTERDIT.","CATALOGUE_BS"],
["CDS-004","Nav tabs only, nav-pills interdit.","CATALOGUE_BS"],
["CDS-005","Navbar/Offcanvas = SHELL exclusif.","CATALOGUE_BS"],
["CDS-006","Toasts = bdbToast().","CATALOGUE_BS"],
["CDS-007","Skeleton > spinners pour chargements longs.","CATALOGUE_BS"],
["CDS-008","text-bg-* préféré à bg-* (WCAG).","CATALOGUE_BS"],
["CDS-009","Grid : .row.g-3 + .col-12.col-md-6.col-lg-{3|4|6}.","CATALOGUE_BS"],
["CDS-010","container-fluid modules, container site/.","skill:bs5"],
["CDS-011","Menu avatar = .bdb-user-menu custom.","CATALOGUE_BS"],
["CDS-012","#bdb-shell = 1er enfant #wrapper.","skill:cds"],
["CDS-013","Template V5 : _template-member-v5.html.","Memory"],
["CDS-014","126/126 PASS audit V5.","Memory"],
]],
["admin","Pattern Admin",[
["ADM-001","admin.html standalone par module (depuis S#84).","skill:admin-be"],
["ADM-002","Slot inline = OBSOLÈTE.","skill:admin-be"],
["ADM-003","ISO-01→05 : isolation admin/index.","skill:admin-be"],
["ADM-004","Hub admin : admin/index.html.","skill:admin-be"],
["ADM-005","Composants partagés = js/bdb-[nom].js + init().","skill:shared"],
["ADM-006","Composant partagé ≠ module.","skill:shared"],
]],
["hia","Contrat Humain-IA",[
["HIA-001","Manu = humain, autorité finale. Claude = outil.","skill:contrat"],
["HIA-002","DISC D, Ennéagramme 8.","skill:contrat"],
["HIA-003","Chaque token compte.","skill:contrat"],
["HIA-004","Politesse de façade = perte de temps.","skill:contrat"],
["HIA-005","Verbaliser avant choix à impact.","skill:contrat"],
["HIA-006","ELI15 > QCM.","Memory"],
["HIA-007","Brainstorm = déclaré explicitement.","Memory"],
]],
["cli","Contexte Clinique",[
["CLI-001","Même mot, 2 spécialités = 2 réalités.","skill:clinique"],
["CLI-002","ORTHO=DD. NEURO=DV.","skill:clinique"],
["CLI-003","Nerfs périphériques = ORTHO.","Memory"],
["CLI-004","Jamais protocole par chirurgien. Racine+variantes.","skill:combo"],
["CLI-005","Picking = fluctuant par nature.","skill:combo"],
["CLI-006","Complétude visible et honnête.","skill:combo"],
["CLI-007","OPTIM = matière première, pas vérité.","skill:optim"],
["CLI-008","Exports OPTIM en LATIN1.","skill:optim"],
["CLI-009","CCAM lettre 4 = voie d'abord. ≠ lettre 4 = 2 protocoles.","skill:lexique"],
["CLI-010","Gestes tendineux = jamais fusionner.","skill:lexique"],
]],
["ped","Pédagogie",[
["PED-001","BDB = dispositif didactique, pas app KM.","PEDAGOGIE"],
["PED-002","10 axes + POULET intégrateur.","PEDAGOGIE"],
["PED-003","3 couches : Compétence/Progression/Sens.","PEDAGOGIE"],
["PED-004","POULET = P/O/U/L/E/T (Barrand 2025).","PEDAGOGIE"],
["PED-005","4 styles Kolb non retenus. Cycle seul.","PEDAGOGIE"],
["PED-006","9 types ennéa non retenus. 3 centres seuls.","PEDAGOGIE"],
["PED-007","Attribution sources obligatoire.","PEDAGOGIE"],
["PED-008","Benner 5 stades. Boudreault 6 niveaux.","PEDAGOGIE"],
["PED-009","Savoir-agir = intégration, pas 4ᵉ savoir.","PEDAGOGIE"],
["PED-010","Réf IBODE 2022 : 5 blocs, 9 compétences, 3 rôles.","PEDAGOGIE"],
["PED-011","BDB = compétences 7-8-9 référentiel.","PEDAGOGIE"],
["PED-012","Contenu mono-centré = déséquilibré.","PEDAGOGIE"],
["PED-013","Protocole sans variantes = menteur.","PEDAGOGIE"],
]],
["man","Manifeste & Principes",[
["MAN-001","P1 Transverse : partout ou nulle part.","skill:manifeste"],
["MAN-002","P2 Démo = Seed + Vitrine.","skill:manifeste"],
["MAN-003","P3 Masquer ≠ Détruire.","skill:manifeste"],
["MAN-004","P4 Import = outil admin.","skill:manifeste"],
["MAN-005","P5 Auto-explicatif, test Julie 30s.","skill:manifeste"],
["MAN-006","P6 Instanciable.","skill:manifeste"],
["MAN-007","Contenu = propriété institution.","Memory"],
["MAN-008","Workflow : draft → admin → active.","Memory"],
["MAN-009","Modération = sécurité, pas censure.","skill:participatif"],
["MAN-010","DISC = forme, jamais fond.","skill:participatif"],
]],
["per","Personas",[
["PER-001","Test Julie : 30s, zéro jargon.","skill:persona"],
["PER-002","Test Sophie : configure en 30min sans Manu.","skill:persona"],
["PER-003","Test Anne-Cécile : zéro hardcode Chénieux.","skill:persona"],
["PER-004","Test Ewan : conventions hors projet Claude.","skill:persona"],
["PER-005","Test Brigitte : budget sans jargon tech.","skill:persona"],
["PER-006","4 docs : utilisateur/admin/dev/atelier.","skill:persona"],
["PER-007","Wording AT + hypnose conversationnelle.","Memory"],
]],
["ber","Bernard",[
["BER-001","9w8 intégré 3, instinctif, DISC S/C, Spirale jaune.","skill:bernard"],
["BER-002","Signature : vu → action → objectifs.","skill:bernard"],
["BER-003","'Je ne sais pas' sec = INTERDIT.","skill:bernard"],
["BER-004","8 règles JURISP-BERNARD en DB.","skill:bernard"],
]],
["gov","Gouvernance & Sessions",[
["GOV-001","5 fondateurs 00_GOUVERNANCE/.","Memory"],
["GOV-002","MANIFESTE V1.2.0 prime sur tout.","Memory"],
["GOV-003","GPS V1.0.0 = 5 points avant production.","Memory"],
["GOV-004","FAB(3R) = 7 dimensions obligatoires.","skill:fab3r"],
["GOV-005","Conseil = 5 Lunettes.","skill:conseil"],
["GOV-006","Ouverture = atelier_prompt_reprise().","skill:atelier"],
["GOV-007","Clôture = atelier_cloture_session().","skill:atelier"],
["GOV-008","3 SELECT préflight avant clôture.","Memory"],
["GOV-009","Source vérité = tables atelier_*.","skill:atelier"],
]],
["arb","Arborescence S#108",[
["ARB-001","HTML shell : profondeur 0 ou 2.","S108"],
["ARB-002","app/ = profondeur 1, exception Option A.","S108"],
["ARB-003","13 HTML racine → app/.","S108"],
["ARB-004","~60 HTML → createur/.","S108"],
["ARB-005","17 redirections 301.","Memory"],
["ARB-006","5 _RESERVE.md.","Memory"],
]],
["outils","Outils & Env",[
["TL-001","Windows, C:\\DEV\\BIBLE_DE_BLOC\\.","Memory"],
["TL-002",".env racine hors git.","Memory"],
["TL-003","Supabase CLI v2.75.0.","Memory"],
["TL-004","INTERDIT-PS1 : triple safety net.","Memory"],
["TL-005","8 PS1 + 8 .bat.","Memory"],
["TL-006","Orchestre : Claude+Perplexity+Deepseek+Gemini.","Memory"],
["TL-007","Licence vérifiée avant intégration externe.","skill:licence"],
["TL-008","Pas de licence = interdit.","skill:licence"],
["TL-009","Collaborateur externe = matrice droits stricte.","skill:onboard"],
["TL-010","ARCHITECTURE = Manu seul.","skill:onboard"],
]],
["qua","Qualité",[
["QUA-001","Diagnostiquer AVANT corriger.","skill:error"],
["QUA-002","5 bugs invisibles pour Claude.","skill:recettage"],
["QUA-003","FTP = irréversible. Pas de CI/CD.","skill:ftp"],
["QUA-004","Checklist pre-flight FTP obligatoire.","skill:ftp"],
["QUA-005","WCAG 2.1 AA proactif, non bloquant.","skill:a11y"],
["QUA-006","Pacte produit : promesse ↔ livraison.","skill:pacte"],
["QUA-007","Métriques = signaux réels, pas vanity.","skill:pacte"],
["QUA-008","Contenu routé au bon module.","skill:router"],
["QUA-009","Donnée métier = bulletin de routage.","skill:data-router"],
]],
];

const TOTAL = A.reduce((a,c) => a + c[2].length, 0);

export default function Audit() {
  const [ans, setAns] = useState({});
  const [filter, setFilter] = useState("all");
  const [openCats, setOpenCats] = useState(new Set(A.map(c=>c[0])));

  const toggle = (id, val) => setAns(p => ({...p, [id]: p[id] === val ? null : val}));
  const [comments, setComments] = useState({});
  const setComment = (id, t) => setComments(p => ({...p, [id]: t}));

  const stats = useMemo(() => {
    const v = Object.values(ans).filter(x=>x===true).length;
    const f = Object.values(ans).filter(x=>x===false).length;
    return {v, f, p: TOTAL-v-f};
  },[ans]);

  const doSend = useCallback(() => {
    const vv=[], ff=[];
    A.forEach(([,,items]) => items.forEach(([id,txt]) => {
      if(ans[id]===true) vv.push(id+": "+txt);
      if(ans[id]===false) ff.push(id+": "+txt+(comments[id]?" → "+comments[id]:""));
    }));
    sendPrompt([
      `AUDIT BDB — ${stats.v}V ${stats.f}F ${stats.p}attente`,
      stats.v?"\n## VRAI ("+stats.v+")":"", ...vv,
      stats.f?"\n## FAUX ("+stats.f+")":"", ...ff
    ].filter(Boolean).join("\n"));
  },[ans,comments,stats]);

  const toggleCat = id => setOpenCats(p => {const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n;});

  const pct = Math.round(((stats.v+stats.f)/TOTAL)*100);

  const btn = {border:"none",cursor:"pointer",borderRadius:"4px",fontWeight:700,fontSize:"12px"};

  return (
    <div style={{background:"#f1f5f9",minHeight:"100vh",fontFamily:"-apple-system,sans-serif",color:"#1e293b"}}>
      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:10,background:"#fff",borderBottom:"2px solid #2563eb",padding:"10px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
          <div>
            <span style={{fontSize:"15px",fontWeight:800}}><span style={{color:"#2563eb"}}>BDB</span> Audit</span>
            <span style={{fontSize:"11px",color:"#64748b",marginLeft:"8px"}}>{TOTAL} aff.</span>
          </div>
          <button onClick={doSend} style={{...btn,padding:"6px 14px",background:"#2563eb",color:"#fff",fontSize:"13px"}}>
            📤 Envoyer {stats.v+stats.f>0?`(${stats.v}V ${stats.f}F)`:""} à Claude
          </button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"6px"}}>
          <div style={{flex:1,height:"5px",background:"#e2e8f0",borderRadius:"3px",overflow:"hidden",display:"flex"}}>
            <div style={{width:`${(stats.v/TOTAL)*100}%`,background:"#16a34a",transition:"0.3s"}}/>
            <div style={{width:`${(stats.f/TOTAL)*100}%`,background:"#dc2626",transition:"0.3s"}}/>
          </div>
          <span style={{fontSize:"12px",fontWeight:700,color:"#16a34a",fontFamily:"monospace"}}>✓{stats.v}</span>
          <span style={{fontSize:"12px",fontWeight:700,color:"#dc2626",fontFamily:"monospace"}}>✗{stats.f}</span>
          <span style={{fontSize:"12px",color:"#94a3b8",fontFamily:"monospace"}}>{pct}%</span>
        </div>
        <div style={{display:"flex",gap:"4px"}}>
          {[["all","Toutes",TOTAL],["pending","Attente",stats.p],["true","Vrai",stats.v],["false","Faux",stats.f]].map(([k,l,n])=>(
            <button key={k} onClick={()=>setFilter(k)} style={{...btn,padding:"3px 10px",fontSize:"11px",
              background:filter===k?"#2563eb":"#f1f5f9",color:filter===k?"#fff":"#64748b",borderRadius:"12px"
            }}>{l} ({n})</button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div style={{padding:"10px 14px"}}>
        {A.map(([catId, catName, items]) => {
          const filtered = items.filter(([id])=>{
            if(filter==="pending") return ans[id]==null;
            if(filter==="true") return ans[id]===true;
            if(filter==="false") return ans[id]===false;
            return true;
          });
          if(filtered.length===0 && filter!=="all") return null;
          const done = items.filter(([id])=>ans[id]!=null).length;
          const isOpen = openCats.has(catId);
          return (
            <div key={catId} style={{marginBottom:"4px",border:"1px solid #e2e8f0",borderRadius:"6px",overflow:"hidden",background:"#fff"}}>
              <button onClick={()=>toggleCat(catId)} style={{
                width:"100%",display:"flex",alignItems:"center",gap:"8px",
                padding:"8px 12px",background:"#f8fafc",border:"none",cursor:"pointer",textAlign:"left"
              }}>
                <span style={{color:"#94a3b8",fontSize:"11px",transform:isOpen?"rotate(90deg)":"none",transition:"0.15s"}}>▶</span>
                <span style={{fontWeight:700,fontSize:"12px",flex:1}}>{catName}</span>
                <span style={{color:"#64748b",fontSize:"10px",fontFamily:"monospace"}}>{done}/{items.length}</span>
              </button>
              {isOpen && filtered.map(([id,txt,src]) => {
                const a = ans[id];
                const showF = a===false;
                return (
                  <div key={id} style={{padding:"6px 12px",borderBottom:"1px solid #f1f5f9",
                    background:a===true?"#f0fdf4":a===false?"#fef2f2":"#fff"}}>
                    <div style={{display:"flex",gap:"6px",alignItems:"flex-start"}}>
                      <span style={{color:"#94a3b8",fontFamily:"monospace",fontSize:"9px",minWidth:"50px",paddingTop:"4px"}}>{id}</span>
                      <p style={{flex:1,margin:0,fontSize:"13px",lineHeight:1.4}}>{txt}</p>
                      <div style={{display:"flex",gap:"2px",flexShrink:0}}>
                        <button onClick={()=>toggle(id,true)} style={{...btn,width:"28px",height:"24px",
                          border:a===true?"2px solid #16a34a":"1px solid #d1d5db",
                          background:a===true?"#dcfce7":"#fff",color:a===true?"#16a34a":"#d1d5db"
                        }}>V</button>
                        <button onClick={()=>toggle(id,false)} style={{...btn,width:"28px",height:"24px",
                          border:a===false?"2px solid #dc2626":"1px solid #d1d5db",
                          background:a===false?"#fecaca":"#fff",color:a===false?"#dc2626":"#d1d5db"
                        }}>F</button>
                      </div>
                    </div>
                    <span style={{fontSize:"9px",color:"#94a3b8",paddingLeft:"56px"}}>{src}</span>
                    {showF && (
                      <input type="text" value={comments[id]||""} placeholder="Correction..."
                        onChange={e=>setComment(id,e.target.value)}
                        style={{display:"block",marginTop:"4px",marginLeft:"56px",width:"calc(100% - 56px)",
                          padding:"4px 8px",border:"1px solid #fca5a5",borderRadius:"4px",fontSize:"12px",color:"#1e293b"}}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{padding:"12px",textAlign:"center"}}>
        <p style={{color:"#94a3b8",fontSize:"10px",margin:0}}>Lot 1 — docs + Memory + skills · Valide puis clique 📤</p>
      </div>
    </div>
  );
}
