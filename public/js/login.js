const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const formMessage = document.querySelector("#formMessage");

const loginBtn = document.querySelector("#loginBtn");
const btnText = loginBtn.querySelector(".btn-text");

// Submit login form
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset messages
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

    // Account deactivated
    if (data.status === "deactivated") {
      loginBtn.disabled = false;
      btnText.textContent = "Log In";

      const confirmReactivate = confirm(
        "Your account is deactivated. Do you want to reactivate it?",
      );

      if (!confirmReactivate) return;

      await requestReactivation(data.email);
      return;
    }

    // Other errors
    if (!res.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    // SUCCESS
    formMessage.textContent = "Login successful! Redirecting...";
    formMessage.classList.add("success"); // ✅ add success class
    formMessage.classList.remove("error");

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    formMessage.textContent = err.message || "Login failed";
    formMessage.classList.add("error"); // ✅ add error class
    formMessage.classList.remove("success");
  } finally {
    loginBtn.disabled = false;
    btnText.textContent = "Log In";
  }
});

// Reactivate account
async function requestReactivation(email) {
  try {
    const res = await fetch("/api/v1/auth/requestEmailVerification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Reactivation failed");
    }

    // 🔥 SHOW VERIFICATION MESSAGE
    formMessage.classList.add("login__message--active");
    formMessage.textContent =
      "A verification email has been sent to your iACADEMY email. Please verify before logging in.";
    submitBtn.textContent = "Verification sent";
    submitBtn.disabled = true;
  } catch (err) {
    formMessage.classList.add("login__message--active");
    const message = err.message || "Login failed";

    // 🔥 FIELD ERRORS FIRST

    // 🔥 GLOBAL FORM ERROR
    formMessage.textContent = message;
  } finally {
    // 🔥 ONLY RESET IF FAILED
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Login";
    }
  }
}
/*

async function reactivateAccount(email) {
  try {
    const res = await fetch("/api/v1/auth/reactivateAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Reactivation failed");

    formMessage.textContent = "Account reactivated! Redirecting...";
    formMessage.classList.add("success");
    formMessage.classList.remove("error");

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    formMessage.textContent = err.message || "Reactivation failed";
    formMessage.classList.add("error");
    formMessage.classList.remove("success");
  }
}
*/
// Redirect Sign Up button
const signupBtn = document.querySelector("#signupBtn");
signupBtn.addEventListener("click", () => {
  window.location.href = "/signup";
});
