export function fillSelect(
  selectSelector,
  data,
  valorKey,
  labelKey,
  selectedValue = null,
) {
  const select = document.querySelector(selectSelector);
  if (!select) {
    console.warn(`[fillSelect] Elemento "${selectSelector}" não encontrado.`);
    return;
  }

  select.innerHTML = `<option value="" disabled ${!selectedValue ? "selected" : ""}>Selecione um tipo...</option>`;

  data.forEach(({ [valorKey]: valor, [labelKey]: label }) => {
    const option = document.createElement("option");
    option.value = valor;
    option.textContent = label;
    if (label === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}
