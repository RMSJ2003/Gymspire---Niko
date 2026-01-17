"use strict";

var form = document.querySelector('#signupForm');
var emailInput = document.querySelector('#email');
var IACADEMY_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/;
form.addEventListener('submit', function (e) {
  var email = emailInput.value.trim();

  if (!IACADEMY_EMAIL_REGEX.test(email)) {
    e.preventDefault();
    alert('Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.');
    emailInput.focus();
  }
});