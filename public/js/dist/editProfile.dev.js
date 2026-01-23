"use strict";

var photoForm = document.getElementById("photoForm");

if (photoForm) {
  photoForm.addEventListener("submit", function _callee(e) {
    var fileInput, formData, res, data;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            e.preventDefault();
            fileInput = document.getElementById("pfp");

            if (!(!fileInput || !fileInput.files[0])) {
              _context.next = 5;
              break;
            }

            alert("Please select an image");
            return _context.abrupt("return");

          case 5:
            formData = new FormData();
            formData.append("pfp", fileInput.files[0]);
            _context.prev = 7;
            _context.next = 10;
            return regeneratorRuntime.awrap(fetch("/api/v1/users/updateMyPhoto", {
              method: "PATCH",
              body: formData,
              credentials: "include"
            }));

          case 10:
            res = _context.sent;
            _context.next = 13;
            return regeneratorRuntime.awrap(res.json());

          case 13:
            data = _context.sent;

            if (res.ok) {
              _context.next = 16;
              break;
            }

            throw new Error(data.message || "Upload failed");

          case 16:
            alert("Profile picture updated!");
            window.location.reload();
            _context.next = 24;
            break;

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](7);
            console.error(_context.t0);
            alert(_context.t0.message || "Something went wrong");

          case 24:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[7, 20]]);
  });
}