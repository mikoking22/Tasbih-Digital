/* =========================
   ELEMENT SELECTOR
========================= */
const counterEl = document.getElementById("counter");
const btnAdd = document.getElementById("btn-add");
const btnReset = document.getElementById("btn-reset");
const targetSelect = document.getElementById("target");
const progressBar = document.getElementById("progress-bar");

const dzikirSelect = document.getElementById("dzikir-select");
const customDzikirInput = document.getElementById("custom-dzikir");

const totalDzikirEl = document.getElementById("total-dzikir");
const activeDzikirEl = document.getElementById("active-dzikir");

const toggleThemeBtn = document.getElementById("toggle-theme");

/* =========================
   STATE & LOCAL STORAGE
========================= */
let counter = Number(localStorage.getItem("counter")) || 0;
let totalDzikir = Number(localStorage.getItem("totalDzikir")) || 0;
let target = Number(localStorage.getItem("target")) || 33;
let activeDzikir = localStorage.getItem("activeDzikir") || "Subhanallah";

/* =========================
   INIT
========================= */
counterEl.textContent = counter;
totalDzikirEl.textContent = totalDzikir;
targetSelect.value = target;
activeDzikirEl.textContent = activeDzikir;
updateProgress();

/* =========================
   COUNTER LOGIC
========================= */
btnAdd.addEventListener("click", () => {
  counter++;
  totalDzikir++;

  counterEl.textContent = counter;
  totalDzikirEl.textContent = totalDzikir;

  saveData();
  updateProgress();
});

btnReset.addEventListener("click", () => {
  if (confirm("Reset hitungan dzikir?")) {
    counter = 0;
    counterEl.textContent = counter;
    updateProgress();
    saveData();
  }
});

/* =========================
   TARGET
========================= */
targetSelect.addEventListener("change", () => {
  target = Number(targetSelect.value);
  updateProgress();
  saveData();
});

/* =========================
   DZIKIR SELECTION
========================= */
dzikirSelect.addEventListener("change", () => {
  if (dzikirSelect.value === "custom") {
    customDzikirInput.disabled = false;
    customDzikirInput.focus();
  } else {
    customDzikirInput.disabled = true;
    activeDzikir = dzikirSelect.options[dzikirSelect.selectedIndex].text;
    activeDzikirEl.textContent = activeDzikir;
    saveData();
  }
});

customDzikirInput.addEventListener("input", () => {
  activeDzikir = customDzikirInput.value || "Dzikir Bebas";
  activeDzikirEl.textContent = activeDzikir;
  saveData();
});

/* =========================
   PROGRESS BAR
========================= */
function updateProgress() {
  let percent = (counter / target) * 100;
  percent = percent > 100 ? 100 : percent;
  progressBar.style.width = percent + "%";
}

/* =========================
   SAVE DATA
========================= */
function saveData() {
  localStorage.setItem("counter", counter);
  localStorage.setItem("totalDzikir", totalDzikir);
  localStorage.setItem("target", target);
  localStorage.setItem("activeDzikir", activeDzikir);
}

/* =========================
   JAM REALTIME
========================= */
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("id-ID");
  const date = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  document.getElementById("current-time").textContent = time;
  document.getElementById("current-date").textContent = date;
}

setInterval(updateClock, 1000);
updateClock();

/* =========================
   DARK / LIGHT MODE
========================= */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

toggleThemeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");

  const theme = document.body.classList.contains("light-mode")
    ? "light"
    : "dark";

  localStorage.setItem("theme", theme);
}
);
/* =========================
   JADWAL SHOLAT PASURUAN
========================= */
async function getPrayerTimes() {
  try {
    const response = await fetch(
      "https://api.aladhan.com/v1/timingsByCity?city=Pasuruan&country=Indonesia&method=20"
    );

    const data = await response.json();
    const timings = data.data.timings;

    document.getElementById("subuh").textContent = timings.Fajr;
    document.getElementById("dzuhur").textContent = timings.Dhuhr;
    document.getElementById("ashar").textContent = timings.Asr;
    document.getElementById("maghrib").textContent = timings.Maghrib;
    document.getElementById("isya").textContent = timings.Isha;

    highlightCurrentPrayer(timings);
  } catch (error) {
    console.error("Gagal mengambil jadwal sholat:", error);
  }
}

getPrayerTimes();

/* =========================
   HIGHLIGHT SHOLAT AKTIF
========================= */
function highlightCurrentPrayer(timings) {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayerTimes = [
    { name: "subuh", time: timings.Fajr },
    { name: "dzuhur", time: timings.Dhuhr },
    { name: "ashar", time: timings.Asr },
    { name: "maghrib", time: timings.Maghrib },
    { name: "isya", time: timings.Isha },
  ];

  prayerTimes.forEach(prayer => {
    const el = document.getElementById(prayer.name);
    el.parentElement.classList.remove("active-prayer");
  });

  for (let i = 0; i < prayerTimes.length; i++) {
    const [hour, minute] = prayerTimes[i].time.split(":").map(Number);
    const prayerMinute = hour * 60 + minute;

    const nextPrayer = prayerTimes[i + 1]
      ? prayerTimes[i + 1].time.split(":").map(Number)
      : null;

    const nextPrayerMinute = nextPrayer
      ? nextPrayer[0] * 60 + nextPrayer[1]
      : 1440;

    if (currentTime >= prayerMinute && currentTime < nextPrayerMinute) {
      document
        .getElementById(prayerTimes[i].name)
        .parentElement.classList.add("active-prayer");
      break;
    }
  }
}

