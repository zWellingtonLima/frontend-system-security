export const API_BASE_URL = "http://localhost:8080/api";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    return response.json();
  } catch (err) {
    console.log(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
