const finishBtn = document.querySelector("#finish-btn");
const saveBtn = document.querySelector("#saveSetsBtn");

if (finishBtn) {
  finishBtn.addEventListener("click", async () => {
    const workoutLogId = finishBtn.dataset.logId;
    const isChallenge = finishBtn.dataset.isChallenge === "true";
    const formData = new FormData();

    // 🔥 Ask user if they want to upload a video (OPTIONAL)
    if (isChallenge) {
      const wantsVideo = confirm("Do you want to upload a video? (Optional)");

      if (wantsVideo) {
        const videoInput = document.querySelector(
          `.video-input[data-log-id="${workoutLogId}"]`,
        );

        videoInput.click();

        videoInput.onchange = async () => {
          if (videoInput.files.length) {
            formData.append("video", videoInput.files[0]);
          }

          await submitFinish(workoutLogId, formData);
        };

        return; // wait for file selection
      }
    }

    // 🔥 No video chosen → finish immediately
    await submitFinish(workoutLogId, formData);
  });
}

async function submitFinish(workoutLogId, formData) {
  try {
    const res = await fetch(`/api/v1/workout-logs/${workoutLogId}/finish`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("Workout finished!");
      location.reload();
    } else {
      alert(data.message || "Failed to finish workout.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while finishing workout.");
  }
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const workoutLogId = saveBtn.dataset.logId;

    const inputs = document.querySelectorAll(".set-input");
    const updates = [];

    inputs.forEach((input) => {
      const setId = input.dataset.setId;
      const field = input.dataset.field;
      const value = input.value;

      let existing = updates.find((u) => u.setId === setId);
      if (!existing) {
        existing = { setId };
        updates.push(existing);
      }

      existing[field] = value;
    });

    try {
      const res = await fetch(
        `/api/v1/workout-logs/${workoutLogId}/sets/bulk`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ updates }),
        },
      );

      const data = await res.json();
      const msg = document.querySelector("#setMessage");

      if (res.ok) {
        msg.textContent = "Working sets saved successfully!";
        msg.style.color = "green";
      } else {
        msg.textContent = data.message || "Failed to save sets";
        msg.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving sets.");
    }
  });
}
