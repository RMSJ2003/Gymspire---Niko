// JAVASCRIPT FOR CLIENT-SIDE VALIDATION
const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");
const formMessage = document.querySelector("#formMessage");

const loginBtn = document.querySelector("#loginBtn");
const btnText = loginBtn.querySelector(".btn-text");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset errors
  emailError.textContent = "";
  passwordError.textContent = "";
  formMessage.textContent = "";

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

    if (!res.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    // 🔥 SUCCESS (optional UI before redirect)
    formMessage.textContent = "Login successful! Redirecting...";

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    const message = err.message || "Login failed";

    // 🔥 FIELD-SPECIFIC ERRORS
    if (message.toLowerCase().includes("email")) {
      emailError.textContent = message;
    } else if (message.toLowerCase().includes("password")) {
      passwordError.textContent = message;
    } else {
      // 🔥 GLOBAL FORM ERROR (no alert)
      formMessage.textContent = message;
    }
  } finally {
    loginBtn.disabled = false;
    btnText.textContent = "Log In";
  }
});

// JAVASCRIPT FOR DESIGN GOES HERE:

