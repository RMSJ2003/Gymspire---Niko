// JS: createWorkoutPlan.js

// 🔹 MODAL LOGIC
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

// 🔹 CREATE WORKOUT PLAN FORM LOGIC
const form = document.querySelector("#createWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect checked exercise IDs
    const checked = document.querySelectorAll(
      'input[name="exerciseIds"]:checked',
    );

    if (checked.length === 0) {
      formMessage.textContent = "Please select at least one exercise.";
      formMessage.style.color = "red";
      return;
    }

    const exerciseIds = Array.from(checked).map((input) => input.value);

    try {
      const res = await fetch("/api/v1/workout-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exerciseIds }),
      });

      const data = await res.json();

      if (data.status === "success") {
        formMessage.textContent = "Workout plan created successfully!";
        formMessage.style.color = "green";

        // 🔥 Redirect to workout plan page after short delay
        setTimeout(() => {
          window.location.href = "/workoutPlan";
        }, 600);
      } else {
        formMessage.textContent =
          data.message || "Failed to create workout plan.";
        formMessage.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      formMessage.textContent = "Something went wrong. Please try again.";
      formMessage.style.color = "red";
    }
  });
}
