document.addEventListener("DOMContentLoaded", () => {
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
});
