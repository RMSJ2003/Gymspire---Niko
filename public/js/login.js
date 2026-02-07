// JAVASCRIPT FOR CLIENT-SIDE VALIDATION
const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const formMessage = document.querySelector("#formMessage");

const loginBtn = document.querySelector("#loginBtn");
const btnText = loginBtn.querySelector(".btn-text");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset errors
  formMessage.textContent = "";
  formMessage.classList.remove("login__message--active");

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

    // 🚨 ACCOUNT DEACTIVATED → SHOW REACTIVATION PROMPT
    if (data.status === "deactivated") {
      loginBtn.disabled = false;
      btnText.textContent = "Log In";

      const confirmReactivate = confirm(
        "Your account is deactivated. Do you want to reactivate it?",
      );

      if (!confirmReactivate) return;

      await reactivateAccount(data.email);
      return;
    }

    // ❌ Other errors
    if (!res.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    // ✅ SUCCESS
    formMessage.classList.add("login__message--active");
    formMessage.textContent = "Login successful! Redirecting...";

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    formMessage.classList.add("login__message--active");
    formMessage.textContent = err.message || "Login failed";
  } finally {
    loginBtn.disabled = false;
    btnText.textContent = "Log In";
  }
});

// 🔥 Reactivate Account Function
async function reactivateAccount(email) {
  try {
    const res = await fetch("/api/v1/auth/reactivateAccount", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Reactivation failed");

    formMessage.classList.add("login__message--active");
    formMessage.textContent = "Account reactivated! Redirecting...";

    setTimeout(() => {
      window.location.href = data.redirectTo || "/dashboard";
    }, 500);
  } catch (err) {
    formMessage.classList.add("login__message--active");
    formMessage.textContent = err.message || "Reactivation failed";
  }
}
