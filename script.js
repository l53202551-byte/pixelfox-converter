const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "pixelfox-lang";
const SYNC_TAG = "pixelfox-convert-queue";
const QUEUE_DB_NAME = "pixelfox-db";
const QUEUE_STORE = "convertQueue";

const state = {
  status: "idle",
  jobs: [],
  file: null,
  dataUrl: null,
  image: null,
  outputUrl: null,
  outputSize: 0,
  progress: 0,
  progressTimer: null,
  lang: DEFAULT_LANG,
  installPromptEvent: null,
  queueProcessing: false,
};

const elements = {
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("fileInput"),
  fileName: document.getElementById("fileName"),
  fileMeta: document.getElementById("fileMeta"),
  qualityRange: document.getElementById("qualityRange"),
  qualityValue: document.getElementById("qualityValue"),
  qualityHint: document.getElementById("qualityHint"),
  presetBtns: document.querySelectorAll(".preset-btn"),
  bgSelect: document.getElementById("bgSelect"),
  convertBtn: document.getElementById("convertBtn"),
  resetBtn: document.getElementById("resetBtn"),
  downloadLink: document.getElementById("downloadLink"),
  actions: document.querySelector(".actions"),
  preview: document.getElementById("preview"),
  queuePanel: document.getElementById("queuePanel"),
  queueList: document.getElementById("queueList"),
  fileInfo: document.getElementById("fileInfo"),
  fileSkeleton: document.getElementById("fileSkeleton"),
  resultStats: document.getElementById("resultStats"),
  status: document.getElementById("status"),
  stateNote: document.getElementById("stateNote"),
  progress: document.getElementById("progress"),
  progressBar: document.getElementById("progressBar"),
  error: document.getElementById("error"),
  offlineBadge: document.getElementById("offlineBadge"),
  installBtn: document.getElementById("installBtn"),
  themeToggle: document.getElementById("themeToggle"),
  languageSelect: document.getElementById("languageSelect"),
  languageFlag: document.getElementById("languageFlag"),
  upgradeBtn: document.getElementById("upgradeBtn"),
};

const translations = {
  en: {
    flag: "\uD83C\uDDEC\uD83C\uDDE7",
    pageTitle: "PixelFox Converter - PNG to JPG in Browser",
    brandSubtitle: "Fast, private file conversion",
    navConvert: "Convert",
    navTools: "Tools",
    navPrivacy: "Privacy",
    upgrade: "Upgrade",
    installApp: "Install PixelFox",
    heroTitle: "Convert files instantly. Right in your browser.",
    heroSubtitle: "No uploads. No tracking. No waiting.",
    converterTitle: "PNG to JPG",
    converterSubtitle: "Local processing, no server involved.",
    dropzoneTitle: "Drop your PNG file here",
    dropzoneMeta: "Click to browse. Up to 10 MB.",
    noFile: "No file selected",
    filePlaceholder: "File size and format will appear here",
    qualityLabel: "Quality",
    presetFast: "⚡ Fast",
    presetBalanced: "⭐ Balanced",
    presetMax: "💎 Max",
    queueTitle: "Queue",
    queueReady: "Ready",
    queueQueued: "Queued",
    queueConverting: "Converting",
    queueDone: "Done",
    queueError: "Error",
    qualityHintSmall: "70% - smaller file",
    qualityHintBalanced: "85% - balanced ⭐",
    qualityHintMax: "95% - max quality",
    backgroundLabel: "Background",
    bgWhite: "White (recommended)",
    bgBlack: "Black",
    bgHint: "Transparency becomes solid background.",
    convertBtn: "Convert to JPG",
    resetBtn: "Convert another",
    downloadBtn: "Download JPG",
    downloadAllBtn: "Download all JPG",
    filesSelected: "files selected",
    totalLabel: "total",
    statsPng: "PNG",
    statsJpg: "JPG",
    statsSaved: "Saved",
    offlineMode: "📴 Offline mode",
    sectionPrivacyTitle: "Your files stay yours",
    sectionPrivacySubtitle: "Everything runs locally inside your browser. When the tab closes, it is gone.",
    pill1: "\uD83D\uDD12 Files never leave your device",
    pill2: "\uD83E\uDDE0 No analytics or tracking",
    pill3: "\u26A1 Instant processing",
    sectionAboutTitle: "About PixelFox Studio",
    sectionAboutSubtitle: "We build focused tools that feel premium and respect your time.",
    originTitle: "Origin",
    originText: "PixelFox started from a need: conversion tools that do not hijack your data.",
    philosophyTitle: "Philosophy",
    philosophyText: "Design that breathes, software that feels reliable, privacy by default.",
    momentumTitle: "Momentum",
    momentumText: "We scale from a single converter to a focused suite of local tools.",
    sectionUpgradeTitle: "Upgrade plans (soon)",
    sectionUpgradeSubtitle: "Built to grow without sacrificing speed or privacy.",
    freePlanTitle: "Free",
    proPlanTitle: "Pro",
    freePlanCurrent: "Current",
    proPlanNotify: "Notify me",
    footerPrivacy: "Privacy",
    footerContact: "Contact",
    fileAria: "Upload PNG file",
    previewAlt: "PNG preview",
    errors: {
      selectPng: "Please select a PNG file.",
      onlyPng: "Only PNG files are supported.",
      tooLarge: "File is larger than 10 MB.",
      readFail: "Could not read the file.",
      unsupported: "The file appears to be corrupted or unsupported.",
      createFail: "Could not create JPG output.",
    },
    status: {
      idle: {
        label: "Idle",
        note: "Waiting for a PNG file.",
        className: "",
        showProgress: false,
      },
      loading: {
        label: "Reading file...",
        note: "Preparing image data.",
        className: "loading",
        showProgress: false,
      },
      ready: {
        label: "Ready",
        note: "Choose settings and convert.",
        className: "",
        showProgress: false,
      },
      converting: {
        label: "Converting...",
        note: "Rendering JPG output.",
        className: "loading",
        showProgress: true,
      },
      queued: {
        label: "Queued",
        note: "Will convert automatically when connection is back.",
        className: "warning",
        showProgress: false,
      },
      done: {
        label: "Done",
        note: "Your file is ready to download.",
        className: "success",
        showProgress: true,
      },
      error: {
        label: "Error",
        note: "Please check the file and try again.",
        className: "error",
        showProgress: false,
      },
    },
  },
  ru: {
    flag: "\uD83C\uDDF7\uD83C\uDDFA",
    pageTitle: "PixelFox Converter - PNG в JPG в браузере",
    brandSubtitle: "Быстрая и приватная конвертация файлов",
    navConvert: "Конвертер",
    navTools: "Инструменты",
    navPrivacy: "Приватность",
    upgrade: "Премиум",
    installApp: "Установить PixelFox",
    heroTitle: "Мгновенно конвертируйте файлы прямо в браузере.",
    heroSubtitle: "Без загрузок. Без трекинга. Без ожидания.",
    converterTitle: "PNG в JPG",
    converterSubtitle: "Локальная обработка без сервера.",
    dropzoneTitle: "Перетащите PNG-файл сюда",
    dropzoneMeta: "Или нажмите для выбора. До 10 МБ.",
    noFile: "Файл не выбран",
    filePlaceholder: "Здесь появятся размер и формат файла",
    qualityLabel: "Качество",
    presetFast: "⚡ Быстро",
    presetBalanced: "⭐ Баланс",
    presetMax: "💎 Максимум",
    queueTitle: "Очередь",
    queueReady: "Готово",
    queueQueued: "В очереди",
    queueConverting: "Конвертация",
    queueDone: "Готово",
    queueError: "Ошибка",
    qualityHintSmall: "70% - меньший размер",
    qualityHintBalanced: "85% - баланс ⭐",
    qualityHintMax: "95% - максимум качества",
    backgroundLabel: "Фон",
    bgWhite: "Белый (рекомендуется)",
    bgBlack: "Черный",
    bgHint: "Прозрачность заменяется сплошным фоном.",
    convertBtn: "Конвертировать в JPG",
    resetBtn: "Конвертировать еще",
    downloadBtn: "Скачать JPG",
    downloadAllBtn: "Скачать все JPG",
    filesSelected: "файлов выбрано",
    totalLabel: "всего",
    statsPng: "PNG",
    statsJpg: "JPG",
    statsSaved: "Сжато",
    offlineMode: "📴 Оффлайн режим",
    sectionPrivacyTitle: "Ваши файлы остаются вашими",
    sectionPrivacySubtitle: "Все работает локально в браузере. Закрыли вкладку - данные исчезли.",
    pill1: "\uD83D\uDD12 Файлы не покидают ваше устройство",
    pill2: "\uD83E\uDDE0 Без аналитики и трекинга",
    pill3: "\u26A1 Мгновенная обработка",
    sectionAboutTitle: "О PixelFox Studio",
    sectionAboutSubtitle: "Мы делаем точечные инструменты с премиальным ощущением и уважением к вашему времени.",
    originTitle: "Истоки",
    originText: "PixelFox появился из потребности в конвертерах, которые не забирают ваши данные.",
    philosophyTitle: "Философия",
    philosophyText: "Дышащий дизайн, надежный софт и приватность по умолчанию.",
    momentumTitle: "Развитие",
    momentumText: "Мы растем от одного конвертера к полноценному набору локальных инструментов.",
    sectionUpgradeTitle: "Тарифы (скоро)",
    sectionUpgradeSubtitle: "Развитие без компромиссов по скорости и приватности.",
    freePlanTitle: "Бесплатный",
    proPlanTitle: "Про",
    freePlanCurrent: "Текущий",
    proPlanNotify: "Сообщить мне",
    footerPrivacy: "Приватность",
    footerContact: "Контакты",
    fileAria: "Загрузить PNG-файл",
    previewAlt: "Превью PNG",
    errors: {
      selectPng: "Выберите PNG-файл.",
      onlyPng: "Поддерживаются только PNG-файлы.",
      tooLarge: "Файл больше 10 МБ.",
      readFail: "Не удалось прочитать файл.",
      unsupported: "Файл поврежден или не поддерживается.",
      createFail: "Не удалось создать JPG-файл.",
    },
    status: {
      idle: {
        label: "Ожидание",
        note: "Ожидается PNG-файл.",
        className: "",
        showProgress: false,
      },
      loading: {
        label: "Чтение файла...",
        note: "Подготовка данных изображения.",
        className: "loading",
        showProgress: false,
      },
      ready: {
        label: "Готово",
        note: "Выберите настройки и конвертируйте.",
        className: "",
        showProgress: false,
      },
      converting: {
        label: "Конвертация...",
        note: "Рендеринг JPG-файла.",
        className: "loading",
        showProgress: true,
      },
      queued: {
        label: "В очереди",
        note: "Конвертация автоматически запустится при появлении сети.",
        className: "warning",
        showProgress: false,
      },
      done: {
        label: "Готово",
        note: "Файл готов к скачиванию.",
        className: "success",
        showProgress: true,
      },
      error: {
        label: "Ошибка",
        note: "Проверьте файл и попробуйте снова.",
        className: "error",
        showProgress: false,
      },
    },
  },
};

function currentCopy() {
  return translations[state.lang] || translations.en;
}

function setProgress(value) {
  state.progress = Math.max(0, Math.min(100, value));
  elements.progressBar.style.width = `${state.progress}%`;
  elements.progressBar.classList.toggle("done-glow", state.progress >= 100);
}

function stopProgress() {
  if (state.progressTimer) {
    clearInterval(state.progressTimer);
    state.progressTimer = null;
  }
}

function startProgress() {
  stopProgress();
  setProgress(8);
  state.progressTimer = setInterval(() => {
    if (state.progress >= 90) return;
    const remaining = 90 - state.progress;
    const step = Math.max(0.6, remaining * 0.12);
    setProgress(state.progress + step);
  }, 220);
}

function setState(next) {
  Object.assign(state, next);
  const statusCopy = currentCopy().status;
  const config = statusCopy[state.status] || statusCopy.idle;

  elements.status.textContent = config.label;
  elements.stateNote.textContent = config.note;
  elements.status.className = `state ${config.className}`.trim();

  const hasReadyJobs = state.jobs.some((job) => job.status === "ready");
  const isReady = state.status === "ready";
  const isDone = state.status === "done";
  const isLoading = state.status === "loading";
  const isConverting = state.status === "converting";

  elements.convertBtn.disabled = !hasReadyJobs || isConverting;
  elements.convertBtn.hidden = isDone;
  elements.resetBtn.hidden = !isDone;
  elements.resetBtn.disabled = !isDone;
  elements.actions.classList.toggle("done", isDone);
  elements.fileInfo.hidden = isLoading;
  elements.fileSkeleton.hidden = !isLoading;

  elements.progress.hidden = !config.showProgress;

  if (state.status === "converting") {
    startProgress();
  } else if (state.status === "done") {
    stopProgress();
    setProgress(100);
  } else {
    stopProgress();
    setProgress(0);
  }

  if (!isDone) {
    elements.downloadLink.hidden = true;
    elements.resultStats.hidden = true;
  }

  renderQueue();
}

function showError(message) {
  elements.error.hidden = false;
  elements.error.textContent = message;
  elements.preview.hidden = true;
  elements.preview.classList.remove("skeleton", "reveal");
  elements.preview.removeAttribute("src");
  elements.resultStats.hidden = true;
  elements.resultStats.textContent = "";
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
  }
  elements.downloadLink.hidden = true;
  elements.downloadLink.removeAttribute("href");
  elements.downloadLink.removeAttribute("download");
  state.file = null;
  state.jobs = [];
  state.dataUrl = null;
  state.image = null;
  state.outputUrl = null;
  state.outputSize = 0;
  elements.queuePanel.hidden = true;
  elements.queueList.innerHTML = "";
  updateFileSummary();
  setState({ status: "idle" });
}

function clearError() {
  elements.error.hidden = true;
  elements.error.textContent = "";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function renderResultStats() {
  const doneJobs = state.jobs.filter((job) => job.outputSize > 0);
  if (doneJobs.length > 0) {
    const copy = currentCopy();
    const totalInput = doneJobs.reduce((sum, job) => sum + job.file.size, 0);
    const totalOutput = doneJobs.reduce((sum, job) => sum + job.outputSize, 0);
    const saved = totalInput > 0
      ? Math.max(0, Math.round((1 - totalOutput / totalInput) * 100))
      : 0;
    elements.resultStats.textContent = `${copy.statsPng}: ${formatBytes(totalInput)} | ${copy.statsJpg}: ${formatBytes(totalOutput)} | ${copy.statsSaved}: ${saved}%`;
    return;
  }

  if (!state.file || !state.outputSize) return;
  const copy = currentCopy();
  const saved = state.file.size > 0
    ? Math.max(0, Math.round((1 - state.outputSize / state.file.size) * 100))
    : 0;
  elements.resultStats.textContent = `${copy.statsPng}: ${formatBytes(state.file.size)} | ${copy.statsJpg}: ${formatBytes(state.outputSize)} | ${copy.statsSaved}: ${saved}%`;
}

function queueStatusLabel(status) {
  const copy = currentCopy();
  if (status === "ready") return copy.queueReady;
  if (status === "queued") return copy.queueQueued;
  if (status === "loading") return copy.queueQueued;
  if (status === "converting") return copy.queueConverting;
  if (status === "done") return copy.queueDone;
  return copy.queueError;
}

function renderQueue() {
  if (!state.jobs.length) {
    elements.queuePanel.hidden = true;
    elements.queueList.innerHTML = "";
    return;
  }

  elements.queuePanel.hidden = false;
  elements.queueList.innerHTML = state.jobs
    .map((job) => `<div class="queue-item"><span>${job.file.name}</span><span class="status">${queueStatusLabel(job.status)}</span></div>`)
    .join("");
}

function updateFileSummary() {
  if (!state.jobs.length) {
    elements.fileName.textContent = currentCopy().noFile;
    elements.fileMeta.textContent = currentCopy().filePlaceholder;
    return;
  }

  if (state.jobs.length === 1) {
    const single = state.jobs[0].file;
    elements.fileName.textContent = single.name;
    elements.fileMeta.textContent = `${formatBytes(single.size)} · ${single.type}`;
    return;
  }

  const copy = currentCopy();
  const total = state.jobs.reduce((sum, job) => sum + job.file.size, 0);
  elements.fileName.textContent = `${state.jobs.length} ${copy.filesSelected}`;
  elements.fileMeta.textContent = `${formatBytes(total)} ${copy.totalLabel}`;
}

function setPresetByQuality(value) {
  elements.presetBtns.forEach((btn) => {
    const q = parseFloat(btn.dataset.quality);
    btn.classList.toggle("active", Math.abs(q - value) < 0.005);
  });
}

function isPwaMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function applyPwaMode() {
  document.body.classList.toggle("pwa-mode", isPwaMode());
}

function openQueueDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = indexedDB.open(QUEUE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open queue DB"));
  });
}

async function addQueueJob(job) {
  const db = await openQueueDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUEUE_STORE, "readwrite");
    const store = tx.objectStore(QUEUE_STORE);
    const request = store.add(job);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to add queue job"));

    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
    tx.onerror = () => db.close();
  });
}

async function getQueuedJobs() {
  try {
    const db = await openQueueDb();
    const jobs = await new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readonly");
      const request = tx.objectStore(QUEUE_STORE).getAll();

      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
      request.onerror = () => reject(request.error || new Error("Failed to read queue"));

      tx.oncomplete = () => db.close();
      tx.onabort = () => db.close();
      tx.onerror = () => db.close();
    });

    return jobs;
  } catch {
    return [];
  }
}

async function deleteQueuedJob(id) {
  if (id == null) return;
  try {
    const db = await openQueueDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, "readwrite");
      const request = tx.objectStore(QUEUE_STORE).delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("Failed to delete queue job"));

      tx.oncomplete = () => db.close();
      tx.onabort = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch {
    // Ignore queue cleanup errors.
  }
}

async function queueCurrentConversion(job = null) {
  const dataUrl = job?.dataUrl || state.dataUrl;
  const file = job?.file || state.file;
  if (!dataUrl || !file) return false;

  try {
    await addQueueJob({
      dataUrl,
      outputName: file.name.replace(/\.png$/i, ".jpg"),
      quality: parseFloat(elements.qualityRange.value),
      bg: elements.bgSelect.value,
      createdAt: Date.now(),
    });
  } catch {
    return false;
  }

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready.catch(() => null);
    if (reg && "sync" in reg) {
      reg.sync.register(SYNC_TAG).catch(() => {});
    }
  }
  return true;
}

function imageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function blobFromCanvas(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

async function processQueuedConversions() {
  if (state.queueProcessing || !navigator.onLine) return;
  const queue = await getQueuedJobs();
  if (!queue.length) return;

  state.queueProcessing = true;
  try {
    for (const job of queue) {
      try {
        const img = await imageFromDataUrl(job.dataUrl);
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = job.bg === "black" ? "#000" : "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const blob = await blobFromCanvas(canvas, job.quality);
        if (!blob) continue;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = job.outputName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        await deleteQueuedJob(job.id);
      } catch {
        // Keep failed jobs for the next sync attempt.
      }
    }
  } finally {
    state.queueProcessing = false;
  }
}
function resetAll() {
  const copy = currentCopy();
  clearError();
  if (state.outputUrl) {
    URL.revokeObjectURL(state.outputUrl);
  }
  state.file = null;
  state.dataUrl = null;
  state.image = null;
  state.outputUrl = null;
  state.outputSize = 0;

  elements.fileName.textContent = copy.noFile;
  elements.fileMeta.textContent = copy.filePlaceholder;
  elements.downloadLink.hidden = true;
  elements.downloadLink.removeAttribute("href");
  elements.downloadLink.removeAttribute("download");
  elements.preview.hidden = true;
  elements.preview.classList.remove("skeleton", "reveal");
  elements.preview.removeAttribute("src");
  elements.queuePanel.hidden = true;
  elements.queueList.innerHTML = "";
  elements.resultStats.hidden = true;
  elements.resultStats.textContent = "";

  updateFileSummary();
  setState({ status: "idle" });
}

function validateFile(file) {
  const copy = currentCopy();
  if (!file) {
    return copy.errors.selectPng;
  }
  if (file.type !== "image/png") {
    return copy.errors.onlyPng;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return copy.errors.tooLarge;
  }
  return null;
}

function updateFileInfo(file) {
  elements.fileName.textContent = file.name;
  elements.fileMeta.textContent = `${formatBytes(file.size)} · ${file.type}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function triggerDownload(blob, filename, delay = 0) {
  setTimeout(() => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, delay);
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []).filter(Boolean);
  if (!files.length) return;

  clearError();
  for (const file of files) {
    const validation = validateFile(file);
    if (validation) {
      showError(validation);
      return;
    }
  }

  state.outputSize = 0;
  elements.resultStats.hidden = true;
  elements.resultStats.textContent = "";
  elements.preview.hidden = false;
  elements.preview.classList.remove("reveal");
  elements.preview.classList.add("skeleton");
  elements.preview.removeAttribute("src");

  state.jobs = files.map((file) => ({
    file,
    dataUrl: null,
    image: null,
    status: "loading",
    outputBlob: null,
    outputSize: 0,
    outputName: file.name.replace(/\.png$/i, ".jpg"),
  }));
  updateFileSummary();
  renderQueue();
  setState({ status: "loading", file: files[0] });

  try {
    for (const job of state.jobs) {
      const dataUrl = await readFileAsDataUrl(job.file);
      const img = await imageFromDataUrl(dataUrl);
      job.dataUrl = dataUrl;
      job.image = img;
      job.status = "ready";
    }
  } catch {
    showError(currentCopy().errors.readFail);
    return;
  }

  const first = state.jobs[0];
  state.file = first.file;
  state.dataUrl = first.dataUrl;
  state.image = first.image;
  elements.preview.src = first.dataUrl;
  elements.preview.hidden = false;
  elements.preview.classList.remove("skeleton", "reveal");
  void elements.preview.offsetWidth;
  elements.preview.classList.add("reveal");
  updateFileSummary();
  renderQueue();
  setState({ status: "ready" });
}

async function toJpg() {
  if (state.status === "converting") return;
  const readyJobs = state.jobs.filter((job) => job.status === "ready");
  if (!readyJobs.length) return;
  clearError();

  if (!navigator.onLine) {
    for (const job of readyJobs) {
      const queued = await queueCurrentConversion(job);
      if (queued) {
        job.status = "queued";
      }
    }
    renderQueue();
    setState({ status: "queued" });
    return;
  }

  setState({ status: "converting" });
  const quality = parseFloat(elements.qualityRange.value);
  let processed = 0;

  for (const job of readyJobs) {
    job.status = "converting";
    renderQueue();
    try {
      const canvas = document.createElement("canvas");
      canvas.width = job.image.width;
      canvas.height = job.image.height;
      const ctx = canvas.getContext("2d");
      const bg = elements.bgSelect.value === "black" ? "#000" : "#fff";
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(job.image, 0, 0);
      const blob = await blobFromCanvas(canvas, quality);
      if (!blob) {
        job.status = "error";
      } else {
        job.outputBlob = blob;
        job.outputSize = blob.size;
        job.status = "done";
      }
    } catch {
      job.status = "error";
    }
    processed += 1;
    setProgress((processed / readyJobs.length) * 100);
    renderQueue();
  }

  const doneJobs = state.jobs.filter((job) => job.status === "done");
  if (doneJobs.length) {
    state.outputSize = doneJobs.reduce((sum, job) => sum + job.outputSize, 0);
    elements.downloadLink.textContent = state.jobs.length > 1
      ? currentCopy().downloadAllBtn
      : currentCopy().downloadBtn;
    elements.downloadLink.hidden = false;
    renderResultStats();
    elements.resultStats.hidden = false;
    setState({ status: "done" });
    return;
  }

  showError(currentCopy().errors.createFail);
}

function handleDrop(event) {
  event.preventDefault();
  elements.dropzone.classList.remove("dragging");
  handleFiles(event.dataTransfer.files);
}

function setQualityLabel() {
  const copy = currentCopy();
  const value = Math.round(parseFloat(elements.qualityRange.value) * 100);
  elements.qualityValue.textContent = `${value}%`;
  setPresetByQuality(value / 100);
  let hint = copy.qualityHintBalanced;
  if (value <= 74) hint = copy.qualityHintSmall;
  if (value >= 92) hint = copy.qualityHintMax;
  elements.qualityHint.textContent = hint;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  elements.themeToggle.textContent = next === "dark" ? "\uD83C\uDF19" : "\u2600\uFE0F";
  localStorage.setItem("pixelfox-theme", next);
}

function applyLanguageText() {
  const copy = currentCopy();

  document.documentElement.lang = state.lang;
  document.title = copy.pageTitle;

  const brandSubtitle = document.querySelector(".brand-subtitle");
  const navLinks = document.querySelectorAll(".nav-link");
  const heroTitle = document.querySelector(".hero-text h1");
  const heroSubtitle = document.querySelector(".hero-text p");
  const converterTitle = document.querySelector(".card-head h2");
  const converterSubtitle = document.querySelector(".card-head .muted");
  const dzTitle = document.querySelector(".dz-title");
  const dzMeta = document.querySelector(".dz-meta");
  const qualityLabel = document.querySelector('label[for="qualityRange"]');
  const backgroundLabel = document.querySelector('label[for="bgSelect"]');
  const controlHints = document.querySelectorAll(".control-hint");
  const bgHint = controlHints[1];
  const queueTitle = document.querySelector(".queue-title");
  const bgOptions = elements.bgSelect.options;
  const sectionTitles = document.querySelectorAll(".section-head h2");
  const sectionSubtitles = document.querySelectorAll(".section-head .muted");
  const pills = document.querySelectorAll(".pill");
  const smallCards = document.querySelectorAll(".card.small");
  const planTitles = document.querySelectorAll(".plan-title");
  const planButtons = document.querySelectorAll(".plan .btn");
  const footerLinks = document.querySelectorAll(".footer a");

  if (brandSubtitle) brandSubtitle.textContent = copy.brandSubtitle;
  if (navLinks[0]) navLinks[0].textContent = copy.navConvert;
  if (navLinks[1]) navLinks[1].textContent = copy.navTools;
  if (navLinks[2]) navLinks[2].textContent = copy.navPrivacy;
  if (elements.upgradeBtn) elements.upgradeBtn.textContent = copy.upgrade;
  if (heroTitle) heroTitle.textContent = copy.heroTitle;
  if (heroSubtitle) heroSubtitle.textContent = copy.heroSubtitle;
  if (converterTitle) converterTitle.textContent = copy.converterTitle;
  if (converterSubtitle) converterSubtitle.textContent = copy.converterSubtitle;
  if (dzTitle) dzTitle.textContent = copy.dropzoneTitle;
  if (dzMeta) dzMeta.textContent = copy.dropzoneMeta;
  if (qualityLabel) qualityLabel.textContent = copy.qualityLabel;
  if (backgroundLabel) backgroundLabel.textContent = copy.backgroundLabel;
  if (bgHint) bgHint.textContent = copy.bgHint;
  if (queueTitle) queueTitle.textContent = copy.queueTitle;
  if (bgOptions[0]) bgOptions[0].textContent = copy.bgWhite;
  if (bgOptions[1]) bgOptions[1].textContent = copy.bgBlack;
  if (elements.presetBtns[0]) elements.presetBtns[0].textContent = copy.presetFast;
  if (elements.presetBtns[1]) elements.presetBtns[1].textContent = copy.presetBalanced;
  if (elements.presetBtns[2]) elements.presetBtns[2].textContent = copy.presetMax;

  elements.convertBtn.textContent = copy.convertBtn;
  elements.resetBtn.textContent = copy.resetBtn;
  elements.downloadLink.textContent = state.jobs.length > 1 ? copy.downloadAllBtn : copy.downloadBtn;
  elements.offlineBadge.textContent = copy.offlineMode;
  elements.installBtn.textContent = copy.installApp;
  elements.dropzone.setAttribute("aria-label", copy.fileAria);
  elements.preview.alt = copy.previewAlt;
  if (state.status === "done") {
    renderResultStats();
  }
  renderQueue();
  setQualityLabel();

  if (sectionTitles[0]) sectionTitles[0].textContent = copy.sectionPrivacyTitle;
  if (sectionSubtitles[0]) sectionSubtitles[0].textContent = copy.sectionPrivacySubtitle;
  if (sectionTitles[1]) sectionTitles[1].textContent = copy.sectionAboutTitle;
  if (sectionSubtitles[1]) sectionSubtitles[1].textContent = copy.sectionAboutSubtitle;
  if (sectionTitles[2]) sectionTitles[2].textContent = copy.sectionUpgradeTitle;
  if (sectionSubtitles[2]) sectionSubtitles[2].textContent = copy.sectionUpgradeSubtitle;

  if (pills[0]) pills[0].textContent = copy.pill1;
  if (pills[1]) pills[1].textContent = copy.pill2;
  if (pills[2]) pills[2].textContent = copy.pill3;

  if (smallCards[0]) {
    smallCards[0].querySelector("h3").textContent = copy.originTitle;
    smallCards[0].querySelector("p").textContent = copy.originText;
  }
  if (smallCards[1]) {
    smallCards[1].querySelector("h3").textContent = copy.philosophyTitle;
    smallCards[1].querySelector("p").textContent = copy.philosophyText;
  }
  if (smallCards[2]) {
    smallCards[2].querySelector("h3").textContent = copy.momentumTitle;
    smallCards[2].querySelector("p").textContent = copy.momentumText;
  }

  if (planTitles[0]) planTitles[0].textContent = copy.freePlanTitle;
  if (planTitles[1]) planTitles[1].textContent = copy.proPlanTitle;
  if (planButtons[0]) planButtons[0].textContent = copy.freePlanCurrent;
  if (planButtons[1]) planButtons[1].textContent = copy.proPlanNotify;

  if (footerLinks[0]) footerLinks[0].textContent = copy.footerPrivacy;
  if (footerLinks[2]) footerLinks[2].textContent = copy.footerContact;

  elements.languageFlag.textContent = copy.flag;
}

function updateOnlineStatus() {
  elements.offlineBadge.hidden = navigator.onLine;
}

function updateInstallButton() {
  elements.installBtn.hidden = !state.installPromptEvent || isPwaMode();
}

function setLanguage(nextLang, options = { persist: true }) {
  const lang = translations[nextLang] ? nextLang : DEFAULT_LANG;
  state.lang = lang;
  elements.languageSelect.value = lang;
  applyLanguageText();
  if (!state.file) {
    elements.fileName.textContent = currentCopy().noFile;
    elements.fileMeta.textContent = currentCopy().filePlaceholder;
  }
  setState({ status: state.status });

  if (options.persist) {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }
}

function initTheme() {
  const saved = localStorage.getItem("pixelfox-theme");
  if (saved) {
    document.documentElement.setAttribute("data-theme", saved);
    elements.themeToggle.textContent = saved === "dark" ? "\uD83C\uDF19" : "\u2600\uFE0F";
  }
}

function initLanguage() {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  setLanguage(saved || DEFAULT_LANG, { persist: false });
}

function bindEvents() {
  elements.dropzone.addEventListener("click", () => elements.fileInput.click());
  elements.dropzone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      elements.fileInput.click();
    }
  });

  elements.dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    elements.dropzone.classList.add("dragging");
  });
  elements.dropzone.addEventListener("dragleave", () => {
    elements.dropzone.classList.remove("dragging");
  });
  elements.dropzone.addEventListener("drop", handleDrop);

  elements.fileInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
    event.target.value = "";
  });

  elements.qualityRange.addEventListener("input", setQualityLabel);
  elements.presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const quality = parseFloat(btn.dataset.quality);
      if (Number.isNaN(quality)) return;
      elements.qualityRange.value = quality.toFixed(2);
      setQualityLabel();
    });
  });

  elements.convertBtn.addEventListener("click", toJpg);
  elements.resetBtn.addEventListener("click", resetAll);
  elements.downloadLink.addEventListener("click", (event) => {
    event.preventDefault();
    const doneJobs = state.jobs.filter((job) => job.status === "done" && job.outputBlob);
    doneJobs.forEach((job, index) => {
      triggerDownload(job.outputBlob, job.outputName, index * 120);
    });
    setTimeout(resetAll, 400);
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.languageSelect.addEventListener("change", () => {
    setLanguage(elements.languageSelect.value);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      resetAll();
    }
  });
  document.addEventListener("paste", (event) => {
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.isContentEditable)
    ) {
      return;
    }
    const items = event.clipboardData?.items || [];
    for (const item of items) {
      if (item.type === "image/png") {
        const file = item.getAsFile();
        if (file) {
          handleFiles([file]);
        }
        break;
      }
    }
  });
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("online", processQueuedConversions);
  window.addEventListener("offline", updateOnlineStatus);
  const displayMode = window.matchMedia("(display-mode: standalone)");
  displayMode.addEventListener("change", () => {
    applyPwaMode();
    updateInstallButton();
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.installPromptEvent = event;
    updateInstallButton();
  });
  elements.installBtn.addEventListener("click", async () => {
    if (!state.installPromptEvent) return;
    state.installPromptEvent.prompt();
    await state.installPromptEvent.userChoice.catch(() => null);
    state.installPromptEvent = null;
    updateInstallButton();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(window.location.protocol)) return;

  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then(() => {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "PROCESS_CONVERT_QUEUE") {
          processQueuedConversions();
        }
      });
    })
    .catch(() => {
      // Silent fail: converter should work normally without SW.
    });
}

bindEvents();
applyPwaMode();
setQualityLabel();
initTheme();
initLanguage();
resetAll();
registerServiceWorker();
updateOnlineStatus();
updateInstallButton();
processQueuedConversions();







