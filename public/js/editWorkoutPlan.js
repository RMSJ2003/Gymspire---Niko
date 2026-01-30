// =========================
// EDIT WORKOUT PLAN JS
// =========================

// ---------- PASS EXERCISES DATA ----------
if (!window.exercises) {
  console.error(
    "Exercises data not found! Make sure Pug passes 'exercises' to window.exercises.",
  );
}

// ---------- FORM SUBMISSION ----------
const form = document.querySelector("#editWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

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
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Workout plan updated successfully!";
      formMessage.style.color = "green";
      setTimeout(() => (window.location.href = "/workoutPlan"), 600);
    } else {
      formMessage.textContent = data.message || "Update failed.";
      formMessage.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Something went wrong.";
    formMessage.style.color = "red";
  }
});

// ---------- MODAL LOGIC ----------
const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

// Make sure exercises array exists
const exercises = window.exercises || [];
console.log("Exercises loaded:", exercises);

// Info buttons
const infoButtons = document.querySelectorAll(".info-btn");

infoButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const index = btn.dataset.index;
    const exercise = exercises[index];

    if (!exercise) {
      console.warn(`Exercise not found at index ${index}`);
      return;
    }

    // Set GIF
    if (exercise.gifURL) {
      modalGif.src = exercise.gifURL;
      modalGif.style.display = "block";
    } else {
      modalGif.style.display = "none";
    }

    // Set instructions
    if (exercise.instructions && exercise.instructions.length > 0) {
      modalInstructions.innerHTML =
        "<h4>Instructions:</h4><ul>" +
        exercise.instructions.map((step) => `<li>${step}</li>`).join("") +
        "</ul>";
    } else {
      modalInstructions.innerHTML = "<p>No instructions available.</p>";
    }

    // Show modal
    modal.classList.remove("hidden");
  });
});

// Close modal button
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// Close modal when clicking outside content
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
});
