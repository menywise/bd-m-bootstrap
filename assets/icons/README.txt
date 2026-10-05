ICONES PWA — BIBLE DE BLOC
==========================
Fichiers PNG a fournir (Manu) pour activer la PWA :

  icon-192.png  192 x 192 px   Android homescreen, splash screen
  icon-180.png  180 x 180 px   Apple Touch Icon (iOS safari, homescreen)
  icon-512.png  512 x 512 px   Splash screen HD, masquable

FORMAT
  - PNG, 24 ou 32 bits
  - Fond plein recommande (blanc ou #0d6efd) pour le rendu iOS
  - icon-512.png DOIT supporter le safe zone masquable :
    contenu centrique dans un cercle inscrit de 80% (409 x 409 px)
    Ref : https://web.dev/maskable-icon/

THEME
  Couleur primaire : #0d6efd  (Bootstrap primary BDB)
  Contenu suggere  : logo BDB ou initiales "BDB" sur fond bleu/blanc

APRES AJOUT DES FICHIERS
  - Tester avec Lighthouse (onglet PWA) dans Chrome DevTools
  - sw.js a creer en Phase suivante (arbo stabilisee)
  - Mettre a jour la table bdb_dependencies si une toolchain icones est utilisee
