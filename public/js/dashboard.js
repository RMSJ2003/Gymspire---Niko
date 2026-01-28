document.querySelectorAll(".feature-btn-clip").forEach((button) => {
  button.addEventListener("click", () => {
    const container = button.closest(".container");
    const clip = container.querySelector(".clip-overlay");

    // toggle the clip sliding in/out
    clip.classList.toggle("active");
  });
});
