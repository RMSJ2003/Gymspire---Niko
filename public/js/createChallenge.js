const exercises = window.exercises || [];
const exerciseIds = [];

const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");

const form = document.querySelector("#createChallengeForm");
const formMessage = document.querySelector("#formMessage");

const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

// GROUP BY MUSCLE
const grouped = {};

exercises.forEach((ex, index) => {
  if (!grouped[ex.target]) grouped[ex.target] = [];
  grouped[ex.target].push({ ...ex, index });
});

// CREATE MUSCLE CARDS
Object.keys(grouped).forEach((target) => {
  const card = document.createElement("div");
  card.className = "target-card";
  card.textContent = target;
  card.dataset.target = target;

  card.addEventListener("click", () => openTargetModal(target));

  targetGrid.appendChild(card);
});

// OPEN EXERCISE MODAL
function openTargetModal(target) {
  targetTitle.textContent = target;
  targetExerciseList.innerHTML = "";

  grouped[target].forEach((exercise) => {
    const row = document.createElement("div");
    row.className = "exercise-row";

    row.innerHTML = `
      <label class="checkbox-container">
        <input type="checkbox" value="${exercise.exerciseId}">
        <span class="exercise-name">${exercise.name}</span>
      </label>

      <button class="info-btn" data-index="${exercise.index}">i</button>
    `;

    const checkbox = row.querySelector("input");

    checkbox.addEventListener("change", (e) => {
      const id = exercise.exerciseId;

      if (e.target.checked) exerciseIds.push(id);
      else exerciseIds.splice(exerciseIds.indexOf(id), 1);
    });

    targetExerciseList.appendChild(row);
  });

  attachInfoButtons();
  targetModal.classList.remove("hidden");
}

closeTargetModal.onclick = () => targetModal.classList.add("hidden");

// CREATE CHALLENGE
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (exerciseIds.length === 0) {
    formMessage.textContent = "Select at least one exercise.";
    return;
  }

  const res = await fetch("/api/v1/challenges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      startTime,
      endTime,
      exerciseIds,
    }),
  });

  const data = await res.json();

  if (data.status === "success") {
    formMessage.textContent = "Challenge created!";
    setTimeout(() => (location.href = "/challenges"), 600);
  } else {
    formMessage.textContent = data.message;
  }
});

// INFO BUTTONS
function attachInfoButtons() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = () => {
      const ex = exercises[btn.dataset.index];

      modalGif.src = ex.gifURL || "";
      modalGif.style.display = ex.gifURL ? "block" : "none";

      modalInstructions.innerHTML =
        "<h4>Instructions</h4><ul>" +
        ex.instructions.map((s) => `<li>${s}</li>`).join("") +
        "</ul>";

      modal.classList.remove("hidden");
    };
  });
}

closeModal.onclick = () => modal.classList.add("hidden");
