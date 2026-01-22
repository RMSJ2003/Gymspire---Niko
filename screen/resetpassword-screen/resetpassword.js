//wait for HTML to get loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select the Back button inside the DOMContentLoaded
  const BackButton = document.querySelector(".Back-btn");

  // Add click event inside the same block
  if (BackButton) {
    BackButton.addEventListener("click", () => {
      window.location.href = "../login-screen/login-screen.html";
    });
  }
});
