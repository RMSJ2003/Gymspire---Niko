// const finishButtons = document.querySelectorAll(".finish-btn");
// const finishMessage = document.querySelector("#finishMessage");

// finishButtons.forEach((btn) => {
//   btn.addEventListener("click", async () => {
//     const workoutLogId = btn.dataset.logId;
//     const isChallenge = btn.dataset.isChallenge === "true";

//     const formData = new FormData();

//     const videoInput = document.querySelector(
//       `.video-input[data-log-id="${workoutLogId}"]`,
//     );

//     // If challenge → OFFER video upload, but DO NOT require
//     if (isChallenge && videoInput) {
//       videoInput.click();

//       videoInput.onchange = async () => {
//         if (videoInput.files.length) {
//           formData.append("video", videoInput.files[0]);
//         }

//         await submitFinish(workoutLogId, formData);
//       };

//       return;
//     }

//     // Solo workout → no video flow
//     await submitFinish(workoutLogId, formData);
//   });
// });

// async function submitFinish(workoutLogId, formData) {
//   try {
//     const res = await fetch(`/api/v1/workout-logs/${workoutLogId}/finish`, {
//       method: "PATCH",
//       credentials: "include",
//       body: formData,
//     });

//     const data = await res.json();

//     if (res.ok) {
//       finishMessage.textContent = "Workout finished successfully!";
//       finishMessage.style.color = "green";

//       setTimeout(() => {
//         window.location.reload();
//       }, 700);
//     } else {
//       finishMessage.textContent = data.message || "Failed to finish workout.";
//       finishMessage.style.color = "red";
//     }
//   } catch (err) {
//     console.error(err);
//     finishMessage.textContent = "Something went wrong while finishing workout.";
//     finishMessage.style.color = "red";
//   }
// }

const finishButtons = document.querySelectorAll(".finish-btn");
const finishMessage = document.querySelector("#finishMessage");

finishButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const workoutLogId = btn.dataset.logId;
    const isChallenge = btn.dataset.isChallenge === "true";
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
});

async function submitFinish(workoutLogId, formData) {
  try {
    const res = await fetch(`/api/v1/workout-logs/${workoutLogId}/finish`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
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
// Write to Richard M. Sahagun
