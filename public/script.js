const filterTabs = document.querySelectorAll(".filter-tab");
const workList = document.querySelector(".work-list");
const workItems = document.querySelectorAll(".work-item");
const spotlightCard = document.querySelector(".spotlight-card");
const spotlightText = document.querySelector("[data-spotlight-text]");
const spotlightLink = document.querySelector("[data-spotlight-link]");
const spotlightName = document.querySelector("[data-spotlight-name]");

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function parseSpotlightCsv(csvText) {
  const lines = csvText
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  return lines.slice(1).map((line) => {
    const [name, href, image, text] = parseCsvLine(line);

    return {
      name,
      href,
      image,
      text: text.replaceAll("\\n", "\n")
    };
  }).filter((item) => item.name && item.href && item.text);
}

function showDailySpotlight(spotlightItems) {
  if (!spotlightText || !spotlightLink || !spotlightName || spotlightItems.length === 0) {
    return;
  }

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  const spotlight = spotlightItems[dayOfYear % spotlightItems.length];

  spotlightText.textContent = spotlight.text;
  spotlightLink.href = spotlight.href;
  spotlightName.textContent = spotlight.name;

  if (spotlightCard && spotlight.image) {
    spotlightCard.classList.add("has-spotlight-image");
    spotlightCard.style.setProperty("--spotlight-image", `url("${spotlight.image}")`);
  } else if (spotlightCard) {
    spotlightCard.classList.remove("has-spotlight-image");
    spotlightCard.style.removeProperty("--spotlight-image");
  }
}

fetch("spotlight-guides.csv")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load spotlight guides.");
    }

    return response.text();
  })
  .then((csvText) => {
    showDailySpotlight(parseSpotlightCsv(csvText));
  })
  .catch(() => {
    // Keep the static fallback in index.html when the CSV cannot be loaded.
  });

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const activeFilter = tab.dataset.filter;

    workList.classList.add("is-filtering");

    filterTabs.forEach((button) => {
      const isActive = button === tab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    window.setTimeout(() => {
      workItems.forEach((item) => {
        const shouldShow =
          activeFilter === "all" || item.dataset.category === activeFilter;
        item.hidden = !shouldShow;
      });

      window.requestAnimationFrame(() => {
        workList.classList.remove("is-filtering");
      });
    }, 140);
  });
});
