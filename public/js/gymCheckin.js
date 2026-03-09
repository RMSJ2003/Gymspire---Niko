// =========================
// GYM CHECK-IN  —  gymCheckin.js
// =========================

(function () {
  const checkinBtn = document.getElementById("checkinBtn");
  const checkinBtnText = document.getElementById("checkinBtnText");
  const workoutPrompt = document.getElementById("workoutPrompt");
  const checkoutRow = document.getElementById("checkoutRow");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const attendanceEl = document.getElementById("attendanceLogged");
  const checkinTimeEl = document.getElementById("checkinTime");

  if (!checkinBtn) return;

  // ── TOAST ─────────────────────────────────────────────────
  function showToast(message, type = "error") {
    const existing = document.getElementById("gymToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "gymToast";

    const colors = {
      error: { bg: "#d25353", icon: "✕" },
      success: { bg: "#22c55e", icon: "✓" },
      info: { bg: "#3b82f6", icon: "ℹ" },
    };
    const { bg, icon } = colors[type] || colors.error;

    toast.style.cssText = `
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: ${bg};
      color: white;
      padding: 0.75rem 1.4rem;
      border-radius: 0.75rem;
      font-family: Arial, sans-serif;
      font-size: 0.88rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.55rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
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
    }, 3500);
  }

  // ── RESTORE CHECKED-IN STATE ──────────────────────────────
  function setCheckedInUI(checkinTime) {
    checkinBtn.disabled = true;
    checkinBtn.classList.add("checked-in");
    checkinBtnText.textContent = "Checked in ✓";
    workoutPrompt.classList.add("show");
    checkoutRow.classList.add("show");

    if (checkinTime) {
      const d = new Date(checkinTime);
      checkinTimeEl.textContent = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      attendanceEl.classList.add("show");
    }
  }

  // ── ON PAGE LOAD: check backend status ───────────────────
  const gymStatus = checkinBtn.dataset.gymStatus; // "atGym" | "logging" | "offline"
  const checkinTime = checkinBtn.dataset.checkinTime; // ISO string or ""

  if (gymStatus === "atGym" || gymStatus === "logging") {
    setCheckedInUI(checkinTime);
  }

  // ── CHECK IN ──────────────────────────────────────────────
  checkinBtn.addEventListener("click", async () => {
    // Already checked in — do nothing
    if (checkinBtn.classList.contains("checked-in")) return;

    if (!navigator.geolocation) {
      showToast("Your browser does not support location.", "error");
      return;
    }

    checkinBtn.disabled = true;
    checkinBtnText.textContent = "Getting location...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch("/api/v1/users/gymCheckin", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "atGym", latitude, longitude }),
          });

          const data = await res.json();

          if (data.status === "success") {
            setCheckedInUI(new Date().toISOString());
            showToast("You're checked in at the gym!", "success");
          } else {
            checkinBtn.disabled = false;
            checkinBtnText.textContent = "I'm at the gym";
            showToast(data.message || "Check-in failed.", "error");
          }
        } catch (e) {
          checkinBtn.disabled = false;
          checkinBtnText.textContent = "I'm at the gym";
          showToast("Network error. Please try again.", "error");
        }
      },
      () => {
        checkinBtn.disabled = false;
        checkinBtnText.textContent = "I'm at the gym";
        showToast(
          "Location access denied. Please enable location to check in.",
          "error",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });

  // ── CHECK OUT ─────────────────────────────────────────────
  checkoutBtn.addEventListener("click", async () => {
    checkinBtn.disabled = false;
    checkinBtn.classList.remove("checked-in");
    checkinBtnText.textContent = "I'm at the gym";
    workoutPrompt.classList.remove("show");
    checkoutRow.classList.remove("show");
    attendanceEl.classList.remove("show");

    try {
      await fetch("/api/v1/users/gymCheckin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "offline" }),
      });
      showToast("Checked out successfully.", "info");
    } catch (e) {
      console.warn("Check-out sync failed.");
    }
  });
})();
