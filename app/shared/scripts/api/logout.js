import { fetchData } from "../utils/fetchData.js";
import { API_BASE_URL } from "./api_url.js";

async function doLogout() {
  try {
    await fetchData(`${API_BASE_URL}/auth/logout`, { method: "POST" });
  } catch (err) {
    console.log(err);
  } finally {
    sessionStorage.clear();
    window.location.href = "/index.html";
  }
}

// Seleciona o botão do logout e adiciona listener de click
document.querySelector("#logout-btn").addEventListener("click", doLogout);
