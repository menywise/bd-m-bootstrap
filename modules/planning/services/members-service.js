// =====================================================
// MEMBERS SERVICE — Identity Registry Loader
// Source unique : DATA_SCHEMA/MEMBERS_REGISTRY.json
// =====================================================

(function () {
  "use strict";

  let _members = [];
  let _loaded = false;

  const REGISTRY_PATH = "../../DATA_SCHEMA/MEMBERS_REGISTRY.json";

  async function load() {
    if (_loaded) return _members;

    try {
      const response = await fetch(REGISTRY_PATH);
      if (!response.ok) {
        console.error("MEMBERS_REGISTRY.json introuvable");
        return [];
      }

      _members = await response.json();
      _loaded = true;
      return _members;

    } catch (err) {
      console.error("Erreur chargement MEMBERS_REGISTRY:", err);
      return [];
    }
  }

  function getAll() {
    return _members;
  }

  function getActifs() {
    return _members.filter(m => m.actif === true);
  }

  function getById(user_id) {
    return _members.find(m => m.user_id === user_id) || null;
  }

  function getChirurgiens() {
    return _members.filter(m => m.fonction === "medecin" && m.actif);
  }

  function getIDEs() {
    return _members.filter(m =>
      (m.fonction === "infirmier" || m.fonction === "aide-soignant")
      && m.actif
    );
  }

  // =====================================================
  // DISPLAY HELPERS
  // =====================================================

  function getDisplayNameFull(member) {
    if (!member) return "";
    return `${member.nom} ${member.prenom}`.trim();
  }

  function getDisplayNameChirurgien(member) {
    if (!member) return "";
    return `Dr ${member.nom}`;
  }

  function getDisplayNameIDE(member) {
    if (!member) return "";

    if (!member.prenom) return member.nom;

    return member.prenom;
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  window.MembersService = {
    load,
    getAll,
    getActifs,
    getById,
    getChirurgiens,
    getIDEs,
    getDisplayNameFull,
    getDisplayNameChirurgien,
    getDisplayNameIDE
  };

})();