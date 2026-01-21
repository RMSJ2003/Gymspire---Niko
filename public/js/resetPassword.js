const form = document.querySelector("#resetPasswordForm");
const newPasswordInput = document.querySelector("#newPassword");
const passwordConfirmInput = document.querySelector("#passwordConfirm");

const newPasswordError = document.querySelector("#newPasswordError");
const passwordConfirmError = document.querySelector("#passwordConfirmError");

const formMessage = document.querySelector("#formMessage");

const submitBtn = document.querySelector("#submitBtn");
const btnText = submitBtn.querySelector(".btn-text");

// ===============================
// Password match validation
// ===============================
function validatePasswords() {
  if (newPasswordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity("Passwords do not match");
  } else {
    passwordConfirmInput.setCustomValidity("");
  }
}

// ===============================
// Submit behavior
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  validatePasswords();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const token = window.location.pathname.split("/").pop();

  // reset errors
  newPasswordError.textContent = "";
  passwordConfirmError.textContent = "";
  formMessage.textContent = "";

  submitBtn.disabled = true;
  btnText.textContent = "Resetting password. Redirecting to Dashboard";

  let success = false; // 🔥 FLAG

  try {
    const res = await fetch(`/api/v1/auth/resetPassword/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: newPasswordInput.value,
        passwordConfirm: passwordConfirmInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Reset Password failed");
    }

    // 🔥 SUCCESS UI
    success = true; // mark success
    // 🔥 SUCCESS (optional UI before redirect)
    formMessage.textContent = "Reset password successful! Redirecting...";
    submitBtn.disabled = true;

    // 🔥 WAIT 3 SECONDS THEN REDIRECT
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  } catch (err) {
    const message = err.message || "Reset Password failed";

    if (message.toLowerCase().includes("confirm")) {
      passwordConfirmError.textContent = message;
    } else if (message.toLowerCase().includes("password")) {
      newPasswordError.textContent = message;
    } else {
      // 🔥 GLOBAL FORM ERROR (no alert)
      formMessage.textContent = message;
    }
  } finally {
    // 🔥 ONLY RESET UI IF FAILED
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Reset Password";
    }
  }
});
