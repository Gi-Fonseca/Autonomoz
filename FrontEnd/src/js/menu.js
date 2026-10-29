document.addEventListener("DOMContentLoaded", () => {
  const pagina = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-menu-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.menuPage === pagina);
  });
});
