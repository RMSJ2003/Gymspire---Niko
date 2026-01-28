document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".verify-form");

  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const actionUrl = form.action;
      const decision = e.submitter.value;

      const formData = new URLSearchParams(new FormData(form));
      formData.append("decision", decision);

      const card = form.closest(".submission-card");
      const errorEl = card.querySelector(".error-message");

      // reset error UI
      errorEl.style.display = "none";
      errorEl.textContent = "";

      try {
        const res = await fetch(actionUrl, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          // 🔥 SHOW BACKEND ERROR MESSAGE
          errorEl.textContent = data.message || "Verification failed.";
          errorEl.style.display = "block";
          return;
        }

        // success
        window.location.reload();
      } catch (err) {
        console.error(err);
        errorEl.textContent = "Network error. Please try again.";
        errorEl.style.display = "block";
      }
    });
  });
});
