const form = document.querySelector("#startSoloWorkoutForm");
const message = document.querySelector("#startMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 🔥 Collect selected muscles
  const checked = [
    ...document.querySelectorAll("input[name='targets']:checked"),
  ];
  const targets = checked.map((cb) => cb.value);

  if (targets.length === 0) {
    message.textContent = "Please select at least one muscle group.";
    message.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/v1/workout-logs/solo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targets }),
    });

    const data = await res.json();

    if (data.status === "success") {
      message.textContent = "Workout started!";
      message.style.color = "green";

      const workoutLogId = data.data._id;

      // 🔥 REDIRECT TO LIVE WORKOUT PAGE
      setTimeout(() => {
        // window.location.href = '/workoutLogs';
        window.location.href = `/workoutLogs/${workoutLogId}`;
      }, 500);
    } else {
      message.textContent = data.message || "Failed to start workout.";
      message.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    message.textContent = "Something went wrong while starting workout.";
    message.style.color = "red";
  }
});
