const form = document.querySelector("#editProfileForm");
const formMessage = document.querySelector("#formMessage");
const pfpInput = document.querySelector("#pfp");
const previewImg = document.querySelector("#previewImg");

/* ── Live avatar preview ── */
pfpInput.addEventListener("change", () => {
  const file = pfpInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

/* ── Submit ── */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector("button[type='submit']");
  const btnText = submitBtn.querySelector("span");

  const formData = new FormData(form);
  const username = formData.get("username")?.trim();
  const file = formData.get("pfp");

  const usernameChanged = username && username !== "";
  const fileChanged = file && file.size > 0;

  if (!usernameChanged && !fileChanged) {
    formMessage.textContent = "Nothing to update.";
    formMessage.className = "form-message";
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = "Saving...";
  formMessage.textContent = "";

  try {
    const res = await fetch("/api/v1/users/updateMe", {
      method: "PATCH",
      body: formData,
    });
    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Profile updated successfully!";
      formMessage.className = "form-message success";
      setTimeout(() => location.reload(), 900);
    } else {
      formMessage.textContent = data.message || "Update failed.";
      formMessage.className = "form-message";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Network error. Please try again.";
    formMessage.className = "form-message";
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = "Save Changes";
  }
});
