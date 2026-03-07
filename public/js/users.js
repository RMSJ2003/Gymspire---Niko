document.addEventListener("DOMContentLoaded", () => {
  // ─────────────────────────────────────────────
  // DELETE USER
  // ─────────────────────────────────────────────
  document.querySelectorAll(".delete-user-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.userId;
      if (!confirm("Are you sure you want to deactivate this user?")) return;

      try {
        const res = await fetch(`/api/v1/users/${userId}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to delete user.");
          return;
        }
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Network error.");
      }
    });
  });

  // ─────────────────────────────────────────────
  // CLINIC APPROVE / DECLINE
  // ─────────────────────────────────────────────
  document.addEventListener("click", async (e) => {
    const approveBtn = e.target.closest(".approve-user-btn");
    const declineBtn = e.target.closest(".decline-user-btn");

    if (approveBtn) {
      await fetch(`/api/v1/clinic/approve/${approveBtn.dataset.userId}`, {
        method: "PATCH",
      });
      location.reload();
    }

    if (declineBtn) {
      await fetch(`/api/v1/clinic/decline/${declineBtn.dataset.userId}`, {
        method: "PATCH",
      });
      location.reload();
    }
  });

  // ─────────────────────────────────────────────
  // ATTENDANCE DRAWER
  // ─────────────────────────────────────────────
  const drawer = document.getElementById("attendanceDrawer");
  const overlay = document.getElementById("drawerOverlay");
  const drawerClose = document.getElementById("drawerClose");
  const drawerPfp = document.getElementById("drawerPfp");
  const drawerUsername = document.getElementById("drawerUsername");
  const drawerBody = document.getElementById("drawerBody");

  // stat spans
  const drawerTotalVisits = document.getElementById("drawerTotalVisits");
  const drawerThisMonth = document.getElementById("drawerThisMonth");
  const drawerAvgDuration = document.getElementById("drawerAvgDuration");

  function openDrawer() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  drawerClose.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // ── Load attendance for a user ────────────────
  async function loadAttendance(userId, username, pfp) {
    // Set header info
    drawerPfp.src = pfp;
    drawerUsername.textContent = username;

    // Reset stats
    drawerTotalVisits.textContent = "—";
    drawerThisMonth.textContent = "—";
    drawerAvgDuration.textContent = "—";

    // Show loading state
    drawerBody.innerHTML = `
      <div class="drawer-loading">
        <div class="spinner"></div>
        <p>Loading attendance...</p>
      </div>`;

    openDrawer();

    try {
      const res = await fetch(`/api/v1/users/${userId}/attendance`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load attendance");

      const records = data.data || [];
      renderAttendance(records);
    } catch (err) {
      console.error(err);
      drawerBody.innerHTML = `
        <div class="no-attendance">
          <p>⚠️ Could not load attendance data.</p>
        </div>`;
    }
  }

  function renderAttendance(records) {
    // ── Compute stats ──────────────────────────
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(r.checkinTime);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    });

    const withDuration = records.filter(
      (r) => r.durationMinutes != null && r.durationMinutes > 0,
    );
    const avgDuration = withDuration.length
      ? Math.round(
          withDuration.reduce((sum, r) => sum + r.durationMinutes, 0) /
            withDuration.length,
        )
      : null;

    drawerTotalVisits.textContent = records.length;
    drawerThisMonth.textContent = thisMonth.length;
    drawerAvgDuration.textContent =
      avgDuration != null ? `${avgDuration}` : "—";

    // ── Render list ────────────────────────────
    if (records.length === 0) {
      drawerBody.innerHTML = `
        <div class="no-attendance">
          <p>No gym visits recorded yet.</p>
        </div>`;
      return;
    }

    const html = records
      .map((r) => {
        const checkin = new Date(r.checkinTime);
        const checkout = r.checkoutTime ? new Date(r.checkoutTime) : null;

        const dateStr = checkin.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const checkinTimeStr = checkin.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const checkoutTimeStr = checkout
          ? checkout.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "Still at gym";

        const icon = r.source === "workout" ? "🏋️" : "📍";
        const durText =
          r.durationMinutes != null
            ? `${r.durationMinutes} min`
            : checkout
              ? "< 1 min"
              : "Ongoing";

        return `
        <div class="attendance-record">
          <div class="record-icon ${r.source}">${icon}</div>
          <div class="record-info">
            <div class="record-date">${dateStr}</div>
            <div class="record-time">${checkinTimeStr} → ${checkoutTimeStr}</div>
            <div class="record-meta">
              <span class="record-source source-${r.source}">${r.source}</span>
              <span class="record-duration">⏱ ${durText}</span>
            </div>
          </div>
        </div>`;
      })
      .join("");

    drawerBody.innerHTML = html;
  }

  // ── Attach click handlers to all attendance buttons ──
  document.querySelectorAll(".attendance-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { userId, username, pfp } = btn.dataset;
      loadAttendance(userId, username, pfp);
    });
  });
});
