const API_BASE_URL = "http://localhost:8080/api";

function registarVisitante() {
  fetch(`${API_BASE_URL}/funcionarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // incluir X-Sessao-Id com o token
    },
    // falta incluir o
    body: JSON.stringify({
      
    }),
  });
}
