// ===== DOM ELEMENTS =====
const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const formMessage = document.querySelector("#formMessage");
const loginBtn = document.querySelector("#loginBtn");
const btnText = loginBtn.querySelector(".btn-text");
const signupBtn = document.querySelector("#signupBtn");

// 🔹 Show Password checkbox
const showPasswordCheckbox = document.getElementById("showPassword");

// Toggle password visibility
showPasswordCheckbox.addEventListener("change", () => {
  passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
});

// ===============================
// Clear password on page load / back button
// ===============================
window.addEventListener("pageshow", (event) => {
  passwordInput.value = "";
  showPasswordCheckbox.checked = false;
  passwordInput.type = "password";
});

// ===============================
// Submit login form
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  formMessage.textContent = "";
  formMessage.classList.remove("error", "success");

  loginBtn.disabled = true;
  btnText.textContent = "Logging in...";

  try {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Invalid email or password");

    formMessage.textContent = "Login successful! Redirecting...";
    formMessage.classList.add("success");
    formMessage.classList.remove("error");

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    formMessage.textContent = err.message || "Login failed";
    formMessage.classList.add("error");
    formMessage.classList.remove("success");
  } finally {
    loginBtn.disabled = false;
    btnText.textContent = "Log In";
  }
});

// Redirect Sign Up button
signupBtn.addEventListener("click", () => {
  window.location.href = "/signup";
});
