const segurancaName = document.querySelector("#segurancaNome");

if (segurancaName !== null) {
  segurancaName.textContent = sessionStorage.getItem("nome");
}
