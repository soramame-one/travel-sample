const trips = {
  hakone: {
    title: "箱根で温泉と森の休日",
    duration: "神奈川県 · 1泊2日",
    price: 28000,
    style: "nature",
    keywords: "箱根 温泉 森 自然 リラックス 癒やし",
    photo: "photo-hakone"
  },
  kanazawa: {
    title: "金沢で、伝統と美食めぐり",
    duration: "石川県 · 2泊3日",
    price: 42000,
    style: "culture",
    keywords: "金沢 伝統 美食 文化 街歩き 庭園 茶屋街",
    photo: "photo-kanazawa"
  },
  okinawa: {
    title: "沖縄の海でリフレッシュ",
    duration: "沖縄県 · 3泊4日",
    price: 68000,
    style: "resort",
    keywords: "沖縄 海 リゾート ビーチ 砂浜 島",
    photo: "photo-okinawa"
  }
};

const yen = amount => new Intl.NumberFormat("ja-JP", {
  style: "currency", currency: "JPY", maximumFractionDigits: 0
}).format(amount);

// トップページ：キーワードと旅のスタイルで旅行先を絞り込む
const searchForm = document.querySelector("#search-form");
if (searchForm) {
  const keywordInput = document.querySelector("#keyword");
  const styleFilter = document.querySelector("#style-filter");
  const cards = [...document.querySelectorAll(".trip-card")];
  const status = document.querySelector("#search-status");
  const noResults = document.querySelector("#no-results");

  function filterTrips(event) {
    if (event) event.preventDefault();
    const keyword = keywordInput.value.trim().toLowerCase();
    const style = styleFilter.value;
    let visibleCount = 0;

    cards.forEach(card => {
      const link = card.querySelector('a[href*="trip="]');
      const tripId = new URL(link.href).searchParams.get("trip");
      const trip = trips[tripId];
      const text = `${trip.title} ${trip.duration} ${trip.keywords}`.toLowerCase();
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesStyle = style === "all" || trip.style === style;
      const visible = matchesKeyword && matchesStyle;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });

    status.textContent = `${visibleCount}件の旅行先が見つかりました。`;
    noResults.hidden = visibleCount !== 0;
  }

  searchForm.addEventListener("submit", filterTrips);
  styleFilter.addEventListener("change", filterTrips);
}

// 申込ページ：URLの ?trip=hakone などから旅行先を初期選択
const applicationForm = document.querySelector("#application-form");
if (applicationForm) {
  const tripSelect = document.querySelector("#trip");
  const peopleSelect = document.querySelector("#people");
  const departureInput = document.querySelector("#departure");
  const summaryTitle = document.querySelector("#summary-title");
  const summaryDuration = document.querySelector("#summary-duration");
  const summaryPrice = document.querySelector("#summary-price");
  const summaryPhoto = document.querySelector("#summary-photo");
  const confirmation = document.querySelector("#confirmation");
  const confirmationDetails = document.querySelector("#confirmation-details");
  const editButton = document.querySelector("#edit-button");

  // 今日より前の日付を選べないようにする
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
  departureInput.min = localToday;

  const params = new URLSearchParams(window.location.search);
  if (trips[params.get("trip")]) tripSelect.value = params.get("trip");

  function updateSummary() {
    const trip = trips[tripSelect.value];
    if (!trip) {
      summaryTitle.textContent = "旅行先を選択してください";
      summaryDuration.textContent = "旅行先を選ぶと詳細が表示されます。";
      summaryPrice.textContent = "—";
      summaryPhoto.className = "summary-photo photo-hakone";
      return;
    }
    summaryTitle.textContent = trip.title;
    summaryDuration.textContent = trip.duration;
    summaryPrice.textContent = yen(trip.price);
    summaryPhoto.className = `summary-photo ${trip.photo}`;
  }
  tripSelect.addEventListener("change", updateSummary);
  peopleSelect.addEventListener("change", updateSummary);
  updateSummary();

  applicationForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!applicationForm.reportValidity()) return;

    const trip = trips[tripSelect.value];
    const people = Number(peopleSelect.value);
    const departure = departureInput.value;
    const name = document.querySelector("#fullname").value.trim();
    const email = document.querySelector("#email").value.trim();
    const notes = document.querySelector("#notes").value.trim();

    confirmationDetails.replaceChildren();
    const lines = [
      ["お名前", name],
      ["メールアドレス", email],
      ["旅行先", trip.title],
      ["出発希望日", departure],
      ["人数", `${people}名`],
      ["参考合計金額", yen(trip.price * people)],
      ["ご要望", notes || "なし"]
    ];
    lines.forEach(([label, value]) => {
      const row = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = `${label}：`;
      row.append(strong, document.createTextNode(value));
      confirmationDetails.append(row);
    });

    confirmation.hidden = false;
    confirmation.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  editButton.addEventListener("click", () => {
    confirmation.hidden = true;
    applicationForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
