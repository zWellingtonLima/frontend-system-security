async function sessionIsValid() {
  const idSessao = sessionStorage.getItem("idSessao");

  if (!idSessao) {
    window.location.href = "../../index.html";
    return;
  }

  const res = await fetch(`/auth/sessao/${idSessao}`);

  if (!res.ok) {
    sessionStorage.clear();
    window.location.href = "../../index.html";
  }
}

sessionIsValid();
