const form = document.querySelector("#prForm");
const input = document.querySelector("#exerciseInput");
const resultDiv = document.querySelector("#prResult");
/*
NOTE:
encodeURIComponent() makes a string safe to put inside a URL.

Because URLs:

Cannot safely contain spaces

Cannot contain special characters like:

/

?

&

#

%

So JavaScript converts them into encoded form.

*/
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const exerciseName = input.value.trim();

  if (!exerciseName) {
    resultDiv.innerHTML =
      "<p style='color:red'>Please enter an exercise name.</p>";
    return;
  }

  try {
    const res = await fetch(
      `/api/v1/prs/exercise/${encodeURIComponent(exerciseName)}`,
    );
    const data = await res.json();

    if (data.status === "success") {
      const pr = data.data;

      const date = new Date(pr.date).toDateString();

      resultDiv.innerHTML = `
        <h3>🏆 Personal Record</h3>
        <p><strong>Exercise:</strong> ${pr.exercise}</p>
        <p><strong>Weight:</strong> ${pr.weight} ${pr.unit}</p>
        <p><strong>Reps:</strong> ${pr.reps}</p>
        <p><strong>Date:</strong> ${date}</p>
      `;
    } else {
      resultDiv.innerHTML = `<p style="color:red">${data.message || "No PR found."}</p>`;
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML =
      "<p style='color:red'>Error fetching personal record.</p>";
  }
});
