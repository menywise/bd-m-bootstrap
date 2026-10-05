/**
 * argumentaire-kpi-app.js — V2
 * Module L3 — Argumentaire KPI Bloc Opératoire
 * Zéro console.log · Zéro onclick · Zéro localStorage
 */

function escHtml(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function hide(id){document.getElementById(id).classList.add('d-none');}
function show(id){document.getElementById(id).classList.remove('d-none');}

/* ═══════════ KPI DATA ═══════════ */
const KPI={
temps:[
{id:'tvo',name:'Temps de Vacation Offert (TVO)',impact:'indirect',
 def:'Durée totale des plages horaires mises à disposition des chirurgiens pour opérer. C\'est le temps « ouvert » dans le planning du bloc.',
 bdb:'BDB ne modifie pas directement les plages horaires. Mais un bloc mieux organisé peut ajuster son offre au besoin réel — éviter de sur-ouvrir des vacations inutilisées.'},
{id:'tros',name:'Temps Réel d\'Occupation des Salles (TROS)',impact:'direct',
 def:'Le temps total pendant lequel une salle est réellement occupée : de la préparation du patient jusqu\'au bionettoyage après sa sortie. C\'est la somme de 5 temps : préparation (T1), anesthésie (T2), acte chirurgical (T3), pansement (T4), nettoyage (T5).',
 bdb:'Impact direct sur T1 : l\'IDE ou l\'IBODE qui connaît le protocole via BDB prépare plus vite. Impact indirect sur T5 : le protocole de remise en condition est connu, moins d\'hésitation entre deux patients.'},
{id:'trov',name:'Temps Réel d\'Occupation de la Vacation (TROV)',impact:'direct',
 def:'Le temps effectivement consacré aux interventions pendant la vacation prévue. La cible est de 85 à 90% du temps de vacation offert. Si ce taux est bas, cela signifie que du temps payé n\'est pas utilisé.',
 bdb:'Moins de retard au démarrage = plus de temps réellement occupé. La novice qui a consulté la fiche BDB la veille prépare en autonomie dès le matin.'},
{id:'turnover',name:'Temps de remise en condition entre deux patients',impact:'direct',
 def:'Le temps entre la sortie d\'un patient et l\'entrée du suivant. L\'objectif ANAP est de 15 minutes pour un acte long, 5 minutes pour un acte court.',
 bdb:'Quand la fiche d\'installation du patient suivant et la checklist matériel sont connues à l\'avance, la préparation peut commencer en parallèle du bionettoyage. Chaque minute gagnée vaut 12 euros.'},
{id:'demarrage',name:'Démarrage tardif',impact:'direct',
 def:'L\'écart entre l\'heure prévue de début de la vacation et l\'heure réelle d\'entrée du premier patient en salle. L\'objectif ANAP est de rester sous 5% du temps de vacation.',
 bdb:'Quand les préférences du chirurgien sont documentées, le matériel pré-listé et l\'installation connue, le démarrage se fait à l\'heure. C\'est l\'un des gains les plus visibles dès la première semaine.'},
{id:'finprecoce',name:'Fin précoce',impact:'indirect',
 def:'Le temps restant entre la sortie du dernier patient et la fin officielle de la vacation. Cela représente du temps payé mais inutilisé.',
 bdb:'Quand l\'équipe connaît les durées habituelles de chaque protocole, la programmation est plus précise. Moins de trous en fin de journée.'},
{id:'debordement',name:'Taux de débordement',impact:'indirect',
 def:'Le pourcentage d\'interventions réalisées en dehors des bornes horaires de la vacation. L\'objectif est de rester sous 10%.',
 bdb:'Une équipe rodée sur les protocoles produit des durées plus prévisibles. Moins d\'effet domino en cascade sur les interventions suivantes.'}
],
perf:[
{id:'txocc',name:'Taux d\'occupation des salles (TROS / TVO)',impact:'direct',
 def:'Le pourcentage du temps de vacation réellement utilisé par des interventions. Un taux faible signifie que des salles tournent à vide.',
 bdb:'Chaque minute gagnée en préparation du patient ou entre deux patients augmente directement ce taux. Effet multiplicateur sur le nombre d\'interventions réalisables dans une journée.'},
{id:'txvac',name:'Taux d\'occupation des vacations (TROV / TVO)',impact:'direct',
 def:'Le pourcentage du temps de vacation utilisé par l\'activité chirurgicale prévue pour cette spécialité. Permet de voir si chaque spécialité exploite bien ses plages.',
 bdb:'Même mécanisme que le taux d\'occupation des salles, mais ciblé par spécialité. BDB documente les protocoles par spécialité chirurgicale.'},
{id:'annulation',name:'Taux d\'annulation ou de report',impact:'direct',
 def:'Le pourcentage d\'interventions programmées qui n\'ont finalement pas lieu. Chaque annulation est une perte sèche de temps de vacation.',
 bdb:'Causes fréquentes d\'annulation : matériel manquant, installation inconnue, dossier incomplet, picking non fait. BDB réduit ces causes en rendant l\'information accessible avant l\'entrée au bloc.'},
{id:'reprise',name:'Taux de reprise chirurgicale',impact:'indirect',
 def:'Le pourcentage de patients réopérés dans les 30 jours suivant l\'intervention initiale.',
 bdb:'Via les compétences non techniques : une meilleure communication dans l\'équipe et une check-list mieux préparée réduisent les erreurs. L\'impact est indirect mais documenté par les travaux de Flin et Maran sur la sécurité au bloc.'}
],
qualite:[
{id:'checklist',name:'Conformité à la check-list de sécurité (HAS)',impact:'direct',
 def:'La vérification effective des 3 temps de la check-list de la Haute Autorité de Santé : avant l\'anesthésie, avant l\'incision, avant la sortie de salle. C\'est une obligation de certification.',
 bdb:'L\'équipe qui connaît le protocole répond plus vite et plus juste à chaque item de la check-list. BDB structure la connaissance qui alimente ces vérifications.'},
{id:'eigs',name:'Événements indésirables graves (EIGS)',impact:'indirect',
 def:'Le nombre d\'événements indésirables graves déclarés en lien avec le bloc opératoire. Chaque EIGS fait l\'objet d\'une analyse des causes.',
 bdb:'La transmission du savoir tacite entre collègues permet l\'anticipation. Le cas Bromiley (2005) illustre ce qu\'une défaillance de communication d\'équipe peut produire lors d\'une intervention de routine.'},
{id:'iso',name:'Infections du site opératoire (ISO)',impact:'indirect',
 def:'Le pourcentage d\'infections survenant après l\'opération sur la zone opérée.',
 bdb:'Les protocoles d\'hygiène et de préparation documentés dans BDB sont accessibles à toute l\'équipe — y compris les intérimaires qui découvrent le bloc.'}
],
rh:[
{id:'turnoverrh',name:'Taux de départ du personnel (turnover)',impact:'direct',
 def:'Le pourcentage de départs par an dans l\'équipe du bloc. Un remplacement coûte entre 50 et 60 000 euros tout compris (recrutement, intérim, perte de productivité).',
 bdb:'Un onboarding structuré, un savoir accessible, un sentiment d\'appartenance à une équipe qui documente ses pratiques : tout cela contribue à la rétention. L\'AORN documente un retour de 300% par infirmière formée.'},
{id:'integration',name:'Durée d\'intégration d\'une novice',impact:'direct',
 def:'Le temps nécessaire avant qu\'une nouvelle arrivante soit autonome au poste. Classiquement 6 à 12 mois au bloc opératoire.',
 bdb:'L\'accès aux fiches d\'intervention, aux protocoles, aux préférences chirurgien AVANT le premier jour en salle accélère l\'intégration. L\'organisateur de parcours guide étape par étape. Réduction estimée de 20 à 30%.'},
{id:'interim',name:'Coût du personnel intérimaire',impact:'direct',
 def:'Les dépenses en personnel temporaire pour le bloc opératoire.',
 bdb:'L\'intérimaire qui accède à BDB prépare comme un titulaire. Moins de temps perdu à chercher, moins de supervision nécessaire. Une semaine de supervision économisée représente environ 5 000 euros.'},
{id:'rh100h',name:'Effectif nécessaire pour 100 heures de temps opératoire',impact:'indirect',
 def:'Le nombre d\'équivalents temps plein mobilisés pour 100 heures de temps réel d\'occupation des salles.',
 bdb:'Une équipe plus efficace maintient ce ratio stable même quand quelqu\'un part. Le savoir institutionnel ne disparaît plus avec l\'individu — il est dans BDB.'}
]};

/* ═══════════ PERSONAS DATA ═══════════ */
const PERSONAS=[
{id:'tabDAF',title:'Directrice Administrative et Financière',
 desc:'Elle veut des chiffres, des sources, un retour sur investissement documenté. Zéro promesse floue. Elle compare tout à un coût d\'opportunité.',
 badges:['Profil analytique','Veut des preuves'],
 objections:[
  {q:'Ça coûte combien ?',a:'Le coût total de possession la première année est inférieur à 3 000 euros pour un bloc de moins de 3 000 interventions, et inférieur à 10 000 euros au-delà. En face : un seul départ non remplacé coûte entre 50 et 60 000 euros. L\'Association of periOperative Registered Nurses (AORN) documente un retour sur investissement de 300% par infirmière formée.'},
  {q:'Il y a déjà un logiciel au bloc',a:'Le Système d\'Information Hospitalier (SIH) et le Dossier Patient Informatisé (DPI) gèrent l\'administratif : identité du patient, codage, facturation. BDB gère le savoir opératoire : comment préparer une salle, quel matériel sortir, quelles préférences respecter. Les deux ne couvrent pas le même besoin.'},
  {q:'Prouvez-moi que ça marche ailleurs',a:'L\'AORN documente 155 000 dollars économisés par an et par infirmière formée, comparé au recours à l\'intérim. La Haute Autorité de Santé (HAS) exige la gestion des connaissances comme critère de certification V2024. Le bloc représente 40% des coûts mais 60 à 70% du chiffre d\'affaires — chaque minute d\'efficience a un impact financier mesurable.'}
 ],
 punchline:'BDB coûte moins qu\'une semaine d\'intérim. Et une semaine d\'intérim ne laisse rien derrière elle.'},
{id:'tabCadre',title:'Cadre de bloc opératoire',
 desc:'Elle organise, planifie, gère les absences et les urgences. Elle veut que son équipe tourne même quand elle n\'est pas là. Elle est épuisée par les outils qui ajoutent du travail sans en retirer.',
 badges:['Organisatrice','Veut du concret'],
 objections:[
  {q:'Mon équipe ne voudra pas alimenter un outil de plus',a:'Les IBODE (Infirmières de Bloc Opératoire Diplômées d\'État) veulent protéger leur expertise — surtout face aux mesures transitoires : 16 organisations professionnelles se sont prononcées contre une formation de 28 heures censée remplacer 3 000 heures de diplôme. BDB est l\'outil de cette protection. Le cadre valide, l\'équipe contribue.'},
  {q:'Comment je mesure l\'impact ?',a:'Via les indicateurs de l\'Agence Nationale d\'Appui à la Performance (ANAP) déjà suivis : le démarrage tardif (objectif sous 5% du temps de vacation), le taux d\'annulation, la durée d\'intégration des nouvelles. La certification HAS V2024 évalue aussi la gestion des connaissances au bloc.'},
  {q:'Je n\'ai pas le temps d\'alimenter moi-même',a:'L\'équipe alimente, le cadre valide. Un protocole enrichi en 5 minutes sert pendant 5 ans. Comparez avec le temps perdu quand une intérimaire cherche le matériel parce que personne n\'a documenté la préparation de cette salle.'}
 ],
 punchline:'Quand tu es de repos, ton bloc continue de tourner. BDB, c\'est toi — même quand tu n\'es pas là.'},
{id:'tabIBODE',title:'IBODE experte (Infirmière de Bloc Opératoire Diplômée d\'État)',
 desc:'Elle a 15 ou 20 ans de bloc. Son savoir est dans ses mains, dans son regard, dans ses automatismes. Elle anticipe un problème avant qu\'il arrive. Mais ce savoir est invisible — et il partira avec elle.',
 badges:['Experte terrain','20 ans de bloc'],
 objections:[
  {q:'Mon savoir n\'a pas besoin d\'un outil',a:'Patricia Benner (1984, De novice à expert) le démontre : ce qui fait l\'expertise infirmière, c\'est la conscience perceptive — cette capacité à sentir qu\'une préparation ou une situation ne sont pas comme d\'habitude. Ce savoir est tacite, il n\'est écrit nulle part. Quand une experte part, il disparaît. Les 28 heures de formation transitoire ne le remplaceront jamais. BDB rend ce savoir nommable, transmissible, vivant.'},
  {q:'Ça va tout standardiser et appauvrir mon métier',a:'C\'est le contraire. BDB intègre les variantes par chirurgien, les signalements d\'équipe, les préférences, les différentes voies d\'abord pour un même geste. Un protocole sans variantes, sans exceptions documentées, sans ce qui peut déraper — c\'est un protocole menteur. BDB dit vrai, parce que c\'est l\'experte qui le nourrit.'}
 ],
 punchline:'Ton savoir a de la valeur. BDB le rend visible — pour celles qui arrivent, et pour celles qui restent.'},
{id:'tabNovice',title:'Infirmière novice au bloc',
 desc:'C\'est sa première année. Tout le monde autour d\'elle a l\'air de savoir quoi faire. Elle ne veut pas déranger, elle ne veut pas montrer qu\'elle ne sait pas. Elle a besoin qu\'on la guide sans la juger.',
 badges:['Première année','Besoin de repères'],
 objections:[
  {q:'J\'ai peur de montrer que je ne sais pas',a:'Dans BDB, il n\'y a aucun classement nominatif, aucune comparaison entre collègues. La progression est personnelle et privée. Le niveau n\'est pas un jugement — c\'est une position qui ouvre les bonnes ressources au bon moment (Boudreault, didactique professionnelle). BDB montre le chemin, pas le retard.'},
  {q:'C\'est trop dense, je ne sais pas par où commencer',a:'Les contenus sont adaptés au niveau de chacune. La novice voit ce dont elle a besoin maintenant — pas tout le catalogue de 20 ans d\'expertise. L\'organisateur de parcours guide étape par étape. On commence petit — comme dans la vraie vie.'}
 ],
 punchline:'Le soir avant ta première journée au bloc, tu sais déjà ce qui t\'attend. Tu n\'es plus seule.'},
{id:'tabChir',title:'Chirurgien',
 desc:'Il veut que sa salle soit prête, que son matériel soit là, que l\'équipe connaisse ses habitudes. Il ne veut pas saisir, pas documenter, pas perdre de temps. Il est un prescripteur indirect : s\'il est satisfait, le projet avance.',
 badges:['Prescripteur indirect','Zéro charge pour lui'],
 objections:[
  {q:'Je n\'ai pas besoin d\'un outil infirmier',a:'En 2005, une patiente est décédée lors d\'une intervention ORL (Oto-Rhino-Laryngologie) de routine — pas par erreur technique, mais parce que l\'équipe n\'a pas communiqué au bon moment (cas documenté par le Clinical Human Factors Group). Guignard et Bentz (CHU Montpellier, 2024) démontrent que les compétences non techniques au bloc — la communication, l\'anticipation, le travail d\'équipe — ne sont pas un luxe. BDB structure ces compétences.'},
  {q:'Mes préférences sont dans ma tête, ça me suffit',a:'Quand le chirurgien est absent ou qu\'une intérimaire prend le poste, personne ne connaît ses préférences. 5 minutes perdues à chercher le bon matériel, c\'est 60 euros par intervention. Sur 1 000 interventions par an, cela représente 60 000 euros. Les préférences documentées dans BDB sont accessibles à toute l\'équipe, tout le temps.'},
  {q:'Encore une charge administrative',a:'Zéro saisie de la part du chirurgien. Ce sont les IBODE qui documentent. Sa seule « charge » : valider ce que l\'équipe a capturé. En échange : une salle prête, un matériel vérifié, un programme qui démarre à l\'heure.'}
 ],
 punchline:'Le matin, votre salle est prête. Pas parce qu\'on a eu de la chance — parce que c\'est documenté.'},
{id:'tabDSI',title:'Direction générale ou Direction des Systèmes d\'Information (DSI)',
 desc:'Elle pense stratégie, certification, différenciation, risque juridique. Elle a besoin de comprendre où BDB se positionne dans l\'écosystème existant et ce que ça apporte à la certification.',
 badges:['Stratégie','Certification'],
 objections:[
  {q:'Quel est le lien avec la certification HAS ?',a:'La certification V2024 de la Haute Autorité de Santé évalue la qualité au bloc opératoire. Le Développement Professionnel Continu (DPC) est obligatoire. La feuille de route sécurité patients 2023-2025 du Ministère mentionne explicitement les compétences non techniques et la formation aux facteurs humains. BDB opérationnalise 3 des 9 compétences du référentiel IBODE 2022 : former et informer (C7), rechercher et analyser (C8), évaluer et améliorer (C9).'},
  {q:'Comment ça se positionne face à l\'existant ?',a:'Il n\'y a pas de concurrent direct. Les Systèmes d\'Information Hospitaliers (DxCare, Orbis) gèrent l\'administratif. Les plateformes de formation en ligne (Moodle, 360Learning) gèrent la formation théorique. BDB occupe le créneau entre les deux : le savoir opératoire vivant, alimenté par ceux qui le pratiquent, accessible au moment où on en a besoin — avant d\'entrer au bloc.'}
 ],
 punchline:'BDB transforme le bloc d\'un centre de coût en un centre de compétence documenté et certifiable.'}
];

/* ═══════════ ROI DATA ═══════════ */
const ROI={
gros:{
 intro:'Environ 20 interventions par jour, 5 salles ou plus. Problème dominant : turnover élevé, recours massif à l\'intérim, perte de savoir quand quelqu\'un part.',
 rows:[
  ['Les fiches d\'installation et les préférences chirurgien sont connues à l\'avance','Démarrage tardif','5 minutes gagnées par jour','15 000'],
  ['La checklist matériel est préparée avant l\'entrée en salle','Temps entre deux patients','3 minutes gagnées par intervention','180 000'],
  ['L\'intégration des nouvelles est structurée','Durée d\'intégration','2 mois gagnés par novice','9 000'],
  ['L\'équipe se sent soutenue et reste','Turnover du personnel','1 départ évité par an','50 000'],
  ['L\'intérimaire est autonome plus vite','Coût de l\'intérim','1 semaine de supervision économisée','5 000']
 ],total:'260 000',cout:'10 000',roi:'26',
 note:'1 minute gagnée par intervention × 5 000 interventions = 83 heures récupérées, soit 2 semaines complètes de travail d\'un agent — à effectif constant.'},
petit:{
 intro:'Environ 12 interventions par jour, 2 à 3 salles. Problème dominant : polyvalence forcée, isolement, difficultés à former les nouvelles.',
 rows:[
  ['Fiches d\'installation et préférences accessibles','Démarrage tardif','5 minutes gagnées par jour','15 000'],
  ['Checklist matériel anticipée','Temps entre deux patients','3 minutes gagnées par intervention','108 000'],
  ['Intégration structurée (1 novice par an)','Durée d\'intégration','2 mois gagnés','9 000'],
  ['Rétention de l\'équipe','Turnover du personnel','1 départ évité tous les 2 ans','25 000']
 ],total:'157 000',cout:'3 000',roi:'52',
 note:'Le petit bloc a un retour relatif encore meilleur : le coût d\'entrée est plus bas, et l\'impact qualitatif est disproportionné. BDB devient le binôme de l\'équipe quand elle est seule au bloc.'}
};

/* ═══════════ SOURCES DATA ═══════════ */
const SOURCES=[
{ref:'A1',color:'danger',name:'NSI Nursing Solutions — Retention & Staffing Report 2024',desc:'Coût moyen du turnover d\'une infirmière : environ 56 000 dollars. Taux de départ en péri-opératoire : 12 à 18%.',url:'https://www.nsinursingsolutions.com/'},
{ref:'A2',color:'danger',name:'AORN — Programme Periop 101, retour sur investissement',desc:'Retour de 300% par infirmière formée. Économie de 155 000 dollars par an comparée à l\'intérim.',url:'https://www.aorn.org/education/facility-solutions/periop-101'},
{ref:'A3',color:'danger',name:'Xie et al. (2024) — Pénurie infirmière péri-opératoire : revue intégrative',desc:'84 articles analysés. Impact de la pénurie sur les revenus, la qualité des soins, l\'épuisement.',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11918777/'},
{ref:'A4',color:'danger',name:'Wolfskill (2024) — Efficience du bloc par réduction du temps entre patients',desc:'Le bloc = 40% des coûts hospitaliers mais 60 à 70% du chiffre d\'affaires.',url:'https://soar.usa.edu/'},
{ref:'A5',color:'danger',name:'EM-Consulte — Calcul du coût de fonctionnement d\'un bloc opératoire',desc:'10,8 euros par minute en 2012 (méthodologie nationale). Base du chiffre 12 euros actualisé.',url:'https://www.em-consulte.com/article/920580'},
{ref:'B1',color:'primary',name:'HAS — Check-list sécurité patient au bloc opératoire',desc:'Obligation de certification. Communication et travail d\'équipe identifiés comme facteurs clés.',url:'https://www.has-sante.fr/jcms/c_1518984'},
{ref:'B2',color:'primary',name:'Arrêté du 27 avril 2022 — Formation IBODE',desc:'Compétences 7 (former), 8 (rechercher), 9 (évaluer). BDB les opérationnalise.',url:'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045696964'},
{ref:'C1',color:'success',name:'Mesures transitoires IBODE — 16 organisations opposées',desc:'28 heures de formation transitoire contre 3 000 heures de diplôme IBODE. Pic de pénurie à 5 ans.',url:'https://www.syndicat-infirmier.com/'},
{ref:'D1',color:'warning',name:'Guignard & Bentz (2024) — Compétences non techniques pour l\'IBODE',desc:'Étude française récente (CHU Montpellier). Les compétences non techniques au bloc = nécessité documentée.',url:'https://www.em-consulte.com/'},
{ref:'D2',color:'warning',name:'Cas Bromiley (2005) — Clinical Human Factors Group',desc:'Décès lors d\'une intervention de routine par défaillance de communication d\'équipe.',url:'https://chfg.org/'},
{ref:'E1',color:'secondary',name:'ANAP — Liste des indicateurs du bloc opératoire',desc:'Référentiel officiel français des indicateurs de performance.',url:'https://anap.fr/s/article/bloc-operatoire-publication-1297'},
{ref:'E2',color:'secondary',name:'Datamento — Indicateurs de performance du bloc opératoire',desc:'Définitions interactives des indicateurs de temps et de performance.',url:'https://www.datamento.com/performance-et-indicateurs-du-bloc-op%C3%A9ratoire'},
{ref:'E3',color:'secondary',name:'ANAP — Guide des indicateurs, outil d\'analyse du bloc',desc:'Définitions formelles : temps de vacation offert, temps réel d\'occupation, débordements.',url:'https://autodiag.anap.fr/ressources/medias/Bloc/Guide_des_indicateurs_-_Outil_danalyse_Bloc_operatoire.pdf'},
{ref:'E4',color:'secondary',name:'Halyard Health — Coût par minute de bloc opératoire',desc:'62 dollars par minute (données USA). 61% des interventions avec retard documenté.',url:'https://halyardhealth.eu/fr/articles/efficacite-or/comment-exploiter-une-salle-doperation-plus-rentable/'}
];

/* ═══════════ CHAÎNE CAUSALE ═══════════ */
const CHAINE=[
{a:'\u25CF',t:'<strong>BDB existe</strong> — le savoir opératoire est documenté, accessible, structuré'},
{a:'\u2192',t:'La novice prépare en autonomie la veille \u2192 <strong>temps de préparation en baisse</strong>'},
{a:'\u2192',t:'L\'intérimaire connaît les préférences chirurgien \u2192 <strong>temps entre deux patients en baisse</strong>'},
{a:'\u2192',t:'L\'IBODE experte transmet AVANT de partir \u2192 <strong>turnover du personnel en baisse</strong>'},
{a:'\u2192',t:'La check-list HAS est mieux alimentée \u2192 <strong>événements indésirables en baisse</strong>'},
{a:'\u21D2',t:'<strong>Taux d\'occupation des vacations en hausse</strong> \u2192 plus d\'interventions à temps de vacation constant'},
{a:'\u21D2',t:'<strong>Chiffre d\'affaires du bloc en hausse</strong> à effectif constant'},
{a:'\u2605',t:'<strong>Marge en hausse</strong> — et l\'équipe reste.'}
];

/* ═══════════ RENDERERS ═══════════ */

function renderKpi(containerId,items){
  var el=document.getElementById(containerId);if(!el)return;
  el.innerHTML=items.map(function(k){
    var ic=k.impact==='direct'?'direct':'indirect';
    var il=k.impact==='direct'?'Impact direct':'Impact indirect';
    return '<div class="arg-kpi-item" data-kpi="'+escHtml(k.id)+'">'+
      '<span class="arg-kpi-impact-tag '+ic+'">'+il+'</span>'+
      '<span class="arg-kpi-name">'+escHtml(k.name)+'</span>'+
      '<i class="bi bi-chevron-right arg-kpi-chevron"></i></div>'+
      '<div class="arg-kpi-detail" data-kpi-detail="'+escHtml(k.id)+'">'+
      '<div class="arg-kpi-def">'+escHtml(k.def)+'</div>'+
      '<div class="arg-kpi-bdb"><strong>Comment BDB agit :</strong> '+escHtml(k.bdb)+'</div></div>';
  }).join('');
}

function renderPersonas(){
  var c=document.getElementById('personaContent');if(!c)return;
  c.innerHTML=PERSONAS.map(function(p,i){
    var active=i===0?' show active':'';
    var badges=p.badges.map(function(b){return '<span class="badge text-bg-secondary me-1">'+escHtml(b)+'</span>';}).join('');
    var objs=p.objections.map(function(o){
      return '<div class="arg-objection">'+
        '<div class="arg-obj-q"><i class="bi bi-chat-left-quote me-1"></i>\u00AB '+escHtml(o.q)+' \u00BB</div>'+
        '<div class="arg-obj-a">'+escHtml(o.a)+'</div></div>';
    }).join('');
    return '<div class="tab-pane fade'+active+'" id="'+escHtml(p.id)+'"><div class="card-body pt-0">'+
      '<div class="arg-persona-header"><div class="arg-persona-desc"><strong>'+escHtml(p.title)+'</strong> — '+escHtml(p.desc)+'</div>'+
      '<div class="d-flex gap-1 flex-wrap mt-2">'+badges+'</div></div>'+
      objs+
      '<div class="arg-punchline"><i class="bi bi-quote"></i>'+escHtml(p.punchline)+'</div>'+
      '</div></div>';
  }).join('');
}

function renderRoi(){
  var c=document.getElementById('roiContent');if(!c)return;
  function buildTable(d,id,active){
    var rows=d.rows.map(function(r){
      return '<tr><td>'+escHtml(r[0])+'</td><td><span class="badge text-bg-primary">'+escHtml(r[1])+'</span></td><td>'+escHtml(r[2])+'</td><td class="text-end fw-bold">'+escHtml(r[3])+' \u20AC</td></tr>';
    }).join('');
    return '<div class="tab-pane fade'+(active?' show active':'')+'" id="'+id+'">'+
      '<p class="text-muted mb-3">'+escHtml(d.intro)+'</p>'+
      '<div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light">'+
      '<tr><th>Ce que BDB apporte</th><th>Indicateur impacté</th><th>Gain estimé</th><th class="text-end">Valeur annuelle</th></tr></thead><tbody>'+
      rows+
      '<tr class="table-primary"><td colspan="3"><strong>Total des gains estimés</strong></td><td class="text-end fw-bold fs-5">~'+escHtml(d.total)+' \u20AC</td></tr>'+
      '<tr class="table-light"><td colspan="3">Coût annuel de BDB</td><td class="text-end">&lt; '+escHtml(d.cout)+' \u20AC</td></tr>'+
      '<tr class="table-success"><td colspan="3"><strong>Retour sur investissement</strong></td><td class="text-end fw-bold fs-5 text-success">\u00D7 '+escHtml(d.roi)+'</td></tr>'+
      '</tbody></table></div>'+
      '<p class="arg-roi-note mt-2">'+escHtml(d.note)+'</p></div>';
  }
  c.innerHTML=buildTable(ROI.gros,'tabGros',true)+buildTable(ROI.petit,'tabPetit',false);
}

function renderSources(){
  var c=document.getElementById('sourcesTable');if(!c)return;
  var rows=SOURCES.map(function(s){
    return '<tr><td class="ps-3"><span class="badge text-bg-'+escHtml(s.color)+'">'+escHtml(s.ref)+'</span></td>'+
      '<td>'+escHtml(s.name)+'</td>'+
      '<td>'+escHtml(s.desc)+'</td>'+
      '<td class="text-center"><a href="'+escHtml(s.url)+'" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary" aria-label="Ouvrir"><i class="bi bi-box-arrow-up-right"></i></a></td></tr>';
  }).join('');
  c.innerHTML='<div class="table-responsive"><table class="table table-hover table-sm align-middle mb-0">'+
    '<thead class="table-light"><tr><th class="ps-3">Réf.</th><th>Source</th><th>Ce qu\'on y trouve</th><th class="text-center">Lien</th></tr></thead>'+
    '<tbody>'+rows+'</tbody></table></div>';
}

function renderChaine(){
  var el=document.getElementById('chaineCausale');if(!el)return;
  el.innerHTML=CHAINE.map(function(c){
    return '<div class="arg-chain-step"><span class="arg-chain-arrow">'+c.a+'</span><span class="arg-chain-text">'+c.t+'</span></div>';
  }).join('');
}

/* ═══════════ TOGGLE KPI ═══════════ */
function initKpiToggle(){
  document.addEventListener('click',function(e){
    var item=e.target.closest('.arg-kpi-item');if(!item)return;
    var id=item.dataset.kpi;
    var detail=document.querySelector('[data-kpi-detail="'+id+'"]');if(!detail)return;
    var isOpen=item.classList.contains('open');
    document.querySelectorAll('.arg-kpi-item.open').forEach(function(i){i.classList.remove('open');});
    document.querySelectorAll('.arg-kpi-detail.show').forEach(function(d){d.classList.remove('show');});
    if(!isOpen){item.classList.add('open');detail.classList.add('show');}
  });
}

/* ═══════════ INIT ═══════════ */
document.addEventListener('DOMContentLoaded',async function(){
  await window.bdbShellReady;
  hide('arg-loading');
  if(!window.bdbUser||!window.bdbUser.isCreator){show('arg-denied');return;}
  renderKpi('kpiTemps',KPI.temps);
  renderKpi('kpiPerf',KPI.perf);
  renderKpi('kpiQualite',KPI.qualite);
  renderKpi('kpiRH',KPI.rh);
  renderPersonas();
  renderRoi();
  renderSources();
  renderChaine();
  initKpiToggle();
  show('arg-content');
});
