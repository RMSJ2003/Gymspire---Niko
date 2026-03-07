// ==============================
// JOIN CHALLENGE
// ==============================
const joinButtons = document.querySelectorAll(".join-btn");
const joinMessage = document.querySelector("#joinMessage");

joinButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const joinCode = btn.dataset.joinCode;
    try {
      const res = await fetch(`/api/v1/challenges/${joinCode}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.status === "success") {
        joinMessage.textContent = "Successfully joined the challenge!";
        joinMessage.style.color = "green";
        setTimeout(() => window.location.reload(), 700);
      } else {
        joinMessage.textContent = data.message || "Failed to join challenge.";
        joinMessage.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      joinMessage.textContent = "Something went wrong while joining.";
      joinMessage.style.color = "red";
    }
  });
});

// ==============================
// LEADERBOARD (Two-Tier)
// ==============================
const leaderboardButtons = document.querySelectorAll(".leaderboard-btn");

leaderboardButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const challengeId = btn.dataset.challengeId;
    const container = document.querySelector(`#leaderboard-${challengeId}`);
    if (container.style.display === "block") {
      container.style.display = "none";
      btn.textContent = "View Leaderboard";
      return;
    }
    try {
      const res = await fetch(`/api/v1/challenges/${challengeId}/leaderboard`);
      const data = await res.json();
      if (data.status !== "success") {
        container.innerHTML =
          "<p style='color:red'>Failed to load leaderboard.</p>";
        container.style.display = "block";
        return;
      }

      const leaderboard = data.data;
      if (leaderboard.length === 0) {
        container.innerHTML = "<p>No leaderboard data yet.</p>";
        container.style.display = "block";
        btn.textContent = "Hide Leaderboard";
        return;
      }

      const verified = leaderboard.filter(
        (r) => r.judgeStatus === "approved" && r.videoUrl,
      );
      const unverified = leaderboard.filter(
        (r) => !(r.judgeStatus === "approved" && r.videoUrl),
      );

      const buildRows = (rows, startRank) =>
        rows
          .map(
            (row, i) => `
        <tr>
          <td>#${startRank + i}</td>
          <td>${row.username}</td>
<td>${row.strengthScore != null ? row.strengthScore.toFixed(2) : "—"}</td>          <td>
            ${
              row.judgeStatus === "approved" && row.videoUrl
                ? `<span class="lb-badge lb-verified">✔ Verified</span>`
                : row.videoUrl
                  ? `<span class="lb-badge lb-pending">⏳ Pending</span>`
                  : `<span class="lb-badge lb-no-video">No Video</span>`
            }
          </td>
        </tr>`,
          )
          .join("");

      let html = `<h4>Leaderboard</h4>`;

      if (verified.length) {
        html += `
          <p class="lb-tier-label lb-tier-verified">✔ Verified Submissions</p>
          <table>
            <tr><th>Rank</th><th>Username</th><th>Score</th><th>Status</th></tr>
            ${buildRows(verified, 1)}
          </table>`;
      }

      if (unverified.length) {
        html += `
          <p class="lb-tier-label lb-tier-unverified">⏳ Unverified Submissions</p>
          <table>
            <tr><th>Rank</th><th>Username</th><th>Score</th><th>Status</th></tr>
            ${buildRows(unverified, 1)}
          </table>`;
      }

      container.innerHTML = html;
      container.style.display = "block";
      btn.textContent = "Hide Leaderboard";
    } catch (err) {
      console.error(err);
      container.innerHTML =
        "<p style='color:red'>Error loading leaderboard.</p>";
      container.style.display = "block";
    }
  });
});

// ==============================
// START CHALLENGE
// ==============================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("start-btn")) {
    const challengeId = e.target.dataset.challengeId;
    try {
      const res = await fetch(`/api/v1/workout-logs/challenge/${challengeId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        window.location.href = `/workoutLogs/${data.data._id}`;
      } else {
        alert(data.message || "Cannot start challenge.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while starting the challenge.");
    }
  }
});
