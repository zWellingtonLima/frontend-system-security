import {
  ApiError,
  fetchData,
} from "../../app/shared/scripts/utils/fetchData.js";

const msg = document.getElementById("msgBox");

// FUNCAO PARA MOSTRAR ERRO
function err(text) {
  msg.className = "alert alert-error";
  msg.textContent = text;
  msg.style.display = "block";
}

async function registerUser() {
  // PEGA TODAS AS INFORMACOES DIGITADAS NOS CAMPOS
  const nomeSeguranca = document.getElementById("usuarioNome").value.trim();
  const numeroSeguranca = parseInt(
    document.getElementById("usuarioNumero").value,
  );
  const password = document.getElementById("usuarioPassword").value;
  const pwd2 = document.getElementById("usuarioPasswordConfirm").value;

  // VERIFICACOES
  if (!nomeSeguranca || !numeroSeguranca || !password)
    return err("Preencha todos os campos.");
  if (password.length < 6) return err("Password mínimo 6 caracteres.");
  if (password !== pwd2) return err("As passwords não são iguais.");

  try {
    const response = await fetchData("auth/register", {
      method: "POST",
      body: { nomeSeguranca, numeroSeguranca, password },
    });

    console.log(response);

    // E preciso melhorar o retorno do backend com erro de acordo com o problema
    if (response !== true) {
      err("Número de funcionário já registado");
      return;
    }

    msg.className = "alert alert-success";
    msg.textContent = "Conta criada com sucesso! Redirecionando...";
    msg.style.display = "block";

    setTimeout(() => (window.location.href = "index.html"), 1200);
  } catch (error) {
    if (error instanceof ApiError) console.log(error);
  }
}

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  registerUser();
});
