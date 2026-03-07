/* workoutLog.js */

const REST_SECONDS = 180;
const CIRCUMFERENCE = 2 * Math.PI * 15;

/* ==========================================
   SPINNER BUILDER
========================================== */
function buildSpinner({ min, max, step, value, setId, field }) {
  const wrap = document.createElement("div");
  wrap.className = "set-input-wrap";
  wrap.dataset.setId = setId;
  wrap.dataset.field = field;
  wrap.dataset.disabled = "true";

  const up = document.createElement("button");
  up.type = "button";
  up.className = "spin-btn";
  up.textContent = "▲";

  const display = document.createElement("div");
  display.className = "spin-display";
  display.textContent = value;
  display.dataset.value = value;
  display.dataset.setId = setId;
  display.dataset.field = field;

  const down = document.createElement("button");
  down.type = "button";
  down.className = "spin-btn";
  down.textContent = "▼";

  function inc() {
    if (wrap.dataset.disabled === "true") return;
    let v = parseInt(display.dataset.value) + step;
    if (v > max) v = max;
    display.dataset.value = v;
    display.textContent = v;
  }

  function dec() {
    if (wrap.dataset.disabled === "true") return;
    let v = parseInt(display.dataset.value) - step;
    if (v < min) v = min;
    display.dataset.value = v;
    display.textContent = v;
  }

  let holdTimer = null;
  let holdInterval = null;
  function startHold(fn) {
    fn();
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(fn, 80);
    }, 400);
  }
  function stopHold() {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
  }

  up.addEventListener("mousedown", () => startHold(inc));
  up.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startHold(inc);
  });
  down.addEventListener("mousedown", () => startHold(dec));
  down.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startHold(dec);
  });
  ["mouseup", "mouseleave", "touchend"].forEach((ev) => {
    up.addEventListener(ev, stopHold);
    down.addEventListener(ev, stopHold);
  });

  display.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (wrap.dataset.disabled === "true") return;
      e.deltaY < 0 ? inc() : dec();
    },
    { passive: false },
  );

  wrap.appendChild(up);
  wrap.appendChild(display);
  wrap.appendChild(down);
  setSpinnerDisabled(wrap, true);
  return wrap;
}

function setSpinnerDisabled(wrap, disabled) {
  wrap.dataset.disabled = disabled ? "true" : "false";
  wrap.classList.toggle("spinner-disabled", disabled);
  wrap.querySelectorAll(".spin-btn").forEach((btn) => {
    btn.disabled = disabled;
  });
}

/* ==========================================
   TIMER BUILDER
========================================== */
function buildTimer() {
  const container = document.createElement("div");
  container.className = "rest-timer";

  const ring = document.createElement("div");
  ring.className = "timer-ring";
  ring.innerHTML = `
    <svg viewBox="0 0 36 36">
      <circle class="bg" cx="18" cy="18" r="15"/>
      <circle class="progress" cx="18" cy="18" r="15"
        stroke-dasharray="${CIRCUMFERENCE}"
        stroke-dashoffset="0"/>
    </svg>
  `;

  const countdown = document.createElement("div");
  countdown.className = "timer-countdown";
  countdown.textContent = "3:00";

  const skipBtn = document.createElement("button");
  skipBtn.type = "button";
  skipBtn.className = "timer-skip";
  skipBtn.textContent = "Skip ▶";

  container.appendChild(ring);
  container.appendChild(countdown);
  container.appendChild(skipBtn);

  let interval = null;
  let remaining = REST_SECONDS;
  const progressCircle = ring.querySelector(".progress");
  let onDone = null;

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function updateRing() {
    const frac = remaining / REST_SECONDS;
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - frac);
    countdown.textContent = formatTime(remaining);
  }

  function finish() {
    clearInterval(interval);
    container.classList.remove("active");
    remaining = REST_SECONDS;
    updateRing();
    if (onDone) {
      onDone();
      onDone = null;
    }
  }

  function start(callback) {
    onDone = callback || null;
    clearInterval(interval);
    remaining = REST_SECONDS;
    updateRing();
    container.classList.add("active");
    interval = setInterval(() => {
      remaining--;
      updateRing();
      if (remaining <= 0) {
        clearInterval(interval);
        container.classList.remove("active");
        countdown.textContent = "GO! 💪";
        setTimeout(() => {
          countdown.textContent = "3:00";
          if (onDone) {
            onDone();
            onDone = null;
          }
        }, 1500);
      }
    }, 1000);
  }

  skipBtn.addEventListener("click", finish);

  return { el: container, start };
}

/* ==========================================
   MAIN: wire up each exercise card
========================================== */
// Track saved setIds for this session — prevents duplicate saves
const savedSetIds = new Set();

document.querySelectorAll(".exercise-card").forEach((card) => {
  const rows = Array.from(card.querySelectorAll("tr[data-set-id]"));
  if (!rows.length) return;

  const rowData = rows.map((tr, idx) => {
    const setId = tr.dataset.setId;
    const weightTd = tr.querySelector("td.weight-cell");
    const repsTd = tr.querySelector("td.reps-cell");
    const actionTd = tr.querySelector("td.action-cell");

    const unit = weightTd.dataset.unit || "LB";
    const initWeight = parseInt(weightTd.dataset.initWeight) || 0;
    const initReps = Math.min(
      12,
      Math.max(8, parseInt(repsTd.dataset.initReps) || 8),
    );

    // Weight cell: spinner + "LB" beside it
    const weightRow = document.createElement("div");
    weightRow.className = "weight-row";
    const wSpinner = buildSpinner({
      min: 0,
      max: 500,
      step: 5,
      value: initWeight,
      setId,
      field: "weight",
    });
    const unitLabel = document.createElement("span");
    unitLabel.className = "unit-side-label";
    unitLabel.textContent = unit;
    weightRow.appendChild(wSpinner);
    weightRow.appendChild(unitLabel);
    weightTd.innerHTML = "";
    weightTd.appendChild(weightRow);

    // Reps cell
    const rSpinner = buildSpinner({
      min: 8,
      max: 12,
      step: 1,
      value: initReps,
      setId,
      field: "reps",
    });
    repsTd.innerHTML = "";
    repsTd.appendChild(rSpinner);

    // Action cell: Start → Save Set + Timer
    actionTd.innerHTML = "";

    const startBtn = document.createElement("button");
    startBtn.type = "button";
    startBtn.className = "row-start-btn";
    startBtn.textContent = "Start";
    startBtn.disabled = true;

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "row-save-btn";
    saveBtn.textContent = "Save Set";
    saveBtn.disabled = true;
    saveBtn.style.display = "none";

    const timer = buildTimer();

    actionTd.appendChild(startBtn);
    actionTd.appendChild(saveBtn);
    actionTd.appendChild(timer.el);

    // Restore already-saved rows from DB (survives page refresh)
    const alreadySaved = tr.dataset.saved === "true";
    if (alreadySaved) {
      savedSetIds.add(setId);
      tr.classList.add("row-done");
      weightTd.innerHTML = `<div class="weight-row"><span style="color:white;font-weight:700;">${initWeight}</span><span class="unit-side-label">${unit}</span></div>`;
      repsTd.innerHTML = `<span style="color:white;font-weight:700;">${initReps}</span>`;
      actionTd.innerHTML = `<span style="color:white;font-weight:700;">✓</span>`;
    }

    return {
      tr,
      wSpinner,
      rSpinner,
      startBtn,
      saveBtn,
      timer,
      setId,
      idx,
      alreadySaved,
    };
  });

  // Enable first unsaved row's Start
  const firstUnsaved = rowData.find((r) => !r.alreadySaved);
  if (firstUnsaved) firstUnsaved.startBtn.disabled = false;

  function enableRow(rowObj) {
    rowObj.startBtn.disabled = false;
    rowObj.tr.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  rowData.forEach((rowObj, idx) => {
    const { tr, wSpinner, rSpinner, startBtn, saveBtn, timer } = rowObj;

    // Skip wiring for rows already saved in DB
    if (rowObj.alreadySaved) return;

    const prevWeight = tr.dataset.prevWeight;
    const prevReps = tr.dataset.prevReps;
    const prevUnit = tr.dataset.prevUnit || "LB";
    const hasPrev = prevWeight !== "" && prevReps !== "";

    startBtn.addEventListener("click", () => {
      startBtn.disabled = true;
      startBtn.style.display = "none";
      setSpinnerDisabled(wSpinner, false);
      setSpinnerDisabled(rSpinner, false);
      saveBtn.disabled = false;
      saveBtn.style.display = "";
      tr.classList.add("row-active");

      // Show "beat your last" hint
      if (hasPrev) {
        const existingHint = tr.querySelector(".prev-hint");
        if (!existingHint) {
          const hintRow = document.createElement("tr");
          hintRow.className = "prev-hint-row";
          const hintTd = document.createElement("td");
          hintTd.colSpan = 4;
          hintTd.innerHTML = `
            <div class="prev-hint">
              <span class="prev-hint-icon">🏆</span>
              <span>Last time: <strong>${prevWeight} ${prevUnit}</strong> × <strong>${prevReps} reps</strong> — beat it!</span>
            </div>`;
          hintRow.appendChild(hintTd);
          tr.before(hintRow);
        }
      }
    });

    saveBtn.addEventListener("click", async () => {
      const weight = parseInt(
        wSpinner.querySelector(".spin-display").dataset.value,
      );
      const reps = parseInt(
        rSpinner.querySelector(".spin-display").dataset.value,
      );
      const logId = document.getElementById("finish-btn")?.dataset.logId || "";

      if (weight === 0) {
        const wDisplay = wSpinner.querySelector(".spin-display");
        wDisplay.classList.add("spin-error");
        const weightTd = wSpinner.closest("td");
        if (weightTd && !weightTd.querySelector(".weight-zero-err")) {
          const msg = document.createElement("span");
          msg.className = "weight-zero-err";
          msg.textContent = "Weight cannot be 0";
          weightTd.appendChild(msg);
        }
        setTimeout(() => {
          wDisplay.classList.remove("spin-error");
          weightTd && weightTd.querySelector(".weight-zero-err")?.remove();
        }, 2500);
        return;
      }

      // Guard: prevent duplicate save for same setId
      if (savedSetIds.has(rowObj.setId)) return;

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        const res = await fetch(`/api/v1/workout-logs/${logId}/sets/bulk`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            updates: [{ setId: rowObj.setId, weight, reps }],
          }),
        });
        const data = await res.json();

        if (data.status === "success") {
          savedSetIds.add(rowObj.setId);
          saveBtn.textContent = "✓ Done";
          saveBtn.classList.add("saved");
          tr.classList.remove("row-active");
          tr.classList.add("row-done");
          setSpinnerDisabled(wSpinner, true);
          setSpinnerDisabled(rSpinner, true);

          // Progressive overload tip
          showOverloadTip(tr, weight, reps, rowObj.setId);

          timer.start(() => {
            const next = rowData[idx + 1];
            if (next) enableRow(next);
          });
        } else {
          saveBtn.textContent = "Save Set";
          saveBtn.disabled = false;
          alert(data.message || "Error saving.");
        }
      } catch (err) {
        console.error(err);
        saveBtn.textContent = "Save Set";
        saveBtn.disabled = false;
      }
    });
  });
});

// Hide global save button (per-row handles saves)
const saveSetsBtn = document.getElementById("saveSetsBtn");
if (saveSetsBtn) saveSetsBtn.style.display = "none";

/* ==========================================
   PROGRESSIVE OVERLOAD TIP
========================================== */
function showOverloadTip(tr, weight, reps, setId) {
  // Remove any existing tip on this row
  const existing = tr.querySelector(".overload-tip");
  if (existing) existing.remove();

  let icon, message, type;

  if (reps >= 12) {
    icon = "🔥";
    type = "level-up";
    const nextWeight = weight + 5;
    message = `Max reps hit! Next session: add <strong>5 LB → ${nextWeight} LB</strong> and aim for <strong>8 reps</strong>.`;
  } else if (reps >= 10) {
    icon = "💪";
    type = "push";
    message = `Strong set! Try to hit <strong>${reps + 1}–12 reps</strong> next session at the same weight.`;
  } else if (reps === 9) {
    icon = "📈";
    type = "push";
    message = `Good work! Push for <strong>${reps + 1} reps</strong> next session before increasing weight.`;
  } else {
    // reps === 8
    icon = "🎯";
    type = "steady";
    message = `Solid start! Keep this weight and aim for <strong>more reps</strong> each session until you hit 12.`;
  }

  const tip = document.createElement("div");
  tip.className = `overload-tip overload-${type}`;
  tip.innerHTML = `<span class="overload-icon">${icon}</span><span>${message}</span>`;

  // Insert tip as a new row spanning all columns
  const tipRow = document.createElement("tr");
  tipRow.className = "overload-tip-row";
  const tipTd = document.createElement("td");
  tipTd.colSpan = 4;
  tipTd.appendChild(tip);
  tipRow.appendChild(tipTd);

  tr.after(tipRow);
}

/* ==========================================
   FINISH WORKOUT
========================================== */
const finishBtn = document.getElementById("finish-btn");
if (finishBtn) {
  finishBtn.addEventListener("click", async () => {
    const logId = finishBtn.dataset.logId;

    if (!allSetsSaved()) {
      const total = document.querySelectorAll("tr[data-set-id]").length;
      const saved = document.querySelectorAll(
        "tr[data-set-id].row-done",
      ).length;
      showFinishError(`Complete all sets first — ${saved} of ${total} saved.`);
      return;
    }

    const isChallenge = finishBtn.dataset.isChallenge === "true";
    const formData = new FormData();

    if (isChallenge) {
      const wantsVideo = confirm("Do you want to upload a video? (Optional)");

      if (wantsVideo) {
        const videoInput = document.querySelector(
          `.video-input[data-log-id="${logId}"]`,
        );
        videoInput.click();

        videoInput.onchange = async () => {
          if (videoInput.files.length) {
            const file = videoInput.files[0];
            const MAX_SIZE_MB = 100;
            const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
            const allowedTypes = [
              "video/mp4",
              "video/quicktime",
              "video/webm",
              "video/x-msvideo",
            ];

            if (!allowedTypes.includes(file.type)) {
              showFinishError(
                "Invalid file type. Please upload an MP4, MOV, WebM, or AVI video.",
              );
              videoInput.value = "";
              return;
            }

            if (file.size > MAX_SIZE_BYTES) {
              const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
              showFinishError(
                `Video too large (${sizeMB} MB). Maximum allowed size is ${MAX_SIZE_MB} MB.`,
              );
              videoInput.value = "";
              return;
            }

            formData.append("video", file);
          }
          await submitFinish(logId, formData);
        };

        return; // wait for file selection
      }
    }

    await submitFinish(logId, formData);
  });
}

async function submitFinish(logId, formData) {
  if (
    !confirm(
      "Are you sure you want to finish this workout? This cannot be undone.",
    )
  )
    return; // ✅ add here

  try {
    const res = await fetch(`/api/v1/workout-logs/${logId}/finish`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("Workout finished!");
      location.reload();
    } else {
      alert(data.message || "Failed to finish workout.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while finishing workout.");
  }
}

/* ==========================================
   DELOAD BANNER DISMISS
========================================== */
const deloadDismiss = document.querySelector(".deload-dismiss");
if (deloadDismiss) {
  deloadDismiss.addEventListener("click", () => {
    const banner = document.querySelector(".deload-banner");
    if (banner) {
      banner.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      banner.style.opacity = "0";
      banner.style.transform = "translateY(-8px)";
      setTimeout(() => banner.remove(), 320);
    }
  });
}

/* ==========================================
   FINISH GUARD — checks all sets are saved
========================================== */
function allSetsSaved() {
  const totalRows = document.querySelectorAll("tr[data-set-id]");
  const savedRows = document.querySelectorAll("tr[data-set-id].row-done");
  return totalRows.length > 0 && savedRows.length === totalRows.length;
}

function showFinishError(msg) {
  let err = document.getElementById("finish-error-msg");
  if (!err) {
    err = document.createElement("p");
    err.id = "finish-error-msg";
    err.className = "finish-error-msg";
    finishBtn.insertAdjacentElement("afterend", err);
  }
  err.textContent = msg;
  err.style.display = "block";
  setTimeout(() => {
    err.style.display = "none";
  }, 3000);
}
