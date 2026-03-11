function auth() {
  if (!STATE.currentUser) {
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

function logoutUser() {
  localStorage.removeItem("sp_session");
  window.location.href = "../index.html";
}
