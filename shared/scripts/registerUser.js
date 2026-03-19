function registerUser() {
  // PEGA TODAS AS INFORMACOES DIGITADAS NOS CAMPOS
  const nome = document.getElementById("usuarioNome").value.trim();
  const userNum = parseInt(document.getElementById("usuarioNumero").value);
  const pwd = document.getElementById("usuarioPassword").value;
  const pwd2 = document.getElementById("usuarioPasswordConfirm").value;
  const msg = document.getElementById("msgBox");

  // FUNCAO PARA MOSTRAR ERRO
  function err(text) {
    msg.className = "alert alert-error";
    msg.textContent = text;
    msg.style.display = "block";
  }

  // VERIFICACOES
  if (!nome || !userNum || !pwd) return err("Preencha todos os campos.");
  if (pwd.length < 6) return err("Password mínimo 6 caracteres.");
  if (pwd !== pwd2) return err("As passwords não são iguais.");

  // CHAMADA AO BACKEND
  fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nomeSeguranca: nome,
      numeroSeguranca: userNum,
      password: pwd,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        msg.className = "alert alert-error";
        msg.textContent = "Verifique os dados";
        msg.style.display = "block";

        throw new Error("Erro ao fazer registo.");
      }

      return res.json();
    })
    // EXIBIR MENSAGEM DE SUCESSO E REDIRECIONAR PARA LOGIN
    .then((data) => {
      console.log(data);



      msg.className = "alert alert-success";
      msg.textContent = "Conta criada com sucesso! Redirecionando...";
      msg.style.display = "block";

      //setTimeout(() => (window.location.href = "index.html"), 1200);
    })
    // EXIBIR MENSAGEM PARA USUARIO CASO USUARIO JA EXISTA
    .catch((err) => console.log(err));

  //return err("Número já registado.");
}
