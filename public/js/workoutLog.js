/* workoutLog.js */

const REST_SECONDS = 180;
const CIRCUMFERENCE = 2 * Math.PI * 15;

/* ==========================================
   TOAST
========================================== */
function showToast(message, type = "error") {
  const existing = document.getElementById("gymToast");
  if (existing) existing.remove();

  const colors = {
    error: { bg: "#d25353", icon: "✕" },
    success: { bg: "#22c55e", icon: "✓" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    warning: { bg: "#f59e0b", icon: "⚠" },
  };
  const { bg, icon } = colors[type] || colors.error;

  const toast = document.createElement("div");
  toast.id = "gymToast";
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;left:50%;
    transform:translateX(-50%) translateY(20px);
    background:${bg};color:white;
    padding:0.75rem 1.4rem;border-radius:0.75rem;
    font-family:Arial,sans-serif;font-size:0.88rem;font-weight:600;
    display:flex;align-items:center;gap:0.55rem;
    box-shadow:0 8px 24px rgba(0,0,0,0.18);
    z-index:9999;max-width:90vw;
    opacity:0;transition:opacity 0.25s ease,transform 0.25s ease;
    pointer-events:none;
  `;
  toast.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

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

  let holdTimer = null,
    holdInterval = null;
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
        stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="0"/>
    </svg>`;

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

  let interval = null,
    remaining = REST_SECONDS,
    onDone = null;
  const progressCircle = ring.querySelector(".progress");

  function formatTime(s) {
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  }
  function updateRing() {
    progressCircle.style.strokeDashoffset =
      CIRCUMFERENCE * (1 - remaining / REST_SECONDS);
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
   TRACK SAVED SETS
========================================== */
const savedSetIds = new Set();

/* ==========================================
   HELPERS
========================================== */
function renumberRows(tbody) {
  if (!tbody) return;
  let count = 0;
  tbody.querySelectorAll("tr[data-set-id]").forEach((tr) => {
    const cell = tr.querySelector(".set-num-cell");
    if (cell) cell.textContent = ++count;
  });
}

// ✅ Check if ALL rows in a specific card's tbody are done
function allRowsDoneInCard(tbody) {
  const rows = tbody.querySelectorAll("tr[data-set-id]");
  if (!rows.length) return true;
  return Array.from(rows).every((tr) => tr.classList.contains("row-done"));
}

/* ==========================================
   WIRE A ROW
========================================== */
function wireRow({
  tr,
  wSpinner,
  rSpinner,
  startBtn,
  saveBtn,
  removeBtn,
  timer,
  setId,
  alreadySaved,
  logId,
}) {
  if (alreadySaved) return;

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
    if (removeBtn) removeBtn.style.display = "none";
    tr.classList.add("row-active");

    if (hasPrev && !tr.querySelector(".prev-hint-row")) {
      const hintRow = document.createElement("tr");
      hintRow.className = "prev-hint-row";
      const hintTd = document.createElement("td");
      hintTd.colSpan = 4;
      hintTd.innerHTML = `<div class="prev-hint"><span class="prev-hint-icon">🏆</span><span>Last time: <strong>${prevWeight} ${prevUnit}</strong> × <strong>${prevReps} reps</strong> — beat it!</span></div>`;
      hintRow.appendChild(hintTd);
      tr.before(hintRow);
    }
  });

  saveBtn.addEventListener("click", async () => {
    const weight = parseInt(
      wSpinner.querySelector(".spin-display").dataset.value,
    );
    const reps = parseInt(
      rSpinner.querySelector(".spin-display").dataset.value,
    );

    if (weight === 0) {
      const wDisplay = wSpinner.querySelector(".spin-display");
      wDisplay.classList.add("spin-error");
      const wtd = wSpinner.closest("td");
      if (wtd && !wtd.querySelector(".weight-zero-err")) {
        const msg = document.createElement("span");
        msg.className = "weight-zero-err";
        msg.textContent = "Weight cannot be 0";
        wtd.appendChild(msg);
      }
      setTimeout(() => {
        wDisplay.classList.remove("spin-error");
        wtd && wtd.querySelector(".weight-zero-err")?.remove();
      }, 2500);
      return;
    }

    if (savedSetIds.has(setId)) return;

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const res = await fetch(`/api/v1/workout-logs/${logId}/sets/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ updates: [{ setId, weight, reps }] }),
      });
      const data = await res.json();

      if (data.status === "success") {
        savedSetIds.add(setId);
        saveBtn.textContent = "✓ Done";
        saveBtn.classList.add("saved");
        tr.classList.remove("row-active");
        tr.classList.add("row-done");
        setSpinnerDisabled(wSpinner, true);
        setSpinnerDisabled(rSpinner, true);

        showOverloadTip(tr, weight, reps);

        timer.start(() => {
          const tbody = tr.closest("tbody");
          const allRows = Array.from(tbody.querySelectorAll("tr[data-set-id]"));
          const myIdx = allRows.indexOf(tr);
          const nextTr = allRows[myIdx + 1];
          if (nextTr) {
            const nextStart = nextTr.querySelector(".row-start-btn");
            if (nextStart) nextStart.disabled = false;
            nextTr.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      } else {
        saveBtn.textContent = "Save Set";
        saveBtn.disabled = false;
        showToast(data.message || "Error saving set.", "error");
      }
    } catch (err) {
      console.error(err);
      saveBtn.textContent = "Save Set";
      saveBtn.disabled = false;
      showToast("Network error. Please try again.", "error");
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", async () => {
      const exIndex = tr.closest(".exercise-card").dataset.exIndex;
      try {
        const res = await fetch(
          `/api/v1/workout-logs/${logId}/exercises/${exIndex}/sets/${setId}`,
          { method: "DELETE", credentials: "include" },
        );
        const data = await res.json();
        if (data.status === "success") {
          tr.remove();
          renumberRows(
            document.querySelector(
              `.exercise-card[data-ex-index="${exIndex}"] tbody`,
            ),
          );
          showToast("Set removed.", "info");
        } else {
          showToast(data.message || "Cannot remove set.", "error");
        }
      } catch (e) {
        showToast("Network error.", "error");
      }
    });
  }
}

/* ==========================================
   MAIN: wire each exercise card
========================================== */
document.querySelectorAll(".exercise-card").forEach((card) => {
  const tbody = card.querySelector("tbody");
  const logId = document.getElementById("finish-btn")?.dataset.logId || "";
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll("tr[data-set-id]"));
  if (!rows.length) return;

  const rowData = rows.map((tr, idx) => {
    const setId = tr.dataset.setId;
    const weightTd = tr.querySelector("td.weight-cell");
    const repsTd = tr.querySelector("td.reps-cell");
    const actionTd = tr.querySelector("td.action-cell");
    const unit = weightTd.dataset.unit || "LB";
    const initWeight = parseInt(weightTd.dataset.initWeight) || 0;
    const initReps = Math.min(
      100,
      Math.max(1, parseInt(repsTd.dataset.initReps) || 8),
    );

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

    const rSpinner = buildSpinner({
      min: 1,
      max: 100,
      step: 1,
      value: initReps,
      setId,
      field: "reps",
    });
    repsTd.innerHTML = "";
    repsTd.appendChild(rSpinner);

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

    let removeBtn = null;
    if (idx > 0) {
      removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "row-remove-btn";
      removeBtn.textContent = "✕";
      removeBtn.title = "Remove set";
      removeBtn.style.cssText =
        "font-size:0.75rem;color:#aaa;background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px;cursor:pointer;margin-left:4px;";
    }

    const timer = buildTimer();
    actionTd.appendChild(startBtn);
    actionTd.appendChild(saveBtn);
    if (removeBtn) actionTd.appendChild(removeBtn);
    actionTd.appendChild(timer.el);

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
      removeBtn,
      timer,
      setId,
      alreadySaved,
    };
  });

  // Enable first unsaved row only
  const firstUnsaved = rowData.find((r) => !r.alreadySaved);
  if (firstUnsaved) firstUnsaved.startBtn.disabled = false;

  rowData.forEach((rowObj) => {
    wireRow({ ...rowObj, logId });
  });

  /* ── ADD SET BUTTON ──────────────────────── */
  const addSetBtn = card.querySelector(".add-set-btn");
  if (addSetBtn) {
    addSetBtn.addEventListener("click", async () => {
      // ✅ GUARD: block if any row in this card is not yet done
      if (!allRowsDoneInCard(tbody)) {
        showToast(
          "Finish all current sets before adding a new one.",
          "warning",
        );
        return;
      }

      addSetBtn.disabled = true;
      addSetBtn.textContent = "Adding...";
      const exIndex = card.dataset.exIndex;

      try {
        const res = await fetch(
          `/api/v1/workout-logs/${logId}/exercises/${exIndex}/sets`,
          { method: "POST", credentials: "include" },
        );
        const data = await res.json();

        if (data.status === "success") {
          const { setId, setNumber, weight, reps, unit } = data.data;
          const tr = buildDynamicRow({
            setId,
            setNumber,
            weight,
            reps,
            unit: unit || "LB",
            logId,
          });
          tbody.appendChild(tr);
          tr.scrollIntoView({ behavior: "smooth", block: "center" });
          showToast(`Set ${setNumber} added!`, "success");
        } else {
          showToast(data.message || "Could not add set.", "error");
        }
      } catch (e) {
        showToast("Network error.", "error");
      } finally {
        addSetBtn.disabled = false;
        addSetBtn.textContent = "+ Add Set";
      }
    });
  }
});

/* ==========================================
   BUILD DYNAMIC ROW (newly added sets)
   ✅ Start button is DISABLED — user must
   finish previous sets first via the guard above
========================================== */
function buildDynamicRow({ setId, setNumber, weight, reps, unit, logId }) {
  const tr = document.createElement("tr");
  tr.dataset.setId = setId;
  tr.dataset.saved = "false";
  tr.dataset.prevWeight = "";
  tr.dataset.prevReps = "";
  tr.dataset.prevUnit = unit;

  const setNumTd = document.createElement("td");
  setNumTd.className = "set-num-cell";
  setNumTd.textContent = setNumber;

  const weightTd = document.createElement("td");
  weightTd.className = "weight-cell";
  weightTd.dataset.initWeight = weight;
  weightTd.dataset.unit = unit;
  const weightRow = document.createElement("div");
  weightRow.className = "weight-row";
  const wSpinner = buildSpinner({
    min: 0,
    max: 500,
    step: 5,
    value: weight,
    setId,
    field: "weight",
  });
  const unitLabel = document.createElement("span");
  unitLabel.className = "unit-side-label";
  unitLabel.textContent = unit;
  weightRow.appendChild(wSpinner);
  weightRow.appendChild(unitLabel);
  weightTd.appendChild(weightRow);

  const repsTd = document.createElement("td");
  repsTd.className = "reps-cell";
  repsTd.dataset.initReps = reps;
  const rSpinner = buildSpinner({
    min: 1,
    max: 100,
    step: 1,
    value: reps,
    setId,
    field: "reps",
  });
  repsTd.appendChild(rSpinner);

  const actionTd = document.createElement("td");
  actionTd.className = "action-cell";

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "row-start-btn";
  startBtn.textContent = "Start";
  // ✅ Since the guard above ensures all previous sets are done,
  // the new row's Start button is immediately enabled
  startBtn.disabled = false;

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "row-save-btn";
  saveBtn.textContent = "Save Set";
  saveBtn.disabled = true;
  saveBtn.style.display = "none";

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "row-remove-btn";
  removeBtn.textContent = "✕";
  removeBtn.title = "Remove set";
  removeBtn.style.cssText =
    "font-size:0.75rem;color:#aaa;background:none;border:1px solid #ddd;border-radius:4px;padding:2px 8px;cursor:pointer;margin-left:4px;";

  const timer = buildTimer();
  actionTd.appendChild(startBtn);
  actionTd.appendChild(saveBtn);
  actionTd.appendChild(removeBtn);
  actionTd.appendChild(timer.el);

  tr.appendChild(setNumTd);
  tr.appendChild(weightTd);
  tr.appendChild(repsTd);
  tr.appendChild(actionTd);

  wireRow({
    tr,
    wSpinner,
    rSpinner,
    startBtn,
    saveBtn,
    removeBtn,
    timer,
    setId,
    alreadySaved: false,
    logId,
  });

  return tr;
}

// Hide global save button
const saveSetsBtn = document.getElementById("saveSetsBtn");
if (saveSetsBtn) saveSetsBtn.style.display = "none";

/* ==========================================
   PROGRESSIVE OVERLOAD TIP
========================================== */
function showOverloadTip(tr, weight, reps) {
  const existing = tr.nextSibling;
  if (existing && existing.classList?.contains("overload-tip-row"))
    existing.remove();

  let icon, message, type;
  if (reps >= 12) {
    icon = "🔥";
    type = "level-up";
    message = `Max reps hit! Next session: add <strong>5 LB → ${weight + 5} LB</strong> and aim for <strong>8 reps</strong>.`;
  } else if (reps >= 10) {
    icon = "💪";
    type = "push";
    message = `Strong set! Try to hit <strong>${reps + 1}–12 reps</strong> next session at the same weight.`;
  } else if (reps === 9) {
    icon = "📈";
    type = "push";
    message = `Good work! Push for <strong>${reps + 1} reps</strong> next session.`;
  } else {
    icon = "🎯";
    type = "steady";
    message = `Solid start! Keep this weight and aim for <strong>more reps</strong> each session until you hit 12.`;
  }

  const tip = document.createElement("div");
  tip.className = `overload-tip overload-${type}`;
  tip.innerHTML = `<span class="overload-icon">${icon}</span><span>${message}</span>`;
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
            const MAX_SIZE_BYTES = 100 * 1024 * 1024;
            const allowedTypes = [
              "video/mp4",
              "video/quicktime",
              "video/webm",
              "video/x-msvideo",
            ];
            if (!allowedTypes.includes(file.type)) {
              showToast(
                "Invalid file type. Upload MP4, MOV, WebM, or AVI.",
                "error",
              );
              videoInput.value = "";
              return;
            }
            if (file.size > MAX_SIZE_BYTES) {
              showToast(
                `Video too large (${(file.size / 1048576).toFixed(1)} MB). Max 100 MB.`,
                "error",
              );
              videoInput.value = "";
              return;
            }
            formData.append("video", file);
          }
          await submitFinish(logId, formData);
        };
        return;
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
    return;
  try {
    const res = await fetch(`/api/v1/workout-logs/${logId}/finish`, {
      method: "PATCH",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Workout finished! Great job 💪", "success");
      setTimeout(() => location.reload(), 1200);
    } else {
      showToast(data.message || "Failed to finish workout.", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Something went wrong while finishing workout.", "error");
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
   HELPERS
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
