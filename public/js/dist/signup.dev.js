"use strict";

var form = document.querySelector('#signupForm');
var emailInput = document.querySelector('#email');
var passwordInput = document.querySelector('#password');
var passwordConfirmInput = document.querySelector('#passwordConfirm');
var IACADEMY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/; // ===============================
// Email validation (iACADEMY only)
// ===============================

function validateEmail() {
  var email = emailInput.value.trim();

  if (!IACADEMY_EMAIL_REGEX.test(email)) {
    emailInput.setCustomValidity('Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.');
  } else {
    emailInput.setCustomValidity('');
  }
} // ===============================
// Password match validation
// ===============================


function validatePasswords() {
  if (passwordInput.value !== passwordConfirmInput.value) {
    passwordConfirmInput.setCustomValidity('Passwords do not match');
  } else {
    passwordConfirmInput.setCustomValidity('');
  }
} // ===============================
// Live validation
// ===============================


emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePasswords);
passwordConfirmInput.addEventListener('input', validatePasswords); // ===============================
// Final submit guard
// ===============================

form.addEventListener('submit', function (e) {
  validateEmail();
  validatePasswords();

  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity(); // shows browser validation UI
  }
});