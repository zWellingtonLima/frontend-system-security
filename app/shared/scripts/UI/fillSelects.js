export function fillSelect(selectSelector, data, valorKey, labelKey) {
  const select = document.querySelector(selectSelector);

  if (!select) {
    console.warn(`[fillSelect] Elemento "${selectSelector}" não encontrado.`);
    return;
  }

  select.innerHTML = `<option value="" disabled selected>Selecione um tipo...</option>`;

  data.forEach(({ [valorKey]: valor, [labelKey]: label }) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = label;
    select.appendChild(option);
  });
}
