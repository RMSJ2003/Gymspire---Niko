document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modalText");
  const modalVideo = document.getElementById("modalVideo");
  const closeModal = document.getElementById("closeModal");

  // 🔹 Info data for cards
  const infoData = [
    {
      text: "Plan your workouts effectively with GymSpire.",
      video: "/clip/workout_plan.mp4",
    },
    {
      text: "Check out daily challenges to improve your workouts.",
      video: "/clip/challenges.mp4",
    },
    {
      text: "Track your workout logs over time.",
      video: "/clip/workout_logs.mp4",
    },
    { text: "Start a solo workout anytime.", video: "/clip/solo.mp4" },
  ];

  // 🔹 Open modal when clicking info buttons
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

  // 🔹 Fix card link routing
  const routes = {
    "Workout Plan": "/workoutPlan",
    Challenges: "/challenges",
    "Workout Logs": "/workoutLogs",
    "Start Solo Workout": "/startSoloWorkout",
  };

  document.querySelectorAll(".card").forEach((card) => {
    const link = card.querySelector(".card-link");
    if (!link) return;
    const text = link.textContent.trim();
    link.href = routes[text] || "#";
  });

  // 🔹 Hamburger panel toggle
  const hamburger = document.querySelector(".hamburger");
  const panel = document.querySelector(".panel");

  if (hamburger && panel) {
    hamburger.addEventListener("click", () => {
      panel.classList.toggle("open");
    });

    // Close panel when clicking outside
    document.addEventListener("click", (e) => {
      if (!panel.contains(e.target) && e.target !== hamburger) {
        panel.classList.remove("open");
      }
    });
  }
});
