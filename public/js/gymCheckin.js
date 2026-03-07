// =========================
// GYM CHECK-IN  —  gymCheckin.js
// Handles the "I'm at the gym" button in the
// Currently Working Out card on the dashboard.
// =========================

(function () {
  const checkinBtn     = document.getElementById("checkinBtn");
  const checkinBtnText = document.getElementById("checkinBtnText");
  const workoutPrompt  = document.getElementById("workoutPrompt");
  const checkoutRow    = document.getElementById("checkoutRow");
  const checkoutBtn    = document.getElementById("checkoutBtn");
  const attendanceEl   = document.getElementById("attendanceLogged");
  const checkinTimeEl  = document.getElementById("checkinTime");
  const onlineList     = document.getElementById("onlineUsersList"); // optional

  if (!checkinBtn) return; // guard — not on this page

  // ── CHECK IN ──────────────────────────────────────────────
  checkinBtn.addEventListener("click", async () => {
    checkinBtn.disabled = true;
    checkinBtn.classList.add("checked-in");
    checkinBtnText.textContent = "Checked in ✓";

    // Show workout nudge
    workoutPrompt.classList.add("show");

    // Show checkout button
    checkoutRow.classList.add("show");

    // Record and display time
    const now = new Date();
    checkinTimeEl.textContent = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    attendanceEl.classList.add("show");

    // PATCH user's gymStatus on the server
    try {
      await fetch("/api/v1/users/gymCheckin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "atGym" }),
      });
    } catch (e) {
      console.warn("Check-in sync failed — recorded locally only.");
    }
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
    } catch (e) {
      console.warn("Check-out sync failed.");
    }
  });
})();
