// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modalText");
  const modalVideo = document.getElementById("modalVideo");
  const closeModal = document.getElementById("closeModal");

  // Info data for each card
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
    { text: "Start a solo workout anytime.", video: "/clip/solo.mp4" },
  ];

  // Open modal when info button is clicked
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      modalText.textContent = infoData[index].text;
      modalVideo.src = infoData[index].video; // Optional video
      modal.classList.remove("hidden");
      modalVideo.play();
    });
  });

  // Close modal button
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden");
    modalVideo.pause();
    modalVideo.currentTime = 0;
  });

  // Close modal when clicking outside content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      modalVideo.pause();
      modalVideo.currentTime = 0;
    }
  });
});
