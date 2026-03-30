import { fetchData } from "../../app/shared/scripts/utils/fetchData.js";
const errorMessage = document.getElementById("msgBox");

async function loginUser() {
  const numeroSeguranca = parseInt(document.getElementById("usuarioNum").value);
  const password = document.getElementById("password").value.trim();

  if (!numeroSeguranca || !password) {
    errorMessage.className = "alert alert-error";
    errorMessage.textContent = "Número e Password são obrigatórios";
    errorMessage.style.display = "block";
    return;
  }

  try {
    const response = await fetchData(`auth/login`, {
      method: "POST",
      body: { numeroSeguranca, password },
    });

    sessionStorage.setItem("token", response.token);
    sessionStorage.setItem("idUser", response.idUser);
    sessionStorage.setItem("nome", response.nomeUsuario);

    window.location.href = "./app/dashboard.html";
  } catch (err) {
    console.error(err);

    errorMessage.className = "alert alert-error";
    errorMessage.textContent = "Número ou password incorretos.";
    errorMessage.style.display = "block";
  }
}

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();

  loginUser();
  errorMessage.style.display = "none";
});
