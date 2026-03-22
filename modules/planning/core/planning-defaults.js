// planning-defaults.js
// Données fallback extraites de planning-controller.js
// Aucune logique
// Expose window.PlanningDefaults

(function () {
  "use strict";

  const FALLBACK_SALLES = [5, 6, 7, 8];

  const FALLBACK_MEMBRES = [
    { nom: "Alain", prenom: "Jérôme", fonction: "medecin" },
    { nom: "Boscher", prenom: "Julien", fonction: "medecin" },
    { nom: "Bueno", prenom: "Sophie", fonction: "infirmier" },
    { nom: "Carrier", prenom: "Éléonore", fonction: "infirmier" },
    { nom: "Chrosciany", prenom: "Sacha", fonction: "medecin" },
    { nom: "Compain", prenom: "Julie", fonction: "infirmier" },
    { nom: "Coste", prenom: "Cédric", fonction: "medecin" },
    { nom: "Da Costa", prenom: "Emma", fonction: "infirmier" },
    { nom: "Delong", prenom: "Isabelle", fonction: "infirmier" },
    { nom: "Dotzis", prenom: "Anthony", fonction: "medecin" },
    { nom: "Dugot", prenom: "Sabine", fonction: "infirmier" },
    { nom: "Fredaigue", prenom: "Cynthia", fonction: "infirmier" },
    { nom: "Lagarrigue", prenom: "Jean-François", fonction: "medecin" },
    { nom: "Leproux", prenom: "Carole", fonction: "infirmier" },
    { nom: "Louisia", prenom: "Stéphane", fonction: "medecin" },
    { nom: "Maillet", prenom: "Valérie", fonction: "infirmier" },
    { nom: "Marchand", prenom: "Carine", fonction: "infirmier" },
    { nom: "Marczuk", prenom: "Yann", fonction: "medecin" },
    { nom: "Meric de Belfon", prenom: "Quentin", fonction: "infirmier" },
    { nom: "Narbonne", prenom: "Sarah", fonction: "infirmier" },
    { nom: "Nicolas", prenom: "Carole", fonction: "infirmier" },
    { nom: "Paquier", prenom: "Marion", fonction: "infirmier" },
    { nom: "Parre", prenom: "Franck", fonction: "infirmier" },
    { nom: "Picouleau", prenom: "Alexandre", fonction: "medecin" },
    { nom: "ROHAUT", prenom: "Manuel", fonction: "infirmier" },
    { nom: "Thuillier", prenom: "Emma", fonction: "infirmier" },
    { nom: "Vacquerie", prenom: "Virginie", fonction: "medecin" }
  ];

  window.PlanningDefaults = Object.freeze({
    FALLBACK_SALLES,
    FALLBACK_MEMBRES
  });

})();