const form = document.querySelector("#emailVerificationForm");
const emailInput = document.querySelector("#email");
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
  formMessage.textContent = "";

  submitBtn.disabled = true;
  btnText.textContent = "Sending...";

  let success = false; // 🔥 FLAG

  try {
    const res = await fetch("/api/v1/auth/requestEmailVerification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request email verification failed");
    }

    // 🔥 SUCCESS UI
    success = true;
    formMessage.classList.add("email-verification__message--active");
    btnText.textContent = "Email sent";
    formMessage.textContent =
      "Email verification link has been sent to your email";
    submitBtn.disabled = true;
  } catch (err) {
    formMessage.classList.add("email-verification__message--active");
    const message = err.message || "Request email verification failed";

    formMessage.textContent = message;
  } finally {
    // 🔥 ONLY RESET IF FAILED
    if (!success) {
      submitBtn.disabled = false;
      btnText.textContent = "Send";
    }
  }
});
