const form = document.querySelector("#createChallengeForm");
const formMessage = document.querySelector("#formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.querySelector("#name").value.trim();
  const startTime = document.querySelector("#startTime").value;
  const endTime = document.querySelector("#endTime").value;

  const checked = document.querySelectorAll(
    'input[name="exerciseIds"]:checked',
  );

  if (!name || !startTime || !endTime) {
    formMessage.textContent = "Please fill in all fields.";
    formMessage.style.color = "red";
    return;
  }

  if (checked.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    formMessage.style.color = "red";
    return;
  }

  const exerciseIds = Array.from(checked).map((input) => input.value);

  try {
    const res = await fetch("/api/v1/challenges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        startTime,
        endTime,
        exerciseIds,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      formMessage.textContent = "Challenge created successfully!";
      formMessage.style.color = "green";

      setTimeout(() => {
        window.location.href = "/challenges";
      }, 600);
    } else {
      formMessage.textContent = data.message || "Failed to create challenge.";
      formMessage.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Something went wrong. Please try again.";
    formMessage.style.color = "red";
  }
});
