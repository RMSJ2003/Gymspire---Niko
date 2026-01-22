function showAlert(
  title = "✅ Success",
  message = "Link has been sent to your Email.",
) {
  const modal = document.getElementById("successModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const closeBtn = document.getElementById("closeModal");

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modal.classList.remove("hidden");

  closeBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}
