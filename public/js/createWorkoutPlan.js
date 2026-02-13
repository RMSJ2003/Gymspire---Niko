// ===== DATA =====
const exercises = window.exercises || [];
const exerciseIds = []; // for new plan, start empty

// DOM elements
const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");
const form = document.querySelector("#createWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

// MODAL FOR EXERCISE INSTRUCTIONS
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
  card.textContent = target;
  card.dataset.target = target;

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

    const isChecked = exerciseIds.includes(exercise.exerciseId)
      ? "checked"
      : "";

    row.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" name="exerciseIds" value="${exercise.exerciseId}" ${isChecked}>
        <span class="exercise-name">${exercise.name}</span>
      </label>
      <button class="info-btn" data-index="${exercise.index}">i</button>
    `;

    targetExerciseList.appendChild(row);

    // ===== UPDATE SELECTED IDS + TARGET CARD COLOR =====
    const checkbox = row.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", (e) => {
      const id = exercise.exerciseId;

      if (e.target.checked) {
        if (!exerciseIds.includes(id)) exerciseIds.push(id);
      } else {
        const idx = exerciseIds.indexOf(id);
        if (idx > -1) exerciseIds.splice(idx, 1);
      }

      // ===== UPDATE TARGET CARD COLOR =====
      const hasSelected = grouped[target].some((ex) =>
        exerciseIds.includes(ex.exerciseId),
      );
      const targetCard = document.querySelector(
        `.target-card[data-target="${target}"]`,
      );
      if (targetCard) {
        if (hasSelected) targetCard.classList.add("active");
        else targetCard.classList.remove("active");
      }
    });
  });

  attachInfoButtons();
  targetModal.classList.remove("hidden");
}

// ===== CLOSE TARGET MODAL =====
closeTargetModal.addEventListener("click", () => {
  targetModal.classList.add("hidden");
});

// ===== FORM SUBMIT =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

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
      setTimeout(() => (window.location.href = "/workoutPlan"), 600);
    } else {
      throw new Error("Failed");
    }
  } catch {
    formMessage.textContent = "Something went wrong.";
    formMessage.style.color = "red";
  }
});

// ===== EXERCISE INSTRUCTIONS MODAL =====
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

// ===== CLOSE MODAL =====
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});
