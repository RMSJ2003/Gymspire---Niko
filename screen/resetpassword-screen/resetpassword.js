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

// document.addEventListener("DOMContentLoaded", () => {
//   const showPasswordCheckbox = document.getElementById("CheckBox");
//   const newPassword = document.getElementById("NewPassword");
//   const confirmPassword = document.getElementById("ConfirmPassword");

//   showPasswordCheckbox.addEventListener("change", () => {
//     const type = showPasswordCheckbox.checked ? "text" : "password";
//     newPassword.type = type;
//     confirmPassword.type = type;
//   });
// });
