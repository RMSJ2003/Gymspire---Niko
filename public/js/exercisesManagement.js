// ─────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────
function showToast(message, type = "info") {
  const existing = document.getElementById("exMgmtToast");
  if (existing) existing.remove();
  const colors = {
    error: { bg: "#d25353", icon: "✕" },
    success: { bg: "#22c55e", icon: "✓" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    warning: { bg: "#f59e0b", icon: "⚠" },
  };
  const { bg, icon } = colors[type] || colors.info;
  const toast = document.createElement("div");
  toast.id = "exMgmtToast";
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;left:50%;
    transform:translateX(-50%) translateY(20px);
    background:${bg};color:white;
    padding:0.75rem 1.4rem;border-radius:10px;
    font-family:'DM Sans',Arial,sans-serif;font-size:0.88rem;font-weight:600;
    display:flex;align-items:center;gap:0.55rem;
    box-shadow:0 8px 28px rgba(0,0,0,0.22);z-index:9999;
    max-width:90vw;opacity:0;
    transition:opacity 0.25s ease,transform 0.25s ease;
    pointer-events:none;
  `;
  toast.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

function showConfirm(
  message,
  onConfirm,
  { danger = false, requireText = null } = {},
) {
  const existing = document.getElementById("exMgmtConfirmModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "exMgmtConfirmModal";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;
    z-index:9998;padding:1rem;
  `;

  const confirmBtnColor = danger
    ? "background:linear-gradient(135deg,#d25353,#b11226)"
    : "background:linear-gradient(135deg,#d25353,#b11226)";

  // If requireText is set, show a text input the user must match
  const inputHTML = requireText
    ? `<div style="margin-bottom:1rem;">
         <label style="font-size:0.8rem;color:#888;display:block;margin-bottom:4px;">
           Type <strong>${requireText}</strong> to confirm:
         </label>
         <input id="exMgmtConfirmInput" type="text" autocomplete="off"
           style="width:100%;padding:0.5rem 0.75rem;border:1.5px solid #ddd;
           border-radius:8px;font-size:0.88rem;font-family:'DM Sans',Arial,sans-serif;
           outline:none;box-sizing:border-box;"
           placeholder="${requireText}"/>
       </div>`
    : "";

  overlay.innerHTML = `
    <div style="
      background:white;border-radius:16px;padding:1.5rem;
      max-width:400px;width:100%;
      box-shadow:0 20px 60px rgba(0,0,0,0.3);
      font-family:'DM Sans',Arial,sans-serif;
    ">
      <p style="margin:0 0 1.2rem;font-size:0.92rem;color:#1a1a1a;line-height:1.5;">${message}</p>
      ${inputHTML}
      <p id="exMgmtConfirmError" style="color:#d25353;font-size:0.8rem;margin:0 0 0.75rem;display:none;"></p>
      <div style="display:flex;gap:0.6rem;justify-content:flex-end;">
        <button id="exMgmtCancel" style="
          padding:0.5rem 1.1rem;border-radius:8px;border:1.5px solid #ddd;
          background:white;color:#555;font-weight:700;font-size:0.85rem;cursor:pointer;
          font-family:'DM Sans',Arial,sans-serif;
        ">Cancel</button>
        <button id="exMgmtOk" style="
          padding:0.5rem 1.1rem;border-radius:8px;border:none;
          ${confirmBtnColor};color:white;
          font-weight:700;font-size:0.85rem;cursor:pointer;
          font-family:'DM Sans',Arial,sans-serif;
        ">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const errorEl = overlay.querySelector("#exMgmtConfirmError");

  overlay.querySelector("#exMgmtOk").addEventListener("click", () => {
    if (requireText) {
      const input = overlay.querySelector("#exMgmtConfirmInput");
      if (input.value !== requireText) {
        errorEl.textContent = `Text does not match. Type exactly: ${requireText}`;
        errorEl.style.display = "block";
        return;
      }
    }
    overlay.remove();
    onConfirm();
  });

  overlay
    .querySelector("#exMgmtCancel")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  // IMPORT EXERCISES
  // ==========================
  const importBtn = document.querySelector("#importExercisesBtn");
  const importMessage = document.querySelector("#importMessage");

  if (importBtn) {
    importBtn.addEventListener("click", () => {
      showConfirm(
        "This will call the ExerciseDB API.<br><br>" +
          "• Takes several minutes<br>" +
          "• Subject to rate limits<br><br>" +
          "Do you want to continue?",
        async () => {
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
              importMessage.style.color = "#d25353";
              importBtn.disabled = false;
              importBtn.textContent = "Import Exercises";
              return;
            }

            importMessage.textContent = `Import completed! Imported ${data.imported} exercises.`;
            importMessage.style.color = "#16a34a";
            showToast(`Imported ${data.imported} exercises.`, "success");
            setTimeout(() => window.location.reload(), 1200);
          } catch (err) {
            console.error(err);
            importMessage.textContent = "Network error during import.";
            importMessage.style.color = "#d25353";
            importBtn.disabled = false;
            importBtn.textContent = "Import Exercises";
          }
        },
      );
    });
  }

  // ==========================
  // DELETE ALL EXERCISES
  // ==========================
  const deleteBtn = document.querySelector("#deleteAllExercisesBtn");
  const deleteMessage = document.querySelector("#deleteMessage");

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      showConfirm(
        "⚠️ This will <strong>DELETE ALL exercises</strong>.<br>This cannot be undone.",
        async () => {
          try {
            const res = await fetch("/api/v1/exercises", {
              method: "DELETE",
              credentials: "include",
            });

            if (res.status === 204) {
              deleteMessage.textContent = "All exercises deleted successfully.";
              deleteMessage.style.color = "#16a34a";
              showToast("All exercises deleted.", "success");
              setTimeout(() => window.location.reload(), 800);
              return;
            }

            const data = await res.json();

            if (!res.ok) {
              deleteMessage.textContent =
                data.message || "Failed to delete exercises.";
              deleteMessage.style.color = "#d25353";
              return;
            }

            deleteMessage.textContent = "All exercises deleted successfully.";
            deleteMessage.style.color = "#16a34a";
            showToast("All exercises deleted.", "success");
            setTimeout(() => window.location.reload(), 800);
          } catch (err) {
            console.error(err);
            deleteMessage.textContent = "Network error.";
            deleteMessage.style.color = "#d25353";
          }
        },
        { danger: true, requireText: "DELETE ALL" },
      );
    });
  }
});
