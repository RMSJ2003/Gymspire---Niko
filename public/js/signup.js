const form = document.querySelector("#signupForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");
const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");
const passwordConfirmError = document.querySelector("#passwordConfirmError");

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
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  validateEmail();
  validatePasswords();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  btnText.textContent = "Creating...";
  spinner.classList.remove("hidden");

  const formData = {
    email: emailInput.value,
    username: document.querySelector("#username").value,
    password: passwordInput.value,
    passwordConfirm: passwordConfirmInput.value,
    pfpUrl: document.querySelector("#pfpUrl").value,
  };

  try {
    const res = await fetch("/api/v1/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    // ✅ OPTIONAL: save token (only if not using cookies)
    localStorage.setItem("jwt", data.token);

    // ✅ REDIRECT
    window.location.href = data.redirectTo || "/dashboard"; // This is GET
  } catch (err) {
    const message = err.message || "Signup failed";

    if (message.toLowerCase().includes("email")) {
      emailError.textContent = message;
    } else if (message.toLowerCase().includes("password")) {
      passwordError.textContent = message;
    } else {
      alert(message); // fallback for unexpected errors
    }
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = "Create Account";
    spinner.classList.add("hidden");
  }
});

function clearErrors() {
  emailError.textContent = "";
  passwordError.textContent = "";
  passwordConfirmError.textContent = "";
}
