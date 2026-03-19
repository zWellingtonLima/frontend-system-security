function loginUser() {
  const userNum = parseInt(document.getElementById("usuarioNum").value);
  const password = document.getElementById("password").value.trim();

  const errorMessage = document.getElementById("msgBox");

  // FAZ CHAMADA AO BACKEND
  fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numeroSeguranca: userNum,
      password,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Problema ao fazer login");
      }

      return res.json();
    })
    .then((data) => {
      console.log(data);

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("idUser", data.idUser);
      sessionStorage.setItem("nome", data.nomeUsuario);

      window.location.href = "./app/dashboard.html";
    })
    .catch((err) => {
      console.error(err);

      errorMessage.className = "alert alert-error";
      errorMessage.textContent = "Número ou password incorretos.";
      errorMessage.style.display = "block";

      return;
    });
}
