function loginUser() {
  const userNum = parseInt(document.getElementById("numUsuario").value);
  const password = document.getElementById("password").value.trim();

  const errorMessage = document.getElementById("msgBox");

  // FAZ CHAMADA AO BACKEND
  fetch("http://localhost:8080/api/users", {
    method: "POST",
    body: { numSeguranca: userNum, password },
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    // DEVE EXIBIR PARA O USUARIO MENSAGEM DE ERRO CASO O USUARIO NAO EXISTA
    .catch((err) => console.log(err));

  // MENSAGEM DE ERRO JA PRONTA
  if (!user) {
    errorMessage.className = "alert alert-error";
    errorMessage.textContent = "Número ou password incorretos.";
    errorMessage.style.display = "block";
    return;
  }

  // REDIRECIONAMENTO PARA O DASHBOARD
  window.location.href = "../app/dashboard.html";
}
