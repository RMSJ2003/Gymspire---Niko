document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // IMPORT EXERCISES
  // ==========================
  const importBtn = document.querySelector("#importExercisesBtn");
  const importMessage = document.querySelector("#importMessage");

  if (importBtn) {
    importBtn.addEventListener("click", async () => {
      const confirmImport = confirm(
        "This will call the ExerciseDB API.\n\n" +
          "• Takes several minutes\n" +
          "• Subject to rate limits\n\n" +
          "Do you want to continue?",
      );

      if (!confirmImport) return;

      importBtn.disabled = true;
      importBtn.textContent = "Importing...";
      importMessage.textContent = "Import started. Please wait...";
      importMessage.style.color = "#333";

      try {
        const res = await fetch("/api/v1/exercise-db-api", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          importMessage.textContent =
            data.message || "Failed to import exercises.";
          importMessage.style.color = "red";
          importBtn.disabled = false;
          importBtn.textContent = "Import Exercises";
          return;
        }

        importMessage.textContent = `Import completed! Imported ${data.imported} exercises.`;
        importMessage.style.color = "green";

        // reload after short delay
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error(err);
        importMessage.textContent = "Network error during import.";
        importMessage.style.color = "red";
        importBtn.disabled = false;
        importBtn.textContent = "Import Exercises";
      }
    });
  }

  // ==========================
  // DELETE ALL (already exists)
  // ==========================
  const deleteBtn = document.querySelector("#deleteAllExercisesBtn");
  const deleteMessage = document.querySelector("#deleteMessage");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const firstConfirm = confirm(
        "⚠️ This will DELETE ALL exercises.\n\nAre you absolutely sure?",
      );

      if (!firstConfirm) return;

      const secondConfirm = prompt('Type "DELETE ALL" to confirm:');

      if (secondConfirm !== "DELETE ALL") {
        alert("Confirmation text did not match.");
        return;
      }

      try {
        const res = await fetch("/api/v1/exercises", {
          method: "DELETE",
          credentials: "include",
        });

        // ✅ 204 = success but no body
        if (res.status === 204) {
          deleteMessage.textContent = "All exercises deleted successfully.";
          deleteMessage.style.color = "green";

          setTimeout(() => window.location.reload(), 800);
          return;
        }

        // For non-204 responses, safely parse JSON
        const data = await res.json();

        if (!res.ok) {
          deleteMessage.textContent =
            data.message || "Failed to delete exercises.";
          deleteMessage.style.color = "red";
          return;
        }

        deleteMessage.textContent = "All exercises deleted successfully.";
        deleteMessage.style.color = "green";

        setTimeout(() => window.location.reload(), 800);
      } catch (err) {
        console.error(err);
        deleteMessage.textContent = "Network error.";
        deleteMessage.style.color = "red";
      }
    });
  }
});
