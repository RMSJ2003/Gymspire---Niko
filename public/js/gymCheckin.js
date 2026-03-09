// =========================
// GYM CHECK-IN — gymCheckin.js
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

  // ── RESTORE STATE ON PAGE LOAD ────────────────────────────
  // Read gymStatus from the button's data attribute (set server-side in Pug)
  const initialStatus = checkinBtn.dataset.gymStatus || "offline";

  if (initialStatus === "atGym") {
    applyCheckedInState(checkinBtn.dataset.checkinTime);
  } else if (initialStatus === "logging") {
    applyLoggingState(checkinBtn.dataset.checkinTime);
  }

  // ── CHECK IN ──────────────────────────────────────────────
  checkinBtn.addEventListener("click", async () => {
    if (checkinBtn.disabled) return;
    checkinBtn.disabled = true;

    // Get GPS location first
    if (!navigator.geolocation) {
      showError("Geolocation not supported by your browser.");
      checkinBtn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch("/api/v1/users/gymCheckin", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "atGym", latitude, longitude }),
          });
          const data = await res.json();

          if (!res.ok) {
            showError(data.message || "Check-in failed.");
            checkinBtn.disabled = false;
            return;
          }

          applyCheckedInState(new Date().toISOString());
        } catch (e) {
          showError("Network error. Please try again.");
          checkinBtn.disabled = false;
        }
      },
      (err) => {
        showError(
          "Location access denied. You must allow location to check in.",
        );
        checkinBtn.disabled = false;
      },
    );
  });

  // ── CHECK OUT ─────────────────────────────────────────────
  checkoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/v1/users/gymCheckin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "offline" }),
      });
    } catch (e) {
      console.warn("Check-out sync failed.");
    }

    checkinBtn.disabled = false;
    checkinBtn.classList.remove("checked-in");
    checkinBtnText.textContent = "I'm at the gym";
    workoutPrompt.classList.remove("show");
    checkoutRow.classList.remove("show");
    attendanceEl.classList.remove("show");
  });

  // ── HELPERS ───────────────────────────────────────────────
  function applyCheckedInState(isoTime) {
    checkinBtn.disabled = true;
    checkinBtn.classList.add("checked-in");
    checkinBtnText.textContent = "Checked in ✓";
    workoutPrompt.classList.add("show");
    checkoutRow.classList.add("show");
    attendanceEl.classList.add("show");

    if (isoTime) {
      const d = new Date(isoTime);
      checkinTimeEl.textContent = isNaN(d)
        ? ""
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  function applyLoggingState(isoTime) {
    // User manually checked in AND is now logging — show both indicators
    checkinBtn.disabled = true;
    checkinBtn.classList.add("checked-in");

    // Show "Logging workout ✓ · At Gym" if isAtGym, else just "Logging workout ✓"
    const isAtGym =
      checkinBtn.dataset.gymStatus === "logging" &&
      checkinBtn.dataset.isAtGym === "true";
    checkinBtnText.textContent = isAtGym
      ? "Logging workout ✓ · At Gym"
      : "Logging workout ✓";

    checkoutRow.classList.add("show");
    attendanceEl.classList.add("show");

    if (isoTime) {
      const d = new Date(isoTime);
      checkinTimeEl.textContent = isNaN(d)
        ? ""
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  function showError(msg) {
    const existing = document.getElementById("checkinError");
    if (existing) existing.remove();
    const el = document.createElement("p");
    el.id = "checkinError";
    el.style.cssText =
      "color:#d25353;font-size:0.8rem;font-weight:600;margin-top:8px;text-align:center;";
    el.textContent = msg;
    checkoutRow.parentNode.insertBefore(el, checkoutRow);
    setTimeout(() => el.remove(), 5000);
  }
})();
