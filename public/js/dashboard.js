// document.addEventListener("DOMContentLoaded", () => {
//   const modal = document.getElementById("modal");
//   const modalText = document.getElementById("modalText");
//   const modalVideo = document.getElementById("modalVideo");
//   const closeModal = document.getElementById("closeModal");

//   // Info data for each card
//   const infoData = [
//     {
//       text: "Check out daily challenges to improve your workouts.",
//       video: "/clip/challenges.mp4",
//     },
//     {
//       text: "Plan your workouts effectively with GymSpire.",
//       video: "/clip/workout_plan.mp4",
//     },
//     {
//       text: "Track your workout logs over time.",
//       video: "/clip/workout_logs.mp4",
//     },
//     { text: "Start a solo workout anytime.", video: "/clip/solo.mp4" },
//   ];

//   // Open modal when info button is clicked
//   document.querySelectorAll(".info-btn").forEach((btn) => {
//     btn.addEventListener("click", () => {
//       const index = btn.dataset.index;
//       modalText.textContent = infoData[index].text;
//       modalVideo.src = infoData[index].video; // Optional video
//       modal.classList.remove("hidden");
//       modalVideo.play();
//     });
//   });

//   // Close modal button
//   closeModal.addEventListener("click", () => {
//     modal.classList.add("hidden");
//     modalVideo.pause();
//     modalVideo.currentTime = 0;
//   });

//   // Close modal when clicking outside content
//   modal.addEventListener("click", (e) => {
//     if (e.target === modal) {
//       modal.classList.add("hidden");
//       modalVideo.pause();
//       modalVideo.currentTime = 0;
//     }
//   });

//   // ✅ Fix all card links dynamically to kebab-case
//   document.querySelectorAll(".card").forEach((card) => {
//     const link = card.querySelector(".card-link");
//     if (link) {
//       const text = link.textContent;
//       const url = "/" + text.toLowerCase().replaceAll(" ", "-");
//       link.href = url;
//     }
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modalText");
  const modalVideo = document.getElementById("modalVideo");
  const closeModal = document.getElementById("closeModal");

  // 🔹 Info data for each card modal
  const infoData = [
    {
      text: "Check out daily challenges to improve your workouts.",
      video: "/clip/challenges.mp4",
    },
    {
      text: "Plan your workouts effectively with GymSpire.",
      video: "/clip/workout_plan.mp4",
    },
    {
      text: "Track your workout logs over time.",
      video: "/clip/workout_logs.mp4",
    },
    {
      text: "Start a solo workout anytime.",
      video: "/clip/solo.mp4",
    },
  ];

  // 🔹 Open modal
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      modalText.textContent = infoData[index].text;
      modalVideo.src = infoData[index].video;
      modal.classList.remove("hidden");
      modalVideo.play();
    });
  });

  // 🔹 Close modal button
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    modalVideo.pause();
    modalVideo.currentTime = 0;
  });

  // 🔹 Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }
  });

  // ==================================================
  // ✅ FIXED CARD ROUTING SYSTEM (NO AUTO-GENERATE)
  // ==================================================

  // Map EXACT card names → EXISTING backend routes
  const routes = {
    Challenges: "/challenges",
    "Workout Plan": "/workoutPlan",
    "Workout Logs": "/workoutLogs",
    "Solo Workout": "/startSoloWorkout",
    Users: "/users",
    "Exercises Management": "/exercisesManagement",
  };

  document.querySelectorAll(".card").forEach((card) => {
    const link = card.querySelector(".card-link");

    if (!link) return;

    const text = link.textContent.trim();
    if (routes[text]) {
      console.log(routes, text);
      link.href = routes[text];
    } else {
      console.warn(`⚠ No backend route defined for: ${text}`);
      link.href = "#";
    }
  });
});
