import { fetchData } from "../../shared/scripts/utils/fetchData.js";

const visiForm = document.querySelector("#registerVisitante");
const funciForm = document.querySelector("#registerFuncionario");

let editIdFuncionario = null;
let editIdVisitante = null;

// ── Edição ────────────────────────────────────────────────────────────────────

window.abrirEdicaoFuncionario = function (itemEncoded) {
  const item = JSON.parse(decodeURIComponent(itemEncoded));
  editIdFuncionario = item.id;

  funciForm.fNome.value = item.nomeFuncionario ?? "";
  funciForm.fNumero.value = item.numeroFuncionario ?? "";
  funciForm.fSetor.value = item.setor ?? "";

  document.getElementById("titleModalFuncionario").textContent =
    "Editar Funcionário";
  openModal("modalFuncionario");
};

window.abrirEdicaoVisitante = function (itemEncoded) {
  const item = JSON.parse(decodeURIComponent(itemEncoded));
  editIdVisitante = item.id;

  visiForm.vNome.value = item.nomeVisitante ?? "";
  visiForm.vEmpresa.value = item.empresa ?? "";
  visiForm.vDoc.value = item.documentoIdentificacao ?? "";

  document.getElementById("titleModalVisitante").textContent =
    "Editar Visitante";
  openModal("modalVisitante");
};

// Resetar estado ao fechar modais
document.getElementById("modalFuncionario").addEventListener("modalClosed", () => {
  editIdFuncionario = null;
  funciForm.reset();
  document.getElementById("titleModalFuncionario").textContent =
    "Registar Funcionário";
});

document.getElementById("modalVisitante").addEventListener("modalClosed", () => {
  editIdVisitante = null;
  visiForm.reset();
  document.getElementById("titleModalVisitante").textContent =
    "Registar Visitante";
});

// ── Submit Funcionário ────────────────────────────────────────────────────────

funciForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nomeFuncionario: e.target.fNome.value.trim(),
    numeroFuncionario: e.target.fNumero.value.trim(),
    setor: e.target.fSetor.value.trim(),
  };

  try {
    if (editIdFuncionario) {
      await fetchData(`funcionarios/${editIdFuncionario}`, {
        method: "PUT",
        body: payload,
      });
    } else {
      await fetchData("funcionarios", { method: "POST", body: payload });
    }

    closeModal("modalFuncionario");
    setTimeout(() => location.reload(), 500);
  } catch (err) {
    alert("Ocorreu um erro ao guardar o Funcionário.");
    console.error(err);
  }
});

// ── Submit Visitante ──────────────────────────────────────────────────────────

visiForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nomeVisitante: e.target.vNome.value.trim(),
    documentoIdentificacao: e.target.vDoc.value.trim(),
    empresa: e.target.vEmpresa.value.trim(),
    observacoes: "",
  };

  try {
    if (editIdVisitante) {
      await fetchData(`visitantes/${editIdVisitante}`, {
        method: "PUT",
        body: payload,
      });
    } else {
      await fetchData("visitantes", { method: "POST", body: payload });
    }

    closeModal("modalVisitante");
    setTimeout(() => location.reload(), 500);
  } catch (err) {
    alert("Ocorreu um erro ao guardar o Visitante.");
    console.error(err);
  }
});
