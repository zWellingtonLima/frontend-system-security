import { API_BASE_URL } from "../api/api_url.js";

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    return response.json();
  } catch (err) {
    console.log(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
