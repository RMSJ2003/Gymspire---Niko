const deleteForm = document.getElementById("deleteForm");
const formMessage = document.querySelector("#formMessage");

const deleteBtn = document.getElementById("deleteBtn");
const permanentDeleteBtn = document.getElementById("permanentDeleteBtn");

/* ===============================
   🔹 SOFT DELETE
================================ */
deleteForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  deleteBtn.textContent = "Deactivating...";
  deleteBtn.disabled = true;
  formMessage.textContent = "";

  try {
    const res = await fetch("/api/v1/users/deleteMe", {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 204) {
      formMessage.textContent =
        "Account deactivated successfully. Redirecting...";

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent =
        "Account deactivated successfully. Redirecting...";

      setTimeout(() => {
        window.location.href = data.redirectTo || "/login";
      }, 800);
    } else {
      formMessage.textContent =
        data.message || "Account deactivation failed. Try again.";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Network error. Please try again.";
  } finally {
    deleteBtn.textContent = "Deactivate Account";
    deleteBtn.disabled = false;
  }
});

/* ===============================
   🔹 PERMANENT DELETE
================================ */
permanentDeleteBtn.addEventListener("click", async () => {
  if (!confirm("This action cannot be undone. Delete permanently?")) return;

  permanentDeleteBtn.textContent = "Deleting...";
  permanentDeleteBtn.disabled = true;
  formMessage.textContent = "";

  try {
    const res = await fetch("/api/v1/users/permanentDeleteMe", {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 204) {
      formMessage.textContent = "Account permanently deleted. Redirecting...";

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
      return;
    }

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Account permanently deleted. Redirecting...";

      setTimeout(() => {
        window.location.href = data.redirectTo || "/login";
      }, 800);
    } else {
      formMessage.textContent =
        data.message || "Permanent deletion failed. Try again.";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Network error. Please try again.";
  } finally {
    permanentDeleteBtn.textContent = "Delete Permanently";
    permanentDeleteBtn.disabled = false;
  }
});
