// JS: createWorkoutPlan.js
const infoButtons = document.querySelectorAll(".type-info-btn");
const modal = document.querySelector(".modal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalText = document.getElementById("modalText");

// Convert array to a map for quick lookup
const exercisesMap = {};
exercisesData.forEach((ex) => {
  exercisesMap[ex.exerciseId] = ex;
});

infoButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    const ex = exercisesMap[id];
    if (!ex) return;

    modalGif.src = ex.gifURL || "";
    modalText.textContent =
      ex.instructions && ex.instructions.length
        ? ex.instructions.join("\n")
        : "No instructions";
    modal.classList.remove("hidden");
  });
});

closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});
