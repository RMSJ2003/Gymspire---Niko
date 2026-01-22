//wait for HTML to get loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select the Login button inside the DOMContentLoaded
  const signupButton = document.querySelector(".SignUp-btn");

  // Add click event inside the same block
  if (signupButton) {
    signupButton.addEventListener("click", () => {
      window.location.href = "../signup-screen/signup-screen.html";
    });
  }
});
