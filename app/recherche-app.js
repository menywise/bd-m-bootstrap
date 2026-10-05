'use strict';
document.addEventListener('DOMContentLoaded', async function () {
  await window.bdbShellReady;
  await BdbSearch.init({ container: '#searchContainer' });
});
