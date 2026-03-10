/* ── Online Users Pagination ─────────────────────────
   Drop this anywhere after the DOM loads.
   Works with the existing .online-users list.
   ─────────────────────────────────────────────────── */
(function initOnlineUsersPagination() {
  const PAGE_SIZE = 3;

  const list = document.querySelector(".online-users");
  if (!list) return;

  const rows = Array.from(list.querySelectorAll(".online-user"));
  if (rows.length <= PAGE_SIZE) return; // no pagination needed

  let page = 0;
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);

  // Wrap list in a relative container
  const wrap = document.createElement("div");
  wrap.className = "online-users-wrap";
  list.parentNode.insertBefore(wrap, list);
  wrap.appendChild(list);

  // Build pagination bar
  const bar = document.createElement("div");
  bar.className = "users-pagination";

  const info = document.createElement("span");
  info.className = "users-page-info";

  const btns = document.createElement("div");
  btns.className = "users-page-btns";

  const prevBtn = document.createElement("button");
  prevBtn.className = "users-page-btn";
  prevBtn.type = "button";
  prevBtn.textContent = "‹";
  prevBtn.setAttribute("aria-label", "Previous");

  const nextBtn = document.createElement("button");
  nextBtn.className = "users-page-btn";
  nextBtn.type = "button";
  nextBtn.textContent = "›";
  nextBtn.setAttribute("aria-label", "Next");

  btns.appendChild(prevBtn);
  btns.appendChild(nextBtn);
  bar.appendChild(info);
  bar.appendChild(btns);
  wrap.appendChild(bar);

  function render() {
    const start = page * PAGE_SIZE;
    const end   = start + PAGE_SIZE;

    rows.forEach((row, i) => {
      row.style.display = (i >= start && i < end) ? "" : "none";
    });

    info.textContent = `${page + 1} / ${totalPages}`;
    prevBtn.disabled = page === 0;
    nextBtn.disabled = page === totalPages - 1;
  }

  prevBtn.addEventListener("click", () => { if (page > 0) { page--; render(); } });
  nextBtn.addEventListener("click", () => { if (page < totalPages - 1) { page++; render(); } });

  render();
})();
