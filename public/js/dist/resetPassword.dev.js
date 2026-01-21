"use strict";

var form = document.querySelector("#resetPasswordForm");
var newPasswordInput = document.querySelector("#newPassword");
var passwordConfirmInput = document.querySelector("#passwordConfirm");
var newPasswordError = document.querySelector("#newPasswordError");
var passwordConfirmError = document.querySelector("#passwordConfirmError");
var formMessage = document.querySelector("#formMessage");
var submitBtn = document.querySelector("#submitBtn");
var btnText = submitBtn.querySelector(".btn-text"); // ===============================
// Password match validation
// ===============================

function validatePasswords() {
  if (newPasswordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity("Passwords do not match");
  } else {
    passwordConfirmInput.setCustomValidity("");
  }
} // ===============================
// Submit behavior
// ===============================


form.addEventListener("submit", function _callee(e) {
  var token, success, res, data, message;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          validatePasswords();

          if (form.checkValidity()) {
            _context.next = 5;
            break;
          }

          form.reportValidity();
          return _context.abrupt("return");

        case 5:
          token = window.location.pathname.split("/").pop(); // reset errors

          newPasswordError.textContent = "";
          passwordConfirmError.textContent = "";
          formMessage.textContent = "";
          submitBtn.disabled = true;
          btnText.textContent = "Resetting password. Redirecting to Dashboard";
          success = false; // 🔥 FLAG

          _context.prev = 12;
          _context.next = 15;
          return regeneratorRuntime.awrap(fetch("/api/v1/auth/resetPassword/".concat(token), {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              password: newPasswordInput.value,
              passwordConfirm: passwordConfirmInput.value
            })
          }));

        case 15:
          res = _context.sent;
          _context.next = 18;
          return regeneratorRuntime.awrap(res.json());

        case 18:
          data = _context.sent;

          if (res.ok) {
            _context.next = 21;
            break;
          }

          throw new Error(data.message || "Reset Password failed");

        case 21:
          // 🔥 SUCCESS UI
          success = true; // mark success
          // 🔥 SUCCESS (optional UI before redirect)

          formMessage.textContent = "Reset password successful! Redirecting...";
          submitBtn.disabled = true; // 🔥 WAIT 3 SECONDS THEN REDIRECT

          setTimeout(function () {
            window.location.href = "/login";
          }, 3000);
          _context.next = 31;
          break;

        case 27:
          _context.prev = 27;
          _context.t0 = _context["catch"](12);
          message = _context.t0.message || "Reset Password failed";

          if (message.toLowerCase().includes("confirm")) {
            passwordConfirmError.textContent = message;
          } else if (message.toLowerCase().includes("password")) {
            newPasswordError.textContent = message;
          } else {
            // 🔥 GLOBAL FORM ERROR (no alert)
            formMessage.textContent = message;
          }

        case 31:
          _context.prev = 31;

          // 🔥 ONLY RESET UI IF FAILED
          if (!success) {
            submitBtn.disabled = false;
            btnText.textContent = "Reset Password";
          }

          return _context.finish(31);

        case 34:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[12, 27, 31, 34]]);
});