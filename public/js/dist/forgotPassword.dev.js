"use strict";

var form = document.querySelector("#forgotPasswordForm");
var emailInput = document.querySelector("#email");
var emailError = document.querySelector("#emailError");
var formMessage = document.querySelector("#formMessage") || {
  textContent: ""
};
var submitBtn = document.querySelector("#submitBtn");
var btnText = submitBtn.querySelector(".btn-text"); // ===============================
// Submit behavior
// ===============================

form.addEventListener("submit", function _callee(e) {
  var success, res, data, message;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault(); // reset errors

          emailError.textContent = "";
          formMessage.textContent = "";
          submitBtn.disabled = true;
          btnText.textContent = "Sending...";
          success = false; // 🔥 FLAG

          _context.prev = 6;
          _context.next = 9;
          return regeneratorRuntime.awrap(fetch("/api/v1/auth/forgotPassword", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: emailInput.value
            })
          }));

        case 9:
          res = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(res.json());

        case 12:
          data = _context.sent;

          if (res.ok) {
            _context.next = 15;
            break;
          }

          throw new Error(data.message || "Forgot Password failed");

        case 15:
          // 🔥 SUCCESS UI
          success = true;
          formMessage.textContent = "Reset password link sent to your email!";
          submitBtn.disabled = true;
          btnText.textContent = "Email Sent";
          _context.next = 25;
          break;

        case 21:
          _context.prev = 21;
          _context.t0 = _context["catch"](6);
          message = _context.t0.message || "Forgot Password failed"; // 🔥 FIELD ERROR FIRST

          if (message.toLowerCase().includes("email")) {
            emailError.textContent = message;
          } else {
            // 🔥 GLOBAL FORM ERROR
            formMessage.textContent = message;
          }

        case 25:
          _context.prev = 25;

          // 🔥 ONLY RESET IF FAILED
          if (!success) {
            submitBtn.disabled = false;
            btnText.textContent = "Send";
          }

          return _context.finish(25);

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 21, 25, 28]]);
});