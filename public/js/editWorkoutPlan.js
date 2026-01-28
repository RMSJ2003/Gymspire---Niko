const form = document.querySelector("#editWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const checked = document.querySelectorAll(
    'input[name="exerciseIds"]:checked',
  );

  if (checked.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    formMessage.style.color = "red";
    return;
  }

  const exerciseIds = Array.from(checked).map((input) => input.value);

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Workout plan updated successfully!";
      formMessage.style.color = "green";

      setTimeout(() => {
        window.location.href = "/workoutPlan";
      }, 600);
    } else {
      formMessage.textContent = data.message || "Update failed.";
      formMessage.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    formMessage.textContent = "Something went wrong.";
    formMessage.style.color = "red";
  }
});
