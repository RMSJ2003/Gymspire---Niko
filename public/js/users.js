document.addEventListener("DOMContentLoaded", () => {
  // for admin
  const buttons = document.querySelectorAll(".delete-user-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.userId;

      const confirmDelete = confirm(
        "Are you sure you want to deactivate this user?",
      );

      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/v1/users/${userId}`, {
          method: "DELETE",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to delete user.");
          return;
        }

        // reload page to reflect changes
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Network error.");
      }
    });
  });

  // for clinic:
  document.addEventListener("click", async (e) => {
    const approveBtn = e.target.closest(".approve-user-btn");
    const declineBtn = e.target.closest(".decline-user-btn");

    if (approveBtn) {
      const id = approveBtn.dataset.userId;

      await fetch(`/api/v1/clinic/approve/${id}`, {
        method: "PATCH",
      });

      location.reload();
    }

    if (declineBtn) {
      const id = declineBtn.dataset.userId;

      await fetch(`/api/v1/clinic/decline/${id}`, {
        method: "PATCH",
      });

      location.reload();
    }
  });
});
