    const API_URL = "http://127.0.0.1:8000";
    const API_BASE_URL = "http://127.0.0.1:8000";

    const state = {
      historyPage: 1,
      historyLimit: 5,
      historySearch: "",
      historyTotal: 0,
      selectedRating: 0
    };

    const $ = (id) => document.getElementById(id);

    document.addEventListener("DOMContentLoaded", () => {
      initThemeToggle();
      initMobileSidebar();
      initNavHighlight();
      initRippleEffect();
      initAnalyzeEvent();
      initTopicGenerator();
      initFactChecker();
      initHistoryControls();
      initFeedback();
      loadHistory();
    });

    /* -----------------------------
      Theme Toggle
    ----------------------------- */
    function initThemeToggle() {
      const themeBtn = document.querySelector(".theme-toggle");
      const icon = themeBtn?.querySelector("i");
      const savedTheme = localStorage.getItem("pna-theme");

      if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        if (icon) icon.className = "fa-solid fa-sun";
      }

      themeBtn?.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const isLight = document.body.classList.contains("light-theme");
        localStorage.setItem("pna-theme", isLight ? "light" : "dark");
        if (icon) {
          icon.className = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
      });
    }

    /* -----------------------------
      Mobile Sidebar
    ----------------------------- */
    function initMobileSidebar() {
      const btn = $("mobileMenuBtn");
      const sidebar = document.querySelector(".sidebar");

      btn?.addEventListener("click", () => {
        sidebar?.classList.toggle("open");
      });

      document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          sidebar?.classList.remove("open");
        });
      });
    }

    /* -----------------------------
      Active Nav Highlight
    ----------------------------- */
    function initNavHighlight() {
      const links = document.querySelectorAll(".nav-link");
      const sections = [...links]
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

      function updateActiveLink() {
        let currentId = "";
        const offset = window.scrollY + 180;

        sections.forEach((section) => {
          if (offset >= section.offsetTop) currentId = section.id;
        });

        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
        });
      }

      window.addEventListener("scroll", updateActiveLink);
      updateActiveLink();
    }

    /* -----------------------------
      Ripple Effect
    ----------------------------- */
    function initRippleEffect() {
      document.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          const rect = btn.getBoundingClientRect();
          btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
          btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
        });
      });
    }

    /* -----------------------------
      Analyze Event
    ----------------------------- */
    function initAnalyzeEvent() {
      $("analyzeBtn")?.addEventListener("click", analyzeEvent);

      $("clearAnalyzeBtn")?.addEventListener("click", () => {
        $("eventInput").value = "";
        $("summaryOutput").textContent = "Your event summary will appear here.";
        renderList($("talkingPointsOutput"), []);
        renderList($("networkingTipsOutput"), []);
        $("confidenceOutput").textContent = "--%";
        $("confidenceBar").style.width = "0%";
        clearStatus("analyzeStatus");
      });
    }

    async function analyzeEvent() {
      const eventText = $("eventInput").value.trim();

      if (!eventText) {
        showStatus("analyzeStatus", "Please enter an event first.", "error");
        return;
      }

      setLoading("analyzeLoader", true);
      showStatus("analyzeStatus", "Analyzing event...", "info");

      try {
        const data = await request("/analyze-event", {
          method: "POST",
          body: JSON.stringify({ event: eventText })
        });

        $("summaryOutput").textContent = data.summary || "No summary available.";
        renderList($("talkingPointsOutput"), data.talking_points || []);
        renderList($("networkingTipsOutput"), data.networking_tips || []);

        const score = Number(data.confidence_score || 0);
        $("confidenceOutput").textContent = `${score}%`;
        $("confidenceBar").style.width = `${Math.max(0, Math.min(score, 100))}%`;

        showStatus("analyzeStatus", "Event analyzed successfully.", "success");
        loadHistory();
      } catch (error) {
        showStatus("analyzeStatus", error.message || "Failed to analyze event.", "error");
      } finally {
        setLoading("analyzeLoader", false);
      }
    }

    /* -----------------------------
      Topic Generator
    ----------------------------- */
    function initTopicGenerator() {
      $("generateTopicsBtn")?.addEventListener("click", generateTopics);

      $("clearTopicsBtn")?.addEventListener("click", () => {
        $("topicInput").value = "";
        renderTopicCards([]);
        clearStatus("topicsStatus");
      });
    }

    async function generateTopics() {
      const eventName = $("topicInput").value.trim();

      if (!eventName) {
        showStatus("topicsStatus", "Please enter an event name.", "error");
        return;
      }

      setLoading("topicsLoader", true);
      showStatus("topicsStatus", "Generating topics...", "info");

      try {
        const data = await request("/generate-topics", {
          method: "POST",
          body: JSON.stringify({ event: eventName })
        });

        renderTopicCards(data.topics || []);
        showStatus("topicsStatus", "Topics generated successfully.", "success");
      } catch (error) {
        showStatus("topicsStatus", error.message || "Failed to generate topics.", "error");
      } finally {
        setLoading("topicsLoader", false);
      }
    }

    function renderTopicCards(topics) {
      const container = $("topicsOutput");
      if (!container) return;

      container.innerHTML = "";

      if (!topics.length) {
        for (let i = 1; i <= 4; i++) {
          const li = document.createElement("li");
          li.className = "topic-item empty-state";
          li.textContent = `Topic ${i} will appear here.`;
          container.appendChild(li);
        }
        return;
      }

      topics.forEach((topic, index) => {
        const li = document.createElement("li");
        li.className = "topic-item";
        li.innerHTML = `<strong>Topic ${index + 1}</strong><br>${escapeHtml(topic)}`;
        container.appendChild(li);
      });
    }

    /* -----------------------------
      Fact Checker
    ----------------------------- */
    function initFactChecker() {
      $("factCheckBtn")?.addEventListener("click", factCheck);

      $("clearFactBtn")?.addEventListener("click", () => {
        $("factInput").value = "";
        $("factVerified").textContent = "--";
        $("factConfidence").textContent = "--%";
        $("factSource").textContent = "Source will appear here.";
        $("factExplanation").textContent = "Explanation will appear here.";
        $("factStatusBadge").textContent = "Pending";
        $("factStatusBadge").className = "badge neutral";
        clearStatus("factStatus");
      });
    }

    async function factCheck() {
      const statement = $("factInput").value.trim();

      if (!statement) {
        showStatus("factStatus", "Please enter a statement to verify.", "error");
        return;
      }

      setLoading("factLoader", true);
      showStatus("factStatus", "Checking facts...", "info");

      try {
        const data = await request("/fact-check", {
          method: "POST",
          body: JSON.stringify({ statement })
        });

        const verified = Boolean(data.verified);
        $("factVerified").textContent = data.status;
        $("factConfidence").textContent = `${Number(data.confidence || 0)}%`;

        if (data.source) {
          $("factSource").innerHTML = `<a href="${data.source}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.source)}</a>`;
        } else {
          $("factSource").textContent = "No source available.";
        }

        $("factExplanation").textContent = data.explanation || "No explanation available.";

        const badge = $("factStatusBadge");
        badge.textContent = verified ? "Verified" : "Not Verified";
        badge.className = verified ? "badge success" : "badge neutral";

        showStatus("factStatus", "Fact check completed.", "success");
      } catch (error) {
        showStatus("factStatus", error.message || "Fact check failed.", "error");
      } finally {
        setLoading("factLoader", false);
      }
    }

    /* -----------------------------
      History
    ----------------------------- */
    function initHistoryControls() {
      $("historySearchBtn")?.addEventListener("click", () => {
        state.historySearch = $("historySearch").value.trim();
        state.historyPage = 1;
        loadHistory();
      });

      $("historyRefreshBtn")?.addEventListener("click", () => {
        $("historySearch").value = "";
        state.historySearch = "";
        state.historyPage = 1;
        loadHistory();
      });

      $("historyLimit")?.addEventListener("change", (e) => {
        state.historyLimit = Number(e.target.value) || 5;
        state.historyPage = 1;
        loadHistory();
      });

      $("prevPageBtn")?.addEventListener("click", () => {
        if (state.historyPage > 1) {
          state.historyPage -= 1;
          loadHistory();
        }
      });

      $("nextPageBtn")?.addEventListener("click", () => {
        const totalPages = Math.max(1, Math.ceil(state.historyTotal / state.historyLimit));
        if (state.historyPage < totalPages) {
          state.historyPage += 1;
          loadHistory();
        }
      });

      $("historySearch")?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          state.historySearch = $("historySearch").value.trim();
          state.historyPage = 1;
          loadHistory();
        }
      });

      $("historyTableBody")?.addEventListener("click", async (e) => {

    /* ---------- VIEW BUTTON ---------- */

    const viewBtn = e.target.closest(".view-history-btn");

    if (viewBtn) {

        $("modalEvent").textContent =
            viewBtn.dataset.event;

        $("modalSummary").textContent =
            viewBtn.dataset.summary;

        $("modalConfidence").textContent =
            viewBtn.dataset.confidence + "%";

        $("modalDate").textContent =
            viewBtn.dataset.date;

        $("historyModal").classList.remove("hidden");

        return;
    }


    /* ---------- PDF BUTTON ---------- */

const pdfBtn = e.target.closest(".pdf-history-btn");

if (pdfBtn) {

    const id = pdfBtn.dataset.id;

    window.open(
        `${API_BASE_URL}/history/${id}/pdf`,
        "_blank"
    );

    return;
}

    /* ---------- DELETE BUTTON ---------- */

    const btn = e.target.closest(".delete-history-btn");

    if (!btn) return;

    const id = btn.dataset.id;

    if (!id) return;

    const confirmDelete =
        confirm("Delete this history item?");

    if (!confirmDelete) return;

    try {

        btn.disabled = true;

        btn.textContent = "Deleting...";

        await request(`/history/${id}`, {
            method: "DELETE"
        });

        loadHistory();

    } catch (error) {

        alert(error.message || "Delete failed.");

        btn.disabled = false;

        btn.textContent = "Delete";
    }

});
    }

    async function loadHistory() {
      setLoading("historyLoader", true);

      try {
        const params = new URLSearchParams({
          page: String(state.historyPage),
          limit: String(state.historyLimit)
        });

        if (state.historySearch) {
          params.append("search", state.historySearch);
        }

        const data = await request(`/history?${params.toString()}`);

        state.historyTotal = Number(data.total || 0);
        renderHistoryRows(data.results || []);
        updatePaginationInfo();
      } catch (error) {
        renderHistoryError(error.message || "Failed to load history.");
      } finally {
        setLoading("historyLoader", false);
      }
    }
function renderHistoryRows(items) {
    const tbody = $("historyTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!items.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No history available yet.
                </td>
            </tr>
        `;
        return;
    }

    items.forEach((item) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(item.date)}</td>

            <td>${escapeHtml(item.event || "-")}</td>

            <td>${item.confidence_score || 0}%</td>

            <td>

                <button
    class="ghost-btn small-btn view-history-btn"

    data-event="${escapeHtml(item.event)}"

    data-summary="${escapeHtml(item.summary)}"

    data-confidence="${item.confidence_score}"

    data-date="${item.date}">

    View

</button>

<button
    class="ghost-btn small-btn pdf-history-btn"
    data-id="${item.id}">

    PDF

</button>

<button
    class="ghost-btn small-btn delete-history-btn"
    data-id="${item.id}">

    Delete

</button>

            </td>
        `;

        tbody.appendChild(tr);
    });
}

    function renderHistoryError(message) {
      $("historyTableBody").innerHTML = `
        <tr>
          <td colspan="4" class="empty-row">${escapeHtml(message)}</td>
        </tr>
      `;
    }

    function updatePaginationInfo() {
      const totalPages = Math.max(1, Math.ceil(state.historyTotal / state.historyLimit));
      $("historyPagination").textContent = `Page ${state.historyPage} of ${totalPages} • Total ${state.historyTotal}`;

      $("prevPageBtn").disabled = state.historyPage <= 1;
      $("nextPageBtn").disabled = state.historyPage >= totalPages;
    }

    /* -----------------------------
      Feedback
    ----------------------------- */
    function initFeedback() {
      const stars = document.querySelectorAll(".star-btn");

      stars.forEach((star) => {
        star.addEventListener("click", () => {
          const rating = Number(star.dataset.rating);
          state.selectedRating = rating;
          $("feedbackRating").value = String(rating);
          updateStarUI(rating);
        });
      });

      $("submitFeedbackBtn")?.addEventListener("click", submitFeedback);

      $("clearFeedbackBtn")?.addEventListener("click", () => {
        $("feedbackText").value = "";
        $("feedbackRating").value = "0";
        state.selectedRating = 0;
        updateStarUI(0);
        clearStatus("feedbackStatus");
      });
    }

    function updateStarUI(rating) {
      document.querySelectorAll(".star-btn").forEach((star) => {
        const starValue = Number(star.dataset.rating);
        star.classList.toggle("active", starValue <= rating);
      });
    }

    async function submitFeedback() {
      const rating = Number($("feedbackRating").value || 0);
      const message = $("feedbackText").value.trim();

      if (!rating) {
        showStatus("feedbackStatus", "Please select a rating.", "error");
        return;
      }

      if (!message) {
        showStatus("feedbackStatus", "Please enter your feedback.", "error");
        return;
      }

      setLoading("feedbackLoader", true);
      showStatus("feedbackStatus", "Submitting feedback...", "info");

      try {
        const data = await request("/feedback", {
    method: "POST",
    body: JSON.stringify({
        rating: rating,
        feedback: message
    })
});

        showStatus(
          "feedbackStatus",
          data.message || "Feedback submitted successfully.",
          "success"
        );

        $("feedbackText").value = "";
        $("feedbackRating").value = "0";
        state.selectedRating = 0;
        updateStarUI(0);
      } catch (error) {
        showStatus("feedbackStatus", error.message || "Failed to submit feedback.", "error");
      } finally {
        setLoading("feedbackLoader", false);
      }
    }

    /* -----------------------------
      Helpers
    ----------------------------- */
    async function request(endpoint, options = {}) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
        ...options
      });

      let data = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Request failed: ${response.status}`);
      }

      return data;
    }

    function setLoading(loaderId, isLoading) {
      const loader = $(loaderId);
      if (!loader) return;
      loader.classList.toggle("hidden", !isLoading);
    }

    function showStatus(elementId, message, type = "info") {
      const el = $(elementId);
      if (!el) return;
      el.textContent = message;
      el.className = `api-status ${type}`;
      el.classList.remove("hidden");
    }

    function clearStatus(elementId) {
      const el = $(elementId);
      if (!el) return;
      el.textContent = "";
      el.className = "api-status hidden";
    }

    function renderList(container, items) {
      if (!container) return;
      container.innerHTML = "";

      if (!items || !items.length) {
        const li = document.createElement("li");
        li.className = "empty-state";
        li.textContent = "No data available yet.";
        container.appendChild(li);
        return;
      }

      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        container.appendChild(li);
      });
    }

    function formatDate(dateString) {
      if (!dateString) return "-";
      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) return dateString;

      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
const closeModal = $("closeHistoryModal");

closeModal?.addEventListener("click", () => {

    $("historyModal").classList.add("hidden");

});

window.addEventListener("click", (e) => {

    if (e.target.id === "historyModal") {

        $("historyModal").classList.add("hidden");

    }

});