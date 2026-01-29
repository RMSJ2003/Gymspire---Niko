const form = document.querySelector("#editProfileForm");
const formMessage = document.querySelector("#formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // this already STOPS normal submit, no return needed
  console.log("hello");
  const formData = new FormData(form);

  // Check if user changed anything
  const username = formData.get("username");
  const file = formData.get("pfp");

  if (!username && (!file || file.size === 0)) {
    formMessage.textContent = "Nothing to update";
    return;
  }

  const res = await fetch("/api/v1/users/updateMe", {
    method: "PATCH",
    body: formData,
  });

  const data = await res.json();

  if (data.status === "success") {
    formMessage.textContent = "Profile updated successfully";

    setTimeout(() => {
      location.reload();
    }, 700);
  } else {
    formMessage.textContent = data.message || "Update failed";
  }
});
