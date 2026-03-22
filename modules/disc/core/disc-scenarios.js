window.DiscScenarios = (function () {
    var SC = { 'SC_001': {
        id:'SC_001', titre:'Encadrement sous rumeur', version:'1.0',
        contexte:"Service d'orthopédie. Manuel (tuteur 12 ans) encadre Emma (étudiante S4). Des rumeurs circulent sur sa méthode d'encadrement.",
        personnages:['ROHAUT_M','DA_COSTA','SARTOUT_F','MERIC_Q','HAMSA_O'],
        scenes:[
            { id:'S1', titre:'Les rumeurs circulent', contexte:'Faustine relaie des propos de Quentin sur Manuel et Emma.', objectif:'Identifier mécanismes de rumeur, distinguer faits/interprétations.', deroulé:"Faustine (I) relaie avec enthousiasme. Carine (S) écoute sans valider. L'information grossit à chaque relais.", bascule:['Faustine est-elle relais neutre ou amplificatrice ?','Carine questionne-t-elle la source ?'], grille:{ faits:['Manuel reste proche d\'Emma lors des soins','Emma pose régulièrement des questions'], se:['discrétion','loyauté','neutralité'], at:{'SARTOUT_F':'Enfant libre → Parent normatif','MARCHAND_C':'Adulte → Enfant adapté (passif)'}, vakog:['Faustine : « j\'ai entendu… » (auditif)'], recadrage:['« Il fait toujours ça » → généralisation'] }, debrief:['Qu\'est-ce qui est un fait ?','Dans quel état du moi relayez-vous une info non vérifiée ?'] },
            { id:'S2', titre:'La confrontation silencieuse', contexte:'Olivia (cadre) est interpellée. Elle doit décider d\'intervenir.', objectif:'Exercer la prise de décision managériale en position +/+.', deroulé:"Olivia (C) analyse avant d'agir. Elle convoque Manuel. Manuel (D) entre en mode défensif.", bascule:['Olivia reste-t-elle en Adulte face au stress ?','Manuel peut-il passer de Parent critique à Adulte ?'], grille:{ faits:['Deux membres ont contacté Olivia séparément','Manuel est isolé depuis 3 jours'], se:['équité','discrétion','assertivité'], at:{'HAMSA_O':'Adulte → Parent normatif','ROHAUT_M':'Adulte → Parent critique'}, vakog:['Olivia : « je vois que la dynamique a changé » (visuel)'], recadrage:['« Les gens disent que… » → source floue'] }, debrief:['Comment mener un entretien +/+ quand l\'interlocuteur est en +/- ?'] },
            { id:'S3', titre:'La résolution', contexte:'Manuel parle directement à Emma. Quentin doit se positionner.', objectif:'Construire une communication directe. Sortir de -/- vers +/+.', deroulé:'Manuel choisit de ne pas se défendre mais d\'expliquer. Emma réalise qu\'elle était au centre.', bascule:['Manuel peut-il expliquer sans justifier ?','Quentin accepte-t-il la responsabilité ?'], grille:{ faits:['Manuel demande un échange avec Emma','Quentin évite le contact visuel'], se:['franchise','courage relationnel','humilité'], at:{'ROHAUT_M':'Adulte + Parent nourricier','DA_COSTA':'Adulte (comprendre sa place)'}, vakog:['Manuel : « voilà ce que j\'ai voulu faire » (kinesthésique)'], recadrage:['« Ce n\'est pas ma faute si… » → externalisation'] }, debrief:['Comment réparer une relation après une rumeur ?','Quelle est la différence entre s\'expliquer et se justifier ?'] }
        ]
    }};
    function get(id)  { return SC[id] || null; }
    function list()   { return Object.values(SC); }
    return Object.freeze({ get:get, list:list });
}());

