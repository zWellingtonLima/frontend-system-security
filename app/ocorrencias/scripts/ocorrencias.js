await fetch("/api/ocorrencias", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    horaOcorrencia: new Date().toISOString(),
    ocorrencia: document.getElementById("ocorrencias").value,
    idUser: sessionStorage.getItem("idUser"),
  }),
});
