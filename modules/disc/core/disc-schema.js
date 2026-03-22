window.DiscSchema = (function () {
    var DISC_TYPES = {
        D: { label:'Dominant',      desc:'Direct, orienté résultat, décisif, compétitif', color:'#e74c3c' },
        I: { label:'Influent',      desc:'Enthousiaste, communicant, optimiste, persuasif', color:'#f39c12' },
        S: { label:'Stable',        desc:'Calme, loyal, patient, orienté équipe', color:'#27ae60' },
        C: { label:'Consciencieux', desc:'Précis, analytique, rigoureux, axé qualité', color:'#2980b9' }
    };
    var VAKOG_TYPES = {
        V: { label:'Visuel',         color:'#1a56db' },
        A: { label:'Auditif',        color:'#0e7a9a' },
        K: { label:'Kinesthésique',  color:'#1a7a4a' },
        O: { label:'Olfactif',       color:'#b7770d' },
        G: { label:'Gustatif',       color:'#c0392b' }
    };
    var ENNEA = {
        '1':'Perfectionniste — principe, intégrité',
        '2':'Altruiste — aide, reconnaissance',
        '3':'Battant — succès, image',
        '4':'Romantique — identité, authenticité',
        '5':'Observateur — savoir, intimité',
        '6':'Loyaliste — sécurité, soutien',
        '7':'Épicurien — liberté, expériences',
        '8':'Chef — contrôle, protection',
        '9':'Médiateur — paix, harmonie'
    };
    return Object.freeze({ DISC_TYPES:DISC_TYPES, VAKOG_TYPES:VAKOG_TYPES, ENNEA:ENNEA });
}());

