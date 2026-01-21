const form = document.querySelector("#signupForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");

const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");
const passwordConfirmError = document.querySelector("#passwordConfirmError");
const formMessage = document.querySelector("#formMessage") || {
  textContent: "",
};

const submitBtn = document.querySelector("#submitBtn");
const btnText = submitBtn.querySelector(".btn-text");

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
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  validateEmail();
  validatePasswords();

  // reset errors
  emailError.textContent = "";
  passwordError.textContent = "";
  passwordConfirmError.textContent = "";
  formMessage.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  btnText.textContent = "Creating account...";

  let success = false; // 🔥 FLAG

  try {
    const res = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
        username: document.querySelector("#username").value,
        password: passwordInput.value,
        passwordConfirm: passwordConfirmInput.value,
        pfpUrl: document.querySelector("#pfpUrl").value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    // 🔥 SUCCESS UI
    success = true;
    formMessage.textContent = "Account created successfully! Redirecting...";
    submitBtn.disabled = true;

    // 🔥 SHORT DELAY THEN REDIRECT
    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 800);
  } catch (err) {
    const message = err.message || "Signup failed";

    // 🔥 FIELD ERRORS FIRST
    if (message.toLowerCase().includes("email")) {
      emailError.textContent = message;
    } else if (message.toLowerCase().includes("confirm")) {
      passwordConfirmError.textContent = message;
    } else if (message.toLowerCase().includes("password")) {
      passwordError.textContent = message;
    } else {
      // 🔥 GLOBAL FORM ERROR
      formMessage.textContent = message;
    }
  } finally {
    // 🔥 ONLY RESET IF FAILED
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Create Account";
    }
  }
});
