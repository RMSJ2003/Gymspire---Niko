(async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const stateLoading = document.getElementById("stateLoading");
  const stateSuccess = document.getElementById("stateSuccess");
  const stateError = document.getElementById("stateError");
  const errorMsg = document.getElementById("errorMsg");

  function show(state) {
    [stateLoading, stateSuccess, stateError].forEach((el) =>
      el.classList.remove("active"),
    );
    state.classList.add("active");
  }

  if (!token) {
    errorMsg.textContent =
      "No verification token found. Please use the link sent to your email.";
    show(stateError);
    return;
  }

  try {
    const res = await fetch(`/api/v1/auth/verify-email/${token}`, {
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent =
        data.message || "Verification failed. Please request a new link.";
      show(stateError);
      return;
    }

    show(stateSuccess);
  } catch (err) {
    errorMsg.textContent =
      "Something went wrong. Please try again or request a new link.";
    show(stateError);
  }
})();
