"use strict";

// JAVASCRIPT FOR CLIENT-SIDE VALIDATION
var form = document.querySelector("#loginForm");
var emailInput = document.querySelector("#email");
var passwordInput = document.querySelector("#password");
var emailError = document.querySelector("#emailError");
var passwordError = document.querySelector("#passwordError");
var formMessage = document.querySelector("#formMessage");
var loginBtn = document.querySelector("#loginBtn");
var btnText = loginBtn.querySelector(".btn-text");
form.addEventListener("submit", function _callee(e) {
  var res, data, message;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault(); // reset errors

          emailError.textContent = "";
          passwordError.textContent = "";
          formMessage.textContent = "";
          loginBtn.disabled = true;
          btnText.textContent = "Logging in...";
          _context.prev = 6;
          _context.next = 9;
          return regeneratorRuntime.awrap(fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: emailInput.value,
              password: passwordInput.value
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

          throw new Error(data.message || "Invalid email or password");

        case 15:
          // 🔥 SUCCESS (optional UI before redirect)
          formMessage.textContent = "Login successful! Redirecting...";
          setTimeout(function () {
            window.location.href = data.redirectTo || "/dashboard";
          }, 500);
          _context.next = 23;
          break;

        case 19:
          _context.prev = 19;
          _context.t0 = _context["catch"](6);
          message = _context.t0.message || "Login failed"; // 🔥 FIELD-SPECIFIC ERRORS

          if (message.toLowerCase().includes("email")) {
            emailError.textContent = message;
          } else if (message.toLowerCase().includes("password")) {
            passwordError.textContent = message;
          } else {
            // 🔥 GLOBAL FORM ERROR (no alert)
            formMessage.textContent = message;
          }

        case 23:
          _context.prev = 23;
          loginBtn.disabled = false;
          btnText.textContent = "Log In";
          return _context.finish(23);

        case 27:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[6, 19, 23, 27]]);
}); // JAVASCRIPT FOR DESIGN GOES HERE: