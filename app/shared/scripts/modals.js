// ── MODAL ──────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add("active");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) closeModal(e.target.id);
});

// ── TIPO DE ENTRADA ────────────────────────────────
function toggleEntradaTipo() {
  const isFuncionario =
    document.getElementById("eTipo").value === "funcionario";
  document
    .getElementById("secFuncionario")
    .classList.toggle("hidden", !isFuncionario);
  document
    .getElementById("secVisita")
    .classList.toggle("hidden", isFuncionario);
}

// ── CHAVE OPCIONAL ─────────────────────────────────
function toggleKeySection() {
  const toggle = document.getElementById("keyToggle");
  const isOn = toggle.classList.toggle("on");

  document.getElementById("keySection").classList.toggle("hidden", !isOn);
  document.getElementById("keyToggleIcon").textContent = isOn ? "✓" : "";
}

// ── SUBMISSÃO ──────────────────────────────────────
function registarEntrada() {
  const tipo = document.getElementById("eTipo").value;

  if (tipo === "funcionario") {
    const nome = document.getElementById("eNomeFuncionario").value.trim();
    if (!nome) return alert("Insira o nome do funcionário.");
  } else {
    const nome = document.getElementById("eNomeVisita").value.trim();
    const doc = document.getElementById("eDocumento").value.trim();
    if (!nome || !doc) return alert("Nome e documento são obrigatórios.");
  }

  closeModal("modalEntrada");
  clearForm();
}

// ── LIMPAR FORM ────────────────────────────────────
function clearForm() {
  [
    "eNomeFuncionario",
    "eSetorFuncionario",
    "eNomeVisita",
    "eEmpresa",
    "eDocumento",
    "eSetorDestino",
    "eFuncResponsavel",
    "eObs",
    "eCodChave",
    "eSalaChave",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });

  document.getElementById("eTipo").value = "funcionario";
  document.getElementById("eTipoChave").value = "Principal";
  document.getElementById("keyToggle").classList.remove("on");
  document.getElementById("keyToggleIcon").textContent = "";
  document.getElementById("keySection").classList.add("hidden");
  toggleEntradaTipo();
}

// REGISTRAR VISITANTE
function registarVisitante() {
  const nome = document.getElementById("vNome").value.trim();
  const doc = document.getElementById("vDoc").value.trim();

  if (!nome || !doc) return alert("Nome e documento são obrigatórios.");

  closeModal("modalVisitante");
  clearForm();
}

// LIMPAR FORM
function clearForm() {
  ["vNome", "vEmpresa", "vDoc", "vSetor"].forEach((id) => {
    document.getElementById(id).value = "";
  });
}
