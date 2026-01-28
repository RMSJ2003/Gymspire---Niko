const deleteForm = document.getElementById("deleteForm");
const formMessage = document.querySelector("#formMessage");
const deleteBtn = document.getElementById("deleteBtn");

deleteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  deleteBtn.textContent = "Deleting...";
  deleteBtn.disabled = true;
  formMessage.textContent = "";

  try {
    const res = await fetch("/api/v1/users/deleteMe", {
      method: "DELETE",
      credentials: "include",
    });

    // 🔥 IMPORTANT PART — 204 HAS NO BODY
    if (res.status === 204) {
      formMessage.textContent = "Account deleted successfully. Redirecting...";

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    // For safety if backend changes later
    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Account deleted successfully. Redirecting...";

      setTimeout(() => {
        window.location.href = data.redirectTo || "/login";
      }, 800);
    } else {
      formMessage.textContent =
        data.message || "Delete account failed. Try again.";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Network error. Please try again.";
  } finally {
    deleteBtn.textContent = "Delete Account";
    deleteBtn.disabled = false;
  }
});
