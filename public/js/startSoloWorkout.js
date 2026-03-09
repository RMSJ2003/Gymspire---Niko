// =========================
// START SOLO WORKOUT
// =========================

// ── TOAST ─────────────────────────────────────────────────
function showToast(message, type = "warning") {
  const existing = document.getElementById("gymToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "gymToast";

  const colors = {
    error: { bg: "#d25353", icon: "✕" },
    success: { bg: "#22c55e", icon: "✓" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    warning: { bg: "#f59e0b", icon: "⚠" },
  };
  const { bg, icon } = colors[type] || colors.warning;

  toast.style.cssText = `
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: ${bg};
    color: white;
    padding: 0.75rem 1.4rem;
    border-radius: 10px;
    font-family: 'DM Sans', Arial, sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.55rem;
    box-shadow: 0 8px 28px rgba(0,0,0,0.22);
    z-index: 9999;
    max-width: 90vw;
    text-align: center;
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
  `;

  toast.innerHTML = `
    <span style="font-size:1rem;flex-shrink:0">${icon}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ── GYM STATUS CHECK ──────────────────────────────────────
async function checkGymStatus() {
  try {
    const res = await fetch("/api/v1/users/me");
    const data = await res.json();
    const gymStatus = data?.data?.data?.gymStatus || "offline";
    if (gymStatus !== "atGym" && gymStatus !== "logging") {
      showToast(
        "You are not checked in at the gym. Check in first so your attendance is recorded.",
        "warning",
      );
    }
  } catch (e) {
    // silently fail — don't block the workout
  }
}

checkGymStatus();

// ── FORM SUBMIT ───────────────────────────────────────────
const form = document.querySelector("#startSoloWorkoutForm");
const message = document.querySelector("#startMessage");
const startBtn = document.querySelector(".start-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const checked = [
    ...document.querySelectorAll("input[name='targets']:checked"),
  ];
  const targets = checked.map((cb) => cb.value);

  // Reset message
  message.textContent = "";
  message.className = "start-message";

  if (targets.length === 0) {
    message.textContent = "⚠ Please select at least one muscle group.";
    return;
  }

  startBtn.disabled = true;
  startBtn.querySelector("span").textContent = "Starting...";

  try {
    const res = await fetch("/api/v1/workout-logs/solo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targets }),
    });
    const data = await res.json();

    if (data.status === "success") {
      message.textContent = "✓ Workout started!";
      message.classList.add("success");
      setTimeout(() => {
        window.location.href = `/workoutLogs/${data.data._id}`;
      }, 500);
    } else {
      message.textContent = data.message || "Failed to start workout.";
      startBtn.disabled = false;
      startBtn.querySelector("span").textContent = "Start Workout";
    }
  } catch (err) {
    console.error(err);
    message.textContent = "Something went wrong. Please try again.";
    startBtn.disabled = false;
    startBtn.querySelector("span").textContent = "Start Workout";
  }
});
