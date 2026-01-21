"use strict";

var form = document.querySelector("#signupForm");
var emailInput = document.querySelector("#email");
var passwordInput = document.querySelector("#password");
var passwordConfirmInput = document.querySelector("#passwordConfirm");
var emailError = document.querySelector("#emailError");
var passwordError = document.querySelector("#passwordError");
var passwordConfirmError = document.querySelector("#passwordConfirmError");
var formMessage = document.querySelector("#formMessage") || {
  textContent: ""
};
var submitBtn = document.querySelector("#submitBtn");
var btnText = submitBtn.querySelector(".btn-text");
var IACADEMY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/; // ===============================
// Email validation (iACADEMY only)
// ===============================

function validateEmail() {
  var email = emailInput.value.trim().toLowerCase();

  if (!IACADEMY_EMAIL_REGEX.test(email)) {
    emailInput.setCustomValidity("Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.");
  } else {
    emailInput.setCustomValidity("");
  }
} // ===============================
// Password match validation
// ===============================


function validatePasswords() {
  if (passwordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity("Passwords do not match");
  } else {
    passwordConfirmInput.setCustomValidity("");
  }
} // ===============================
// Live validation
// ===============================


emailInput.addEventListener("input", validateEmail);
passwordInput.addEventListener("input", validatePasswords);
passwordConfirmInput.addEventListener("input", validatePasswords); // ===============================
// Submit behavior
// ===============================

form.addEventListener("submit", function _callee(e) {
  var success, res, data, message;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          validateEmail();
          validatePasswords(); // reset errors

          emailError.textContent = "";
          passwordError.textContent = "";
          passwordConfirmError.textContent = "";
          formMessage.textContent = "";

          if (form.checkValidity()) {
            _context.next = 10;
            break;
          }

          form.reportValidity();
          return _context.abrupt("return");

        case 10:
          submitBtn.disabled = true;
          btnText.textContent = "Creating account...";
          success = false; // 🔥 FLAG

          _context.prev = 13;
          _context.next = 16;
          return regeneratorRuntime.awrap(fetch("/api/v1/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: emailInput.value,
              username: document.querySelector("#username").value,
              password: passwordInput.value,
              passwordConfirm: passwordConfirmInput.value,
              pfpUrl: document.querySelector("#pfpUrl").value
            })
          }));

        case 16:
          res = _context.sent;
          _context.next = 19;
          return regeneratorRuntime.awrap(res.json());

        case 19:
          data = _context.sent;

          if (res.ok) {
            _context.next = 22;
            break;
          }

          throw new Error(data.message || "Signup failed");

        case 22:
          // 🔥 SUCCESS UI
          success = true;
          formMessage.textContent = "Account created successfully! Redirecting...";
          submitBtn.disabled = true; // 🔥 SHORT DELAY THEN REDIRECT

          setTimeout(function () {
            window.location.href = data.redirectTo || "/dashboard";
          }, 800);
          _context.next = 32;
          break;

        case 28:
          _context.prev = 28;
          _context.t0 = _context["catch"](13);
          message = _context.t0.message || "Signup failed"; // 🔥 FIELD ERRORS FIRST

          if (message.toLowerCase().includes("email")) {
            emailError.textContent = message;
          } else if (message.toLowerCase().includes("confirm")) {
            passwordConfirmError.textContent = message;
          } else if (message.toLowerCase().includes("password")) {
            passwordError.textContent = message;
          } else {
            // 🔥 GLOBAL FORM ERROR
            formMessage.textContent = message;
          }

        case 32:
          _context.prev = 32;

          // 🔥 ONLY RESET IF FAILED
          if (!success) {
            submitBtn.disabled = false;
            btnText.textContent = "Create Account";
          }

          return _context.finish(32);

        case 35:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[13, 28, 32, 35]]);
});