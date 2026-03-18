import { API_BASE_URL } from "../../shared/scripts/api/api_url.js";

const visiForm = document.querySelector("#registerVisitante");
const funciForm = document.querySelector("#registerFuncionario");

async function registarPessoa(dados, endpoint) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // X-Sessao-Id:
    },
    body: JSON.stringify(dados),
  });

  if (!response.ok) {
    throw new Error(`Erro: ${response.status}`);
  }

  return response.json();
}

// REGISTAR FUNCIONARIO
funciForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fNome = e.target.fNome.value.trim();
  const fNumero = e.target.fNumero.value.trim();
  const fSetor = e.target.fSetor.value.trim();
  const funcionarioData = {
    nomeFuncionario: fNome,
    numeroFuncionario: fNumero,
    setor: fSetor,
  };

  try {
    registarPessoa(funcionarioData, "funcionarios");

    funciForm.reset();
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    alert("Ocorreu um erro ao tentar registar o Visitante.");
    console.error(err);
  }
});

// REGISTAR VISITANTE
visiForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const vNome = e.target.vNome.value.trim();
  const vEmpresa = e.target.vEmpresa.value.trim();
  const vDoc = e.target.vDoc.value.trim();
  const visitanteData = {
    nomeVisitante: vNome,
    documentoIdentificacao: vDoc,
    empresa: vEmpresa,
    observacoes: "",
  };

  try {
    registarPessoa(visitanteData, "visitantes");

    visiForm.reset();
    setTimeout(() => location.reload(), 1000);
  } catch (err) {
    alert("Ocorreu um erro ao tentar registar o Visitante.");
    console.error(err);
  }
});
