document.addEventListener("DOMContentLoaded", () => {
  // Back button
  const ReturnBtn = document.querySelector(".Back-btn");

  if (ReturnBtn) {
    ReturnBtn.addEventListener("click", () => {
      window.location.href = "../login-screen/login-screen.html";
    });
  }

  // Forgot password form
  const form = document.getElementById("forgotForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault(); // stop page reload
      showAlert(); // ✅ SHOW MODAL
    });
  }
});
