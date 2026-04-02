function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("active");
  el.dispatchEvent(new CustomEvent("modalClosed"));
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("overlay")) closeModal(e.target.id);
});

document.addEventListener("click", (e) => {
  const id = e.target.closest("[data-close]")?.dataset.close;
  if (id) closeModal(id);
});
