async function doLogout() {
  const token = sessionStorage.getItem("token");

  try {
    await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      headers: { "X-Sessao-Id": token },
    });
  } catch (err) {
    console.log(err);
  } finally {
    sessionStorage.clear();
    window.location.href = "/index.html";
  }
}
