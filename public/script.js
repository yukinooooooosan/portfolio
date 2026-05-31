const filterTabs = document.querySelectorAll(".filter-tab");
const workList = document.querySelector(".work-list");
const workItems = document.querySelectorAll(".work-item");
const spotlightCard = document.querySelector(".spotlight-card");
const spotlightText = document.querySelector("[data-spotlight-text]");
const spotlightLink = document.querySelector("[data-spotlight-link]");
const spotlightName = document.querySelector("[data-spotlight-name]");
const spotlightMascot = document.querySelector(".spotlight-mascot");
const bunnyHalfOverlay = document.querySelector("[data-bunny-half-overlay]");
const bunnyBlinkOverlay = document.querySelector("[data-bunny-blink-overlay]");
const bunnyKissOverlay = document.querySelector("[data-bunny-kiss-overlay]");
const bunnyMotionTimers = [];

function setBunnyMotionTimer(callback, delay) {
  const timerId = window.setTimeout(() => {
    const index = bunnyMotionTimers.indexOf(timerId);

    if (index !== -1) {
      bunnyMotionTimers.splice(index, 1);
    }

    callback();
  }, delay);

  bunnyMotionTimers.push(timerId);
  return timerId;
}

function clearBunnyMotion() {
  bunnyMotionTimers.forEach((timerId) => {
    window.clearTimeout(timerId);
  });
  bunnyMotionTimers.length = 0;
  spotlightMascot.classList.remove("is-half-blinking");
  spotlightMascot.classList.remove("is-blinking");
  spotlightMascot.classList.remove("is-kissing");
  spotlightMascot.classList.remove("is-kiss-releasing");
}

function startBunnyBlink() {
  if (
    !spotlightMascot ||
    !bunnyHalfOverlay ||
    !bunnyBlinkOverlay ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  window.setInterval(() => {
    if (
      spotlightMascot.classList.contains("is-kissing") ||
      spotlightMascot.classList.contains("is-kiss-releasing")
    ) {
      return;
    }

    spotlightMascot.classList.add("is-half-blinking");

    setBunnyMotionTimer(() => {
      if (spotlightMascot.classList.contains("is-kissing")) {
        return;
      }

      spotlightMascot.classList.remove("is-half-blinking");
      spotlightMascot.classList.add("is-blinking");
    }, 70);

    setBunnyMotionTimer(() => {
      if (spotlightMascot.classList.contains("is-kissing")) {
        return;
      }

      spotlightMascot.classList.remove("is-blinking");
      spotlightMascot.classList.add("is-half-blinking");
    }, 160);

    setBunnyMotionTimer(() => {
      spotlightMascot.classList.remove("is-half-blinking");
      spotlightMascot.classList.remove("is-blinking");
    }, 240);
  }, 4200);
}

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

function startBunnyKiss() {
  if (
    !spotlightMascot ||
    !bunnyKissOverlay ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const playKiss = () => {
    clearBunnyMotion();
    spotlightMascot.classList.add("is-kissing");

    setBunnyMotionTimer(() => {
      spotlightMascot.classList.remove("is-kissing");
      spotlightMascot.classList.add("is-kiss-releasing");
    }, 360);

    setBunnyMotionTimer(() => {
      spotlightMascot.classList.remove("is-kiss-releasing");
    }, 1120);
  };

  if (!("IntersectionObserver" in window)) {
    window.setTimeout(playKiss, 2600);
    return;
  }

  let hasPlayedWhileVisible = false;
  let kissDelayTimer = null;

  const observer = new IntersectionObserver((entries) => {
    const isVisible = entries.some((entry) => entry.isIntersecting);

    if (isVisible && !hasPlayedWhileVisible) {
      hasPlayedWhileVisible = true;
      kissDelayTimer = window.setTimeout(() => {
        kissDelayTimer = null;
        playKiss();
      }, 1000);
      return;
    }

    if (!isVisible) {
      hasPlayedWhileVisible = false;
      if (kissDelayTimer) {
        window.clearTimeout(kissDelayTimer);
        kissDelayTimer = null;
      }
      clearBunnyMotion();
    }
  }, {
    threshold: 0.45
  });

  observer.observe(spotlightMascot);
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

startBunnyBlink();
startBunnyKiss();

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
