// ===== DATA =====
const exercises = window.exercises || [];

// ✅ Multi-select: Set of selected exerciseIds
let selectedSet = new Set();

// DOM elements
const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");
const form = document.querySelector("#createWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

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
  card.dataset.target = target;
  card.innerHTML = `<span>${target}</span>`;
  card.onclick = () => openTargetModal(target);
  targetGrid.appendChild(card);
});

function updateCardLabel(card, target) {
  const count = grouped[target].filter((ex) =>
    selectedSet.has(ex.exerciseId),
  ).length;
  card.innerHTML =
    `<span>${target}</span>` +
    (count > 0 ? `<span class="muscle-count">${count} selected</span>` : "");
  if (count > 0) card.classList.add("active");
  else card.classList.remove("active");
}

// ===== OPEN TARGET MODAL =====
function openTargetModal(target) {
  targetTitle.textContent = target;
  targetExerciseList.innerHTML = "";

  grouped[target].forEach((ex) => {
    const isSelected = selectedSet.has(ex.exerciseId);

    const row = document.createElement("div");
    row.className = "exercise-row" + (isSelected ? " selected" : "");

    row.innerHTML = `
      <div class="exercise-left">
        <input type="checkbox" name="exercise-${target}" value="${ex.exerciseId}" ${isSelected ? "checked" : ""}>
        <span class="exercise-name">${ex.name}</span>
      </div>
      <button class="info-btn" data-index="${ex.index}" type="button">i</button>
    `;

    const checkbox = row.querySelector("input");

    row.onclick = (e) => {
      if (e.target.classList.contains("info-btn")) return;

      if (selectedSet.has(ex.exerciseId)) {
        selectedSet.delete(ex.exerciseId);
        checkbox.checked = false;
        row.classList.remove("selected");
      } else {
        selectedSet.add(ex.exerciseId);
        checkbox.checked = true;
        row.classList.add("selected");
      }

      const card = document.querySelector(`[data-target="${target}"]`);
      if (card) updateCardLabel(card, target);
    };

    checkbox.onclick = (e) => e.stopPropagation();
    checkbox.onchange = () => {
      if (checkbox.checked) {
        selectedSet.add(ex.exerciseId);
        row.classList.add("selected");
      } else {
        selectedSet.delete(ex.exerciseId);
        row.classList.remove("selected");
      }
      const card = document.querySelector(`[data-target="${target}"]`);
      if (card) updateCardLabel(card, target);
    };

    targetExerciseList.appendChild(row);
  });

  attachInfoButtons();
  targetModal.classList.remove("hidden");
}

// ===== CLOSE MODALS =====
closeTargetModal.onclick = () => targetModal.classList.add("hidden");
closeModal.onclick = () => modal.classList.add("hidden");

modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    targetModal.classList.add("hidden");
    modal.classList.add("hidden");
  }
});

// ===== INFO BUTTON =====
function attachInfoButtons() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();

      const ex = exercises[btn.dataset.index];
      if (!ex) return;

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

// ===== FORM SUBMIT =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const exerciseIds = Array.from(selectedSet);

  if (exerciseIds.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    formMessage.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Workout plan created!";
      formMessage.style.color = "green";
      setTimeout(() => {
        window.location.href = "/workoutPlan";
      }, 600);
    } else {
      formMessage.textContent = data.message;
    }
  } catch (err) {
    formMessage.textContent = err.message;
    formMessage.style.color = "red";
  }
});
