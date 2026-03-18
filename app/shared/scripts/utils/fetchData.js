import { API_BASE_URL } from "../api/api_url.js";

export async function fetchData(endpoint, opcoes = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, opcoes);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // No caso de DELETE ou outros casos que a gente nao retorna body
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json") ? response.json() : null;
  } catch (err) {
    console.log(`Falha ao tentar carregar dados de ${endpoint}: ${err}`);
  }
}
