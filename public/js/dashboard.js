// Grab all buttons and clip overlays
const clipButtons = document.querySelectorAll(".feature-btn-clip");
const clipOverlays = document.querySelectorAll(".clip-overlay");

clipButtons.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    // Slide the video overlay
    clipOverlays[idx].style.transform = "translateX(0)";

    // Play the video
    const video = clipOverlays[idx].querySelector("video");
    if (video) {
      video.play();
    }
  });
});
