const API_BASE_URL = "http://localhost:8080/api";

const tbodyFuncionarios = document.querySelector("#tbodyFuncionarios");
const tbodyVisitantes = document.querySelector("#tbodyVisitantes");

// Listagem de FUNCIONARIOS
fetch(`${API_BASE_URL}/funcionarios`)
  .then((response) => response.json())
  .then((data) => {
    data.forEach((func) => {
      const tr = document.createElement("tr");
      const th1 = document.createElement("td");
      const th2 = document.createElement("td");
      const th3 = document.createElement("td");

      th1.textContent = func.nomeFuncionario;
      th2.textContent = func.numeroFuncionario;
      th3.textContent = func.setor;

      tr.appendChild(th1);
      tr.appendChild(th2);
      tr.appendChild(th3);

      tbodyFuncionarios.appendChild(tr);
    });
  })
  .catch((err) => console.log(err));

// Listagem de FUNCIONARIOS
fetch(`${API_BASE_URL}/visitantes`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);

    data.forEach((visitante) => {
      const tr = document.createElement("tr");
      const th1 = document.createElement("td");
      const th2 = document.createElement("td");
      const th3 = document.createElement("td");

      th1.textContent = visitante.nomeVisitante;
      th2.textContent = visitante.empresa;
      th3.textContent = visitante.documentoIdentificacao;

      tr.appendChild(th1);
      tr.appendChild(th2);
      tr.appendChild(th3);

      tbodyVisitantes.appendChild(tr);
    });
  })
  .catch((err) => console.log(err));
