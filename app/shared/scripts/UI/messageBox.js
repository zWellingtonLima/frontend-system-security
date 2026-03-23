// shared/scripts/utils/ui.js

/**
 * Exibe uma mensagem numa msgBox existente no DOM.
 * @param {string} boxId    - ID do elemento alvo
 * @param {string} texto    - Mensagem a exibir
 * @param {"error"|"success"|"warning"} tipo - Classe de estilo
 */
export function showMsg(boxId, texto, tipo = "error") {
  const box = document.getElementById(boxId);
  if (!box) {
    console.warn(`[showMsg] Elemento "#${boxId}" não encontrado.`);
    return;
  }
  box.textContent = texto;
  box.className = `alert alert-${tipo}`;
  box.style.display = "block";
}

/**
 * Limpa e oculta uma msgBox.
 * @param {string} boxId - ID do elemento alvo
 */
export function clearMsg(boxId) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.textContent = "";
  box.className = "alert";
  box.style.display = "none";
}
