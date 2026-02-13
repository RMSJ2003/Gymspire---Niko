// ==================================================
// DASHBOARD JS
// Handles modal info popups and card routing
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal"); // Modal container
  const modalText = document.getElementById("modalText"); // Modal text element
  const closeModal = document.getElementById("closeModal"); // Close button

  // 🔹 Determine dashboard type from data attribute
  const dashboardEl = document.querySelector(".dashboard");
  const type = dashboardEl ? dashboardEl.dataset.type : "user"; // default to user

  // 🔹 Info data for modal popups
  let infoData = [];

  if (type === "user") {
    infoData = [
      {
        text: `
          <h2> Challenge Information & Instructions</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Weekly Challenges:</strong> Challenges are created once every week and must be completed within the given week.</li>
            <li><strong> Workout Video Submission:</strong> You may upload a workout video, but it is optional.</li>
            <li><strong> Coach Assessment:</strong> The coach will assess your submitted challenge performance.</li>
            <li><strong> Purpose:</strong> Challenges help you stay consistent and improve your fitness journey.</li>
            <li><strong>⚠ Reminder:</strong> Always exercise safely and rest when needed.</li>
          </ul>
        `,
      },
      {
        text: `
          <h2> Workout Plan Instructions</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Plan your workouts effectively:</strong> Use this section to organize your weekly exercises according to your goals.</li>
            <li><strong> Edit your workout:</strong> Customize your workouts based on your personal preferences and fitness level.</li>
            <li><strong> Follow instructions:</strong> Each exercise comes with recommended sets, reps, and proper form guidance to maximize results.</li>
            <li><strong> Stay consistent:</strong> Completing your planned workouts regularly is key to achieving your fitness goals.</li>
            <li><strong>⚠ Safety first:</strong> Warm up before exercises and rest as needed to avoid injuries.</li>
          </ul>
        `,
      },
      {
        text: `
          <h2> Workout Logs Instructions</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> View your logs:</strong> Check all your completed workouts for the current week and previous weeks.</li>
            <li><strong> Search your progress:</strong> Monitor your progress over time.</li>
            <li><strong> Record details:</strong> Ensure each exercise is logged accurately to get a clear picture of your performance.</li>
            <li><strong> Set goals:</strong> Use your logs to identify areas of improvement and adjust future workouts accordingly.</li>
            <li><strong>⚠ Stay consistent:</strong> Regularly logging workouts helps you stay on track with your fitness goals.</li>
          </ul>
        `,
      },
      {
        text: `
          <h2> Start Workout Instructions</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Start anytime:</strong> Begin a solo workout whenever you have free time.</li>
            <li><strong> Choose exercises:</strong> Select the exercises you want to perform for your session.</li>
            <li><strong> Customize intensity:</strong> Adjust weights, reps, or time according to your fitness level and goals.</li>
          </ul>
        `,
      },
    ];
  } else if (type === "admin") {
    infoData = [
      {
        text: `
          <h2> Users Information</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> View users:</strong> See all registered users in the system.</li>
            <li><strong> Manage users:</strong> Edit, delete, or assign roles to users as needed.</li>
            <li><strong> Track activity:</strong> Monitor user engagement and workout activity.</li>
          </ul>
        `,
      },
      {
        text: `
          <h2> Exercises Management</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Add exercises:</strong> Create new exercises to expand the exercise database.</li>
            <li><strong> Edit exercises:</strong> Modify existing exercise details such as name, sets, reps, and description.</li>
            <li><strong> Organize routines:</strong> Manage exercise categories and ensure proper grouping.</li>
          </ul>
        `,
      },
    ];
  } else if (type === "coach") {
    infoData = [
      {
        text: `
          <h2> Coach Challenges</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Assign challenges:</strong> Set weekly challenges for users to improve their fitness.</li>
            <li><strong> Monitor progress:</strong> Track user performance on assigned challenges.</li>
          </ul>
        `,
      },
      {
        text: `
          <h2> Workout Plan Review</h2>
          <ul style="text-align:left; margin-top:10px; line-height:1.6;">
            <li><strong> Review plans:</strong> Look at user workout plans and ensure they meet their goals.</li>
            <li><strong> Adjust exercises:</strong> Modify sets, reps, and exercise selection based on user progress.</li>
          </ul>
        `,
      },
    ];
  }

  // 🔹 Open modal when info button is clicked
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index; // Get index of clicked card
      const data = infoData[index]; // Get corresponding info

      modal.classList.remove("hidden"); // Show modal
      modalText.innerHTML = data.text; // Insert HTML content
    });
  });

  // 🔹 Close modal button
  closeModal.addEventListener("click", () => {
    modal.classList.add("hidden"); // Hide modal
  });

  // 🔹 Close modal when clicking outside content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden"); // Hide modal
  });

  // ==================================================
  // ✅ FIXED CARD ROUTING SYSTEM (NO AUTO-GENERATE)
  // Maps exact card names to backend routes
  // ==================================================
  const routes = {
    Challenges: "/challenges",
    "Workout Plan": "/workoutPlan",
    "Workout Logs": "/workoutLogs",
    "Solo Workout": "/startSoloWorkout",
    Users: "/users",
    "Exercises Management": "/exercisesManagement",
  };

  // 🔹 Fix all card links
  document.querySelectorAll(".card").forEach((card) => {
    const link = card.querySelector(".card-link");
    if (!link) return;

    const text = link.textContent.trim();
    if (routes[text]) {
      link.href = routes[text]; // Set correct backend route
    } else {
      console.warn(`⚠ No backend route defined for: ${text}`);
      link.href = "#";
    }
  });
});
