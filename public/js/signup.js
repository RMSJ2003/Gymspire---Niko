const form = document.querySelector("#signupForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");

const submitBtn = document.querySelector("#submitBtn");
const spinner = submitBtn?.querySelector(".spinner");
const btnText = submitBtn?.querySelector(".btn-text");

const IACADEMY_EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/;

// ===============================
// Email validation (iACADEMY only)
// ===============================
function validateEmail() {
  const email = emailInput.value.trim().toLowerCase();

  if (!IACADEMY_EMAIL_REGEX.test(email)) {
    emailInput.setCustomValidity(
      "Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed."
    );
  } else {
    emailInput.setCustomValidity("");
  }
}

// ===============================
// Password match validation
// ===============================
function validatePasswords() {
  if (passwordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity("Passwords do not match");
  } else {
    passwordConfirmInput.setCustomValidity("");
  }
}

// ===============================
// Live validation
// ===============================
emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePasswords);
passwordConfirmInput.addEventListener("input", validatePasswords);

// ===============================
// Submit behavior
// ===============================
form.addEventListener("submit", (e) => {
  validateEmail();
  validatePasswords();

  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();

    if (submitBtn) {
      submitBtn.disabled = false;
      spinner?.classList.add("hidden");
      btnText.textContent = "Create Account";
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    btnText.textContent = "Creating...";
    spinner?.classList.remove("hidden");
  }
});
