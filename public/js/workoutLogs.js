const finishButtons = document.querySelectorAll(".finish-btn");
const finishMessage = document.querySelector("#finishMessage");

finishButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const workoutLogId = btn.dataset.logId;
    const isChallenge = btn.dataset.isChallenge === "true";

    const formData = new FormData();

    // 🔥 If challenge, require video file
    if (isChallenge) {
      const videoInput = document.querySelector(
        `.video-input[data-log-id="${workoutLogId}"]`,
      );

      // Open file picker
      videoInput.click();

      videoInput.onchange = async () => {
        if (!videoInput.files.length) {
          alert("Video is required for challenge workouts.");
          return;
        }

        formData.append("video", videoInput.files[0]);

        await submitFinish(workoutLogId, formData);
      };

      return; // wait for file selection
    }

    // Solo workout → no video needed
    await submitFinish(workoutLogId, formData);
  });
});

async function submitFinish(workoutLogId, formData) {
  try {
    const res = await fetch(`/api/v1/workout-logs/${workoutLogId}/finish`, {
      method: "PATCH",
      credentials: "include",
      body: formData, // 🔥 multipart/form-data
    });

    const data = await res.json();

    if (res.ok) {
      finishMessage.textContent = "Workout finished successfully!";
      finishMessage.style.color = "green";

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      finishMessage.textContent = data.message || "Failed to finish workout.";
      finishMessage.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    finishMessage.textContent = "Something went wrong while finishing workout.";
    finishMessage.style.color = "red";
  }
}
