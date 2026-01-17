const form = document.querySelector('#signupForm');
const emailInput = document.querySelector('#email');

const IACADEMY_EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@(iacademy\.ph|iacademy\.edu\.ph)$/;

form.addEventListener('submit', e => {
  const email = emailInput.value.trim();

  if (!IACADEMY_EMAIL_REGEX.test(email)) {
    e.preventDefault();
    alert(
      'Only iACADEMY emails (@iacademy.ph or @iacademy.edu.ph) are allowed.'
    );
    emailInput.focus();
  }
});
