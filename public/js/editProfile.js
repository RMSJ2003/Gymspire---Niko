const photoForm = document.getElementById("photoForm");
if (photoForm) {
  photoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("pfp");

    if (!fileInput || !fileInput.files[0]) {
      alert("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("pfp", fileInput.files[0]);

    try {
      const res = await fetch("/api/v1/users/updateMyPhoto", {
        method: "PATCH",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      alert("Profile picture updated!");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  });
}
