const form = document.querySelector("#createWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

const modal = document.querySelector("#modal");
const modalVideo = document.querySelector("#modalVideo");
const modalText = document.querySelector("#modalText");
const closeModal = document.querySelector("#closeModal");

// Show modal when info-btn is clicked
document.querySelectorAll(".info-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const videoUrl = btn.dataset.video;
    const instructions = JSON.parse(btn.dataset.instructions || "[]");

    // Remove any previous GIF image
    const existingGif = document.querySelector("#modalGif");
    if (existingGif) existingGif.remove();

    // Video or GIF handling
    if (videoUrl && /\.(mp4|webm|ogg)$/i.test(videoUrl)) {
      modalVideo.style.display = "block";
      modalVideo.src = videoUrl;
      modalVideo.load();
      modalVideo.play();
    } else if (videoUrl) {
      modalVideo.style.display = "none";
      const img = document.createElement("img");
      img.id = "modalGif";
      img.src = videoUrl;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "0.75rem";
      modal.querySelector(".modal-content").insertBefore(img, modalText);
    } else {
      modalVideo.style.display = "none";
    }

    modalText.innerHTML = instructions.length
      ? `<h4>Instructions:</h4><ul>${instructions.map((i) => `<li>${i}</li>`).join("")}</ul>`
      : "<p>No instructions available.</p>";

    modal.classList.remove("hidden");
  });
});

// Close modal
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  modalVideo.pause();
  modalVideo.src = "";
  const gif = document.querySelector("#modalGif");
  if (gif) gif.remove();
});

// Form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const checked = document.querySelectorAll(
    'input[name="exerciseIds"]:checked',
  );

  if (checked.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    formMessage.style.color = "red";
    return;
  }

  const exerciseIds = Array.from(checked).map((input) => input.value);

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Workout plan created successfully!";
      formMessage.style.color = "green";
      setTimeout(() => (window.location.href = "/workoutPlan"), 600);
    } else {
      formMessage.textContent =
        data.message || "Failed to create workout plan.";
      formMessage.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Something went wrong. Please try again.";
    formMessage.style.color = "red";
  }
});
