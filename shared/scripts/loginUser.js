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
    .then((data) => {
      console.log(data);

      // guardar no sessionStorage
      sessionStorage.setItem("idSessao", data.idSessao);
      sessionStorage.setItem("idUser", data.idUser);
      sessionStorage.setItem("nome", data.nome);

      window.location.href = "./app/dashboard.html";
    })
    .catch((err) => {
      console.log(err);

      errorMessage.className = "alert alert-error";
      errorMessage.textContent = "Número ou password incorretos.";
      errorMessage.style.display = "block";

      return;
    });
}
