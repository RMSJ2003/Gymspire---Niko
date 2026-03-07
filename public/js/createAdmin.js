document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#createAdminForm");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const passwordConfirmInput = document.querySelector("#passwordConfirm");
  const pfpInput = document.querySelector("#pfpInput");
  const avatarPreview = document.querySelector("#avatarPreview");
  const avatarImg = document.querySelector("#avatarImg");

  const emailError = document.querySelector("#emailError");
  const passwordError = document.querySelector("#passwordError");
  const passwordConfirmError = document.querySelector("#passwordConfirmError");
  const formMessage = document.querySelector("#formMessage");

  const submitBtn = document.querySelector("#submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");

  // ── Avatar upload preview ─────────────────────
  avatarPreview.addEventListener("click", () => pfpInput.click());

  pfpInput.addEventListener("change", () => {
    const file = pfpInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // ── Show / hide password ──────────────────────
  document.querySelectorAll(".toggle-pw").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(`#${btn.dataset.target}`);
      if (!target) return;
      target.type = target.type === "password" ? "text" : "password";
      btn.style.color = target.type === "text" ? "#d25353" : "";
    });
  });

  // ── Password match validation ─────────────────
  function validatePasswords() {
    if (passwordInput.value !== passwordConfirmInput.value) {
      passwordConfirmInput.setCustomValidity("Passwords do not match");
    } else {
      passwordConfirmInput.setCustomValidity("");
    }
  }

  passwordInput.addEventListener("input", validatePasswords);
  passwordConfirmInput.addEventListener("input", validatePasswords);

  // ── Submit ────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    validatePasswords();

    // Reset errors
    emailError.textContent = "";
    passwordError.textContent = "";
    passwordConfirmError.textContent = "";
    formMessage.textContent = "";
    formMessage.className = "form-message";

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

      if (pfpInput.files[0]) {
        formData.append("pfp", pfpInput.files[0]);
      }

      const res = await fetch("/api/v1/admin/createAdmin", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Create admin failed");

      success = true;
      formMessage.textContent = "✓ Admin created successfully! Redirecting...";
      formMessage.classList.add("success");

      setTimeout(() => {
        window.location.href = data.redirectTo || "/users";
      }, 900);
    } catch (err) {
      const message = err.message || "Create admin failed";

      if (message.toLowerCase().includes("email")) {
        emailError.textContent = message;
      } else if (message.toLowerCase().includes("confirm")) {
        passwordConfirmError.textContent = message;
      } else if (message.toLowerCase().includes("password")) {
        passwordError.textContent = message;
      } else {
        formMessage.textContent = message;
      }
    } finally {
      if (!success) {
        submitBtn.disabled = false;
        btnText.textContent = "Create Admin";
      }
    }
  });
});
