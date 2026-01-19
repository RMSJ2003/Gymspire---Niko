//wait for HTML to get loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select the Sign Up button inside the DOMContentLoaded
  const ReturnBtn = document.querySelector(".Back-btn");

  // Add click event inside the same block
  if (ReturnBtn) {
    ReturnBtn.addEventListener("click", () => {
      window.location.href = "../login-screen/login-screen.html";
    });
  }
});
