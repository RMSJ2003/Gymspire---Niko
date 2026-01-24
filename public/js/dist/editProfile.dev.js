"use strict";

var form = document.querySelector("#editProfileForm");
var formMessage = document.querySelector("#formMessage");
form.addEventListener("submit", function _callee(e) {
  var formData, username, file, res, data;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault(); // this already STOPS normal submit, no return needed

          formData = new FormData(form); // Check if user changed anything

          username = formData.get("username");
          file = formData.get("pfp");

          if (!(!username && (!file || file.size === 0))) {
            _context.next = 7;
            break;
          }

          formMessage.textContent = "Nothing to update";
          return _context.abrupt("return");

        case 7:
          _context.next = 9;
          return regeneratorRuntime.awrap(fetch("/api/v1/users/updateMe", {
            method: "PATCH",
            body: formData
          }));

        case 9:
          res = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(res.json());

        case 12:
          data = _context.sent;

          if (data.status === "success") {
            formMessage.textContent = "Profile updated successfully";
            setTimeout(function () {
              location.reload();
            }, 700);
          } else {
            formMessage.textContent = data.message || "Update failed";
          }

        case 14:
        case "end":
          return _context.stop();
      }
    }
  });
});