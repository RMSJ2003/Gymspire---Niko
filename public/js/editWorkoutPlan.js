// ===== DATA =====
const exercises = window.exercises || [];
const selectedIds = window.selectedIds || [];

const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");

const form = document.querySelector("#editWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

// ===== GROUP EXERCISES BY TARGET =====
const grouped = {};
exercises.forEach((ex, index) => {
  if (!grouped[ex.target]) grouped[ex.target] = [];
  grouped[ex.target].push({ ...ex, index });
});

// ===== CREATE TARGET CARDS =====
Object.keys(grouped).forEach((target) => {
  const card = document.createElement("div");
  card.className = "target-card";
  card.textContent = target;
  card.addEventListener("click", () => openTargetModal(target));
  targetGrid.appendChild(card);
});

// ===== OPEN TARGET MODAL =====
function openTargetModal(target) {
  targetTitle.textContent = target;
  targetExerciseList.innerHTML = "";

  grouped[target].forEach((exercise) => {
    const row = document.createElement("div");
    row.className = "exercise-row";

    row.innerHTML = `
      <label>
        <input type="checkbox" name="exerciseIds" value="${exercise.exerciseId}" 
          ${selectedIds.includes(exercise.exerciseId) ? "checked" : ""}>
        <span class="exercise-name">${exercise.name}</span>
      </label>
      <button class="info-btn" data-index="${exercise.index}">i</button>
    `;

    targetExerciseList.appendChild(row);
  });

  attachInfoButtons();
  targetModal.classList.remove("hidden");
}

closeTargetModal.addEventListener("click", () =>
  targetModal.classList.add("hidden"),
);

// ===== FORM SUBMIT (UNCHANGED LOGIC) =====
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

  const exerciseIds = Array.from(checked).map((i) => i.value);

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();
    if (data.status === "success") {
      formMessage.textContent = "Workout plan updated!";
      formMessage.style.color = "green";
      setTimeout(() => (window.location.href = "/workoutPlan"), 600);
    }
  } catch {
    formMessage.textContent = "Something went wrong.";
    formMessage.style.color = "red";
  }
});

// ===== INSTRUCTION MODAL (YOUR ORIGINAL) =====
const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

function attachInfoButtons() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = () => {
      const ex = exercises[btn.dataset.index];

      modalGif.src = ex.gifURL || "";
      modalGif.style.display = ex.gifURL ? "block" : "none";

      modalInstructions.innerHTML =
        "<h4>Instructions:</h4><ul>" +
        ex.instructions.map((s) => `<li>${s}</li>`).join("") +
        "</ul>";

      modal.classList.remove("hidden");
    };
  });
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
