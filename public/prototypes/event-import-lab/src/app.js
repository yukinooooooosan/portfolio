const sampleEvents = [
  {
    title: "サンプルイベントA",
    date_text: "2026年7月11日（土）",
    time_text: "18:00-22:00",
    place_text: "架空会場A",
    area: "サンプル市",
    price_text: "3000円",
    description: "サンプル用の交流イベントです。実在のイベントではありません。",
    source_tweet_url: "https://x.com/example_event/status/1000000000000000001",
    detail_url: null,
    confidence: 0.86,
    notes: "サンプルデータ"
  },
  {
    title: "サンプルイベントB",
    date_text: "今週土曜",
    time_text: null,
    place_text: "架空会場B",
    area: "サンプル市",
    price_text: null,
    description: "カード表示確認用のサンプルです。詳細URLありの例です。",
    source_tweet_url: "https://x.com/example_event/status/1000000000000000002",
    detail_url: "https://example.com/events/sample",
    confidence: 0.64,
    notes: "時刻が不明"
  }
];

const fields = [
  "title",
  "date_text",
  "time_text",
  "place_text",
  "area",
  "price_text",
  "description",
  "source_tweet_url",
  "detail_url",
  "confidence",
  "notes"
];

const storageKey = "eventImportLab.savedEvents.v1";

const state = {
  events: [],
  savedEvents: loadSavedEvents(),
  view: "import"
};

const els = {
  importText: document.querySelector("#importText"),
  importView: document.querySelector("#importView"),
  savedView: document.querySelector("#savedView"),
  importViewButton: document.querySelector("#importViewButton"),
  savedViewButton: document.querySelector("#savedViewButton"),
  savedCount: document.querySelector("#savedCount"),
  parseButton: document.querySelector("#parseButton"),
  saveAndViewButton: document.querySelector("#saveAndViewButton"),
  sampleButton: document.querySelector("#sampleButton"),
  clearButton: document.querySelector("#clearButton"),
  backToImportButton: document.querySelector("#backToImportButton"),
  clearSavedButton: document.querySelector("#clearSavedButton"),
  copyJsonButton: document.querySelector("#copyJsonButton"),
  downloadCsvButton: document.querySelector("#downloadCsvButton"),
  errorMessage: document.querySelector("#errorMessage"),
  toast: document.querySelector("#toast"),
  summaryGrid: document.querySelector("#summaryGrid"),
  issueList: document.querySelector("#issueList"),
  cardList: document.querySelector("#cardList"),
  savedStats: document.querySelector("#savedStats"),
  savedCardList: document.querySelector("#savedCardList"),
  lastParsed: document.querySelector("#lastParsed")
};

function normalizeEvent(item, index) {
  const normalized = {};
  for (const field of fields) {
    normalized[field] = item?.[field] ?? null;
  }
  normalized.id = item?.id ?? `draft_${String(index + 1).padStart(3, "0")}`;
  normalized.title = cleanString(normalized.title);
  normalized.date_text = cleanString(normalized.date_text);
  normalized.time_text = cleanString(normalized.time_text);
  normalized.place_text = cleanString(normalized.place_text);
  normalized.area = cleanString(normalized.area);
  normalized.price_text = cleanString(normalized.price_text);
  normalized.description = cleanString(normalized.description);
  normalized.source_tweet_url = cleanString(normalized.source_tweet_url);
  normalized.detail_url = cleanString(normalized.detail_url);
  normalized.notes = cleanString(normalized.notes);
  normalized.confidence = normalizeConfidence(normalized.confidence);
  normalized.saved_at = item?.saved_at ?? null;
  normalized.duplicate_key = item?.duplicate_key ?? buildDuplicateKey(normalized);
  normalized.issues = validateEvent(normalized);
  return normalized;
}

function cleanString(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeConfidence(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (number > 1) return Math.min(number / 100, 1);
  return Math.max(0, Math.min(number, 1));
}

function validateEvent(event) {
  const issues = [];
  if (!event.title) issues.push("タイトルなし");
  if (!event.date_text) issues.push("日付なし");
  if (!event.place_text) issues.push("場所なし");
  if (!event.source_tweet_url) issues.push("元ツイートURLなし");
  if (event.source_tweet_url && !isProbablyUrl(event.source_tweet_url)) {
    issues.push("元ツイートURLがURL形式ではない");
  }
  if (event.source_tweet_url && !isXUrl(event.source_tweet_url)) {
    issues.push("元ツイートURLがx.com/twitter.comではない");
  }
  if (event.detail_url && !isProbablyUrl(event.detail_url)) {
    issues.push("詳細URLがURL形式ではない");
  }
  if (event.confidence !== null && event.confidence < 0.65) {
    issues.push("信頼度低め");
  }
  if (event.description && event.description.length > 180) {
    issues.push("説明文が長め");
  }
  return issues;
}

function isProbablyUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isXUrl(value) {
  try {
    const hostname = new URL(value).hostname.replace(/^www\./, "");
    return hostname === "x.com" || hostname === "twitter.com";
  } catch {
    return false;
  }
}

function hasStatusUrl(value) {
  try {
    const url = new URL(value);
    return isXUrl(value) && /\/status\/\d+/.test(url.pathname);
  } catch {
    return false;
  }
}

function canonicalSourceUrl(value) {
  if (!value || !isProbablyUrl(value)) return null;
  const url = new URL(value);
  const statusMatch = url.pathname.match(/\/status\/\d+/);
  if (!statusMatch) return url.origin + url.pathname.replace(/\/$/, "");
  const account = url.pathname.split("/").filter(Boolean)[0] || "";
  return `${url.origin}/${account}${statusMatch[0]}`;
}

function buildDuplicateKey(event) {
  const source = canonicalSourceUrl(event.source_tweet_url);
  if (source && hasStatusUrl(source)) return `source:${normalizeToken(source)}`;

  const detail = event.detail_url && isProbablyUrl(event.detail_url) ? canonicalSourceUrl(event.detail_url) : null;
  if (detail && event.date_text) return `detail:${normalizeToken(detail)}:${normalizeToken(event.date_text)}`;

  return `event:${normalizeToken(event.title)}:${normalizeToken(event.date_text)}:${normalizeToken(event.place_text)}`;
}

function normalizeToken(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-]/g, "");
}

function parseInput(rawText) {
  const text = rawText.trim();
  if (!text) {
    throw new Error("貼り付け欄が空です。GrokのJSON配列を貼ってください。");
  }

  const candidates = [
    text,
    stripCodeFence(text),
    extractJsonArray(text)
  ].filter(Boolean);

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (!Array.isArray(parsed)) {
        throw new Error("JSONは読めましたが、配列ではありません。");
      }
      return parsed.map(normalizeEvent);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `JSONとして読めませんでした。Grok出力がJSON配列だけになっているか確認してください。${
      lastError?.message ? ` (${lastError.message})` : ""
    }`
  );
}

function stripCodeFence(text) {
  const match = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() ?? null;
}

function extractJsonArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1).trim();
}

function render() {
  renderView();
  renderSummary();
  renderIssues();
  renderCards();
  renderSavedCards();
  renderSavedStats();
  const hasEvents = state.events.length > 0;
  els.saveAndViewButton.disabled = !hasEvents;
  els.copyJsonButton.disabled = !hasEvents;
  els.downloadCsvButton.disabled = !hasEvents;
  els.clearSavedButton.disabled = state.savedEvents.length === 0;
  els.savedCount.textContent = String(state.savedEvents.length);
}

function renderView() {
  const isImport = state.view === "import";
  els.importView.hidden = !isImport;
  els.savedView.hidden = isImport;
  els.importViewButton.classList.toggle("is-active", isImport);
  els.savedViewButton.classList.toggle("is-active", !isImport);
}

function renderSummary() {
  const total = state.events.length;
  const missingSource = state.events.filter((event) => !event.source_tweet_url).length;
  const missingDate = state.events.filter((event) => !event.date_text).length;
  const missingPlace = state.events.filter((event) => !event.place_text).length;

  els.summaryGrid.innerHTML = `
    ${summaryTile(total, "総件数")}
    ${summaryTile(missingSource, "URLなし", missingSource > 0)}
    ${summaryTile(missingDate, "日付なし", missingDate > 0)}
    ${summaryTile(missingPlace, "場所なし", missingPlace > 0)}
  `;
}

function summaryTile(value, label, warn = false) {
  return `
    <article class="summary-tile ${warn ? "warn" : ""}">
      <span class="summary-value">${value}</span>
      <span class="summary-label">${escapeHtml(label)}</span>
    </article>
  `;
}

function renderIssues() {
  const issueRows = state.events.flatMap((event, index) =>
    event.issues.map((issue) => ({
      label: event.title || `候補 ${index + 1}`,
      issue
    }))
  );

  if (issueRows.length === 0) {
    els.issueList.innerHTML = "";
    return;
  }

  els.issueList.innerHTML = issueRows
    .map(
      (row) => `
        <div class="issue-item">
          <strong>${escapeHtml(row.label)}</strong>: ${escapeHtml(row.issue)}
        </div>
      `
    )
    .join("");
}

function renderCards() {
  if (state.events.length === 0) {
    els.cardList.innerHTML = `
      <div class="empty-state">
        <p>GrokのJSON配列を貼って「カード化」を押すと、ここにプレビューが出ます。</p>
      </div>
    `;
    return;
  }

  els.cardList.innerHTML = state.events.map(renderCard).join("");
}

function renderSavedCards() {
  if (state.savedEvents.length === 0) {
    els.savedCardList.innerHTML = `
      <div class="empty-state">
        <p>まだ保存済みカードはありません。</p>
      </div>
    `;
    return;
  }

  els.savedCardList.innerHTML = state.savedEvents.map(renderCard).join("");
}

function renderSavedStats() {
  const total = state.savedEvents.length;
  const areas = new Set(state.savedEvents.map((event) => event.area).filter(Boolean));
  const missingDate = state.savedEvents.filter((event) => !event.date_text).length;
  const missingPlace = state.savedEvents.filter((event) => !event.place_text).length;

  els.savedStats.innerHTML = `
    ${statPill(total, "保存済み")}
    ${statPill(areas.size, "エリア")}
    ${statPill(missingDate, "日付なし")}
    ${statPill(missingPlace, "場所なし")}
  `;
}

function statPill(value, label) {
  return `<span class="stat-pill"><strong>${value}</strong>${escapeHtml(label)}</span>`;
}

function renderCard(event) {
  const issues = Array.isArray(event.issues) ? event.issues : validateEvent(event);
  const confidenceLabel =
    event.confidence === null ? "信頼度不明" : `信頼度 ${Math.round(event.confidence * 100)}%`;
  const title = event.title || "タイトル未入力";
  const description = event.description || "説明文なし。元ツイートで確認してください。";

  return `
    <article class="event-card ${issues.length > 0 ? "has-warning" : ""}">
      <div class="badge-row">
        ${badge(event.date_text || "日付なし", "primary")}
        ${badge(event.area || "エリア未設定")}
        ${badge(confidenceLabel, event.confidence !== null && event.confidence < 0.65 ? "warn" : "")}
      </div>
      <h3 class="event-title">${escapeHtml(title)}</h3>
      <div class="event-meta">
        <p><span>場所:</span> ${escapeHtml(event.place_text || "未設定")}</p>
        <p><span>時間:</span> ${escapeHtml(event.time_text || "未設定")}</p>
        <p><span>料金:</span> ${escapeHtml(event.price_text || "未設定")}</p>
      </div>
      <p class="event-description">${escapeHtml(description)}</p>
      <div class="card-links">
        ${event.source_tweet_url ? link(event.source_tweet_url, "元ツイートを見る") : ""}
        ${event.detail_url ? link(event.detail_url, "詳細を見る") : ""}
      </div>
      ${
        issues.length > 0 || event.notes
          ? `<p class="notes">${escapeHtml([...issues, event.notes].filter(Boolean).join(" / "))}</p>`
          : ""
      }
    </article>
  `;
}

function badge(label, variant = "") {
  return `<span class="badge ${variant}">${escapeHtml(label)}</span>`;
}

function link(url, label) {
  return `<a href="${escapeAttribute(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function copyJson() {
  const text = JSON.stringify(state.events.map(stripRuntimeFields), null, 2);
  navigator.clipboard.writeText(text).catch(() => {
    els.importText.value = text;
    els.importText.select();
  });
}

function stripRuntimeFields(event) {
  const clean = {};
  for (const field of ["id", ...fields, "saved_at", "duplicate_key"]) {
    clean[field] = event[field] ?? null;
  }
  return clean;
}

function saveCurrentEventsAndView() {
  const existingKeys = new Set(state.savedEvents.map((event) => event.duplicate_key || buildDuplicateKey(event)));
  const batchKeys = new Set();
  const additions = [];
  let duplicateCount = 0;

  for (const event of state.events) {
    const duplicateKey = event.duplicate_key || buildDuplicateKey(event);
    if (existingKeys.has(duplicateKey) || batchKeys.has(duplicateKey)) {
      duplicateCount += 1;
      continue;
    }
    batchKeys.add(duplicateKey);
    additions.push({
      ...stripRuntimeFields(event),
      id: createSavedId(event, state.savedEvents.length + additions.length),
      duplicate_key: duplicateKey,
      issues: event.issues,
      saved_at: new Date().toISOString()
    });
  }

  state.savedEvents = [...additions, ...state.savedEvents];
  persistSavedEvents();
  state.view = "saved";
  showToast(`${additions.length}件保存されました。${duplicateCount}件重複としてスキップしました。`);
  render();
}

function createSavedId(event, index) {
  const base = normalizeToken(event.duplicate_key || buildDuplicateKey(event)).slice(0, 28);
  return `saved_${base || "event"}_${index + 1}`;
}

function loadSavedEvents() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEvent);
  } catch {
    return [];
  }
}

function persistSavedEvents() {
  localStorage.setItem(storageKey, JSON.stringify(state.savedEvents.map(stripRuntimeFields)));
}

function clearSavedEvents() {
  state.savedEvents = [];
  localStorage.removeItem(storageKey);
  showToast("保存済みカードをクリアしました。");
  render();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 4200);
}

function downloadCsv() {
  const rows = [fields, ...state.events.map((event) => fields.map((field) => event[field] ?? ""))];
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "event-candidates.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function showError(message) {
  els.errorMessage.textContent = message;
  els.errorMessage.hidden = false;
}

function hideError() {
  els.errorMessage.textContent = "";
  els.errorMessage.hidden = true;
}

els.parseButton.addEventListener("click", () => {
  hideError();
  try {
    state.events = parseInput(els.importText.value);
    els.lastParsed.textContent = `${new Date().toLocaleTimeString("ja-JP")} にパース`;
    render();
  } catch (error) {
    state.events = [];
    els.lastParsed.textContent = "未パース";
    render();
    showError(error.message);
  }
});

els.saveAndViewButton.addEventListener("click", saveCurrentEventsAndView);

els.sampleButton.addEventListener("click", () => {
  els.importText.value = JSON.stringify(sampleEvents, null, 2);
  hideError();
});

els.clearButton.addEventListener("click", () => {
  els.importText.value = "";
  state.events = [];
  els.lastParsed.textContent = "未パース";
  hideError();
  render();
});

els.importViewButton.addEventListener("click", () => {
  state.view = "import";
  render();
});

els.savedViewButton.addEventListener("click", () => {
  state.view = "saved";
  render();
});

els.backToImportButton.addEventListener("click", () => {
  state.view = "import";
  render();
});

els.clearSavedButton.addEventListener("click", clearSavedEvents);

els.copyJsonButton.addEventListener("click", copyJson);
els.downloadCsvButton.addEventListener("click", downloadCsv);

render();
