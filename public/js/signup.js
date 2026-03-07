// Avatar preview
document.getElementById("pfp").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById("avatarImg");
    img.src = e.target.result;
    img.classList.add("visible"); // ✅ CSS class, not inline style
    document.getElementById("avatarPlaceholder").style.display = "none";
    document.getElementById("avatarPreview").style.border =
      "2.5px solid #d25353";
  };
  reader.readAsDataURL(file);
});

// ===== DOM =====
const form = document.querySelector("#signupForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const passwordConfirmInput = document.querySelector("#passwordConfirm");
const pfpInput = document.querySelector("#pfp");
const agreeWaiverInput = document.querySelector("#agreeWaiver");
const formMessage = document.querySelector("#formMessage");
const submitBtn = document.querySelector("#submitBtn");
const btnText = submitBtn.querySelector(".btn-text");

const IACADEMY_EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/;

// ===== Validation =====
function validateEmail() {
  const email = emailInput.value.trim().toLowerCase();
  emailInput.setCustomValidity(
    IACADEMY_EMAIL_REGEX.test(email)
      ? ""
      : "Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.",
  );
}

function validatePasswords() {
  passwordConfirmInput.setCustomValidity(
    passwordInput.value !== passwordConfirmInput.value
      ? "Passwords do not match"
      : "",
  );
}

function validateWaiver() {
  agreeWaiverInput.setCustomValidity(
    agreeWaiverInput.checked ? "" : "You must agree to the waiver.",
  );
}

emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePasswords);
passwordConfirmInput.addEventListener("input", validatePasswords);
agreeWaiverInput.addEventListener("change", validateWaiver);

// ===== Submit =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  validateEmail();
  validatePasswords();
  validateWaiver();
  formMessage.textContent = "";
  formMessage.classList.remove("signup__message--active", "success");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled = true;
  btnText.textContent = "Creating account...";
  let success = false;

  try {
    const formData = new FormData();
    formData.append("email", emailInput.value);
    formData.append("username", document.querySelector("#username").value);
    formData.append("password", passwordInput.value);
    formData.append("passwordConfirm", passwordConfirmInput.value);
    formData.append("agreeWaiver", agreeWaiverInput.checked);
    if (pfpInput.files[0]) formData.append("pfp", pfpInput.files[0]);

    const res = await fetch("/api/v1/auth/signup", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");

    success = true;
    formMessage.classList.add("signup__message--active", "success");
    formMessage.textContent =
      "Account created! A verification email has been sent to your iACADEMY email. Please verify before logging in.";
    submitBtn.textContent = "Verification sent ✓";
    submitBtn.disabled = true;
  } catch (err) {
    formMessage.classList.add("signup__message--active");
    formMessage.textContent = err.message || "Signup failed";
  } finally {
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Create Account";
    }
  }
});
