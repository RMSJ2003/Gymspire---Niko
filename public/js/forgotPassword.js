const form = document.querySelector("#forgotPasswordForm");
const emailInput = document.querySelector("#email");
const emailError = document.querySelector("#emailError");
const formMessage = document.querySelector("#formMessage") || {
  textContent: "",
};

const submitBtn = document.querySelector("#submitBtn");
const btnText = submitBtn.querySelector(".btn-text");

// ===============================
// Submit behavior
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // reset errors
  emailError.textContent = "";
  formMessage.textContent = "";

  submitBtn.disabled = true;
  btnText.textContent = "Sending...";

  let success = false; // 🔥 FLAG

  try {
    const res = await fetch("/api/v1/auth/forgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Forgot Password failed");
    }

    // 🔥 SUCCESS UI
    success = true;
    formMessage.textContent = "Reset password link sent to your email!";
    submitBtn.disabled = true;
    btnText.textContent = "Email Sent";
  } catch (err) {
    const message = err.message || "Forgot Password failed";

    // 🔥 FIELD ERROR FIRST
    if (message.toLowerCase().includes("email")) {
      emailError.textContent = message;
    } else {
      // 🔥 GLOBAL FORM ERROR
      formMessage.textContent = message;
    }
  } finally {
    // 🔥 ONLY RESET IF FAILED
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Send";
    }
  }
});
