## EXCEPTION AUTORISEE — Rich Text (Quill)

```
Les modules utilisant un editeur Quill (cours, preferences, installation, fiches,
transmissions, anatomie) PEUVENT cibler des elements natifs (h2, h3, ul, ol,
blockquote, img, p) a l'interieur de leur classe de contenu :

  .cours-view-content h2 { }
  .pref-view-description h3 { }
  .fiche-view-description img { }
  .trans-prose p { }

Ceci est AUTORISE car :
  1. Le scope est la classe module (.xxx-view-content / .xxx-prose)
  2. Le contenu HTML est genere par Quill, pas par le developpeur
  3. Bootstrap ne stylise pas ces elements dans un contexte rich text

Convention : toujours utiliser la classe module comme parent scope.
Jamais de selecteur nu (h2 {}, img {}) dans un fichier module.
```
