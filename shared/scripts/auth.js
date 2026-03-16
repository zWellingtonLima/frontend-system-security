function auth() {
  if (!STATE.currentUser) {
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

async function logoutUser() {
  const idSessao = sessionStorage.getItem("idSessao");
  await fetch(`/auth/logout/${idSessao}`, { method: "POST" });
  sessionStorage.clear();

  window.location.href = "../../index.html";
}
