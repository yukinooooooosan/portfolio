const filterTabs = document.querySelectorAll(".filter-tab");
const workList = document.querySelector(".work-list");
const workItems = document.querySelectorAll(".work-item");

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
