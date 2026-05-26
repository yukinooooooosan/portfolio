const filterTabs = document.querySelectorAll(".filter-tab");
const workList = document.querySelector(".work-list");
const workItems = document.querySelectorAll(".work-item");
const spotlightItems = [
  {
    name: "創作キャラバトン",
    href: "https://chara-baton.yukinooooooosan.cc/",
    text: "物語と物語がすれ違ったときに、思いがけない会話が生まれる場所を作りたくて作りました。"
  },
  {
    name: "夜のまわしスマホ",
    href: "https://nomi-party.yukinooooooosan.cc/",
    text: "一台のスマホを回しているうちに、少しだけ距離が近くなる感じを作りたくて作りました。"
  },
  {
    name: "オオカミ工場",
    href: "https://yukinooooooosan.github.io/wolffac/",
    text: "疑うことと働くことが同じ場所にあると、ちょっと変な緊張感が出るなと思って作りました。"
  },
  {
    name: "Mojimoji",
    href: "https://mojimoji.yukinooooooosan.cc/",
    text: "英語を正しく打つだけの時間に、少しだけゲームの手触りを混ぜたくて作りました。"
  },
  {
    name: "Font Preview",
    href: "https://font-preview.yukinooooooosan.cc/",
    text: "書体を選ぶ前の、ちょっとした迷いをその場で試せるようにしたくて作りました。"
  }
];

const spotlightText = document.querySelector("[data-spotlight-text]");
const spotlightLink = document.querySelector("[data-spotlight-link]");
const spotlightName = document.querySelector("[data-spotlight-name]");

if (spotlightText && spotlightLink && spotlightName && spotlightItems.length > 0) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / 86400000);
  const spotlight = spotlightItems[dayOfYear % spotlightItems.length];

  spotlightText.textContent = spotlight.text;
  spotlightLink.href = spotlight.href;
  spotlightName.textContent = spotlight.name;
}

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
