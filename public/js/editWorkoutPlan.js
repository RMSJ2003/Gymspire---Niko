const exercises = window.exercises || [];
const selectedIds = window.selectedIds || [];

const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");

const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

const form = document.querySelector("#editWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

/* ONE EXERCISE PER MUSCLE */
let selectedByTarget = {};

/* PRELOAD FROM DB */
selectedIds.forEach((id) => {
  const ex = exercises.find((e) => e.exerciseId === id);
  if (ex) selectedByTarget[ex.target] = id;
});

/* GROUP EXERCISES BY TARGET */
const grouped = {};
exercises.forEach((ex, index) => {
  if (!grouped[ex.target]) grouped[ex.target] = [];
  grouped[ex.target].push({ ...ex, index });
});

/* BUILD TARGET CARDS */
Object.keys(grouped).forEach((target) => {
  const card = document.createElement("div");
  card.className = "target-card";
  card.dataset.target = target;
  card.innerHTML = `<span>${target}</span>`;

  if (selectedByTarget[target]) card.classList.add("active");

  card.onclick = () => openTargetModal(target);
  targetGrid.appendChild(card);
});

/* OPEN TARGET MODAL */
function openTargetModal(target) {
  targetTitle.textContent = target;
  targetExerciseList.innerHTML = "";

  grouped[target].forEach((ex) => {
    const isSelected = selectedByTarget[target] === ex.exerciseId;

    const row = document.createElement("div");
    row.className = "exercise-row" + (isSelected ? " selected" : "");

    row.innerHTML = `
      <div class="exercise-left">
        <input type="radio" name="exercise-${target}" value="${ex.exerciseId}" ${isSelected ? "checked" : ""}>
        <span class="exercise-name">${ex.name}</span>
      </div>
      <button class="info-btn" data-index="${ex.index}" type="button" title="View exercise info">i</button>
    `;

    const radio = row.querySelector("input");

    row.onclick = (e) => {
      if (e.target.classList.contains("info-btn")) return;

      selectedByTarget[target] = ex.exerciseId;

      // Deselect all in this group
      document
        .querySelectorAll(`input[name="exercise-${target}"]`)
        .forEach((r) => {
          r.checked = false;
          r.closest(".exercise-row").classList.remove("selected");
        });

      radio.checked = true;
      row.classList.add("selected");

      const card = document.querySelector(`[data-target="${target}"]`);
      if (card) card.classList.add("active");
    };

    targetExerciseList.appendChild(row);
  });

  attachInfoButtons();
  targetModal.classList.remove("hidden");
}

/* ATTACH INFO BUTTON HANDLERS */
function attachInfoButtons() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();

      const ex = exercises[btn.dataset.index];
      if (!ex) return;

      modalGif.src = ex.gifURL || "";
      modalGif.style.display = ex.gifURL ? "block" : "none";

      modalInstructions.innerHTML =
        "<h4>Instructions</h4><ul>" +
        (ex.instructions || []).map((s) => `<li>${s}</li>`).join("") +
        "</ul>";

      modal.classList.remove("hidden");
    };
  });
}

/* CLOSE MODALS */
closeTargetModal.onclick = () => targetModal.classList.add("hidden");
closeModal.onclick = () => modal.classList.add("hidden");

// Close on backdrop click
targetModal.onclick = (e) => {
  if (e.target === targetModal) targetModal.classList.add("hidden");
};
modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    targetModal.classList.add("hidden");
    modal.classList.add("hidden");
  }
});

/* SUBMIT */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const exerciseIds = Object.values(selectedByTarget);

  if (exerciseIds.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    return;
  }

  formMessage.textContent = "";

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.style.color = "#3a9e6a";
      formMessage.textContent = "Workout plan updated!";
      setTimeout(() => (location.href = "/workoutPlan"), 700);
    } else {
      formMessage.textContent = data.message || "Something went wrong.";
    }
  } catch (err) {
    formMessage.textContent = "Network error. Please try again.";
  }
});
