// ─────────────────────────────────────────────
// CONFIRM MODAL (replaces confirm())
// ─────────────────────────────────────────────
function showConfirm(message, onConfirm) {
  const existing = document.getElementById("profileConfirmModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "profileConfirmModal";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.5);
    display:flex;align-items:center;justify-content:center;
    z-index:9998;padding:1rem;
  `;
  overlay.innerHTML = `
    <div style="
      background:white;border-radius:16px;padding:1.5rem;
      max-width:380px;width:100%;
      box-shadow:0 20px 60px rgba(0,0,0,0.3);
      font-family:'DM Sans',Arial,sans-serif;
    ">
      <p style="margin:0 0 1.2rem;font-size:0.95rem;color:#1a1a1a;line-height:1.5;">${message}</p>
      <div style="display:flex;gap:0.6rem;justify-content:flex-end;">
        <button id="profileConfirmCancel" style="
          padding:0.5rem 1.1rem;border-radius:8px;border:1.5px solid #ddd;
          background:white;color:#555;font-weight:700;font-size:0.85rem;cursor:pointer;
          font-family:'DM Sans',Arial,sans-serif;
        ">Cancel</button>
        <button id="profileConfirmOk" style="
          padding:0.5rem 1.1rem;border-radius:8px;border:none;
          background:linear-gradient(135deg,#d25353,#b11226);color:white;
          font-weight:700;font-size:0.85rem;cursor:pointer;
          font-family:'DM Sans',Arial,sans-serif;
        ">Confirm</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector("#profileConfirmOk").addEventListener("click", () => {
    overlay.remove();
    onConfirm();
  });
  overlay
    .querySelector("#profileConfirmCancel")
    .addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

const deleteForm = document.getElementById("deleteForm");
const formMessage = document.querySelector("#formMessage");
const deleteBtn = document.getElementById("deleteBtn");
const permanentDeleteBtn = document.getElementById("permanentDeleteBtn");

/* ===============================
   SOFT DELETE
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
   PERMANENT DELETE
================================ */
permanentDeleteBtn.addEventListener("click", () => {
  showConfirm(
    "This action cannot be undone. Delete your account permanently?",
    async () => {
      permanentDeleteBtn.textContent = "Deleting...";
      permanentDeleteBtn.disabled = true;
      formMessage.textContent = "";

      try {
        const res = await fetch("/api/v1/users/permanentDeleteMe", {
          method: "DELETE",
          credentials: "include",
        });

        if (res.status === 204) {
          formMessage.textContent =
            "Account permanently deleted. Redirecting...";
          setTimeout(() => {
            window.location.href = "/login";
          }, 800);
          return;
        }

        const data = await res.json();

        if (data.status === "success") {
          formMessage.textContent =
            "Account permanently deleted. Redirecting...";
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
    },
  );
});
