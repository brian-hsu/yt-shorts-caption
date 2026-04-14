const ids = [
  "fontSize",
  "fontWeight",
  "fontFamily",
  "color",
  "bgColor",
  "bgOpacity",
  "bottomOffset",
  "enabled"
];

let saveTimer = null;

function clampBottomOffset(value) {
  return Math.min(700, Math.max(-600, Number(value)));
}

function updatePreview(settings) {
  const previewLines = document.querySelectorAll(".preview-text");
  const previewBox = document.getElementById("preview-box");
  const r = Number.parseInt(settings.bgColor.slice(1, 3), 16);
  const g = Number.parseInt(settings.bgColor.slice(3, 5), 16);
  const b = Number.parseInt(settings.bgColor.slice(5, 7), 16);
  const a = settings.bgOpacity / 100;

  previewBox.style.bottom = `${settings.bottomOffset}px`;

  previewLines.forEach((line) => {
    line.style.fontSize = `${settings.fontSize}px`;
    line.style.fontWeight = settings.fontWeight;
    line.style.fontFamily = settings.fontFamily;
    line.style.color = settings.color;
    line.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
  });
}

function pushToActiveTab(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;

    if (!tab?.id) {
      return;
    }

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: "YT_CAPTION_PREVIEW",
        settings
      },
      () => {
        void chrome.runtime.lastError;
      }
    );
  });
}

function persistSettings(settings) {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    chrome.storage.sync.set(settings);
  }, 120);
}

function getValues() {
  return {
    fontSize: Number(document.getElementById("fontSize").value),
    fontWeight: document.getElementById("fontWeight").value,
    fontFamily: document.getElementById("fontFamily").value,
    color: document.getElementById("color").value,
    bgColor: document.getElementById("bgColor").value,
    bgOpacity: Number(document.getElementById("bgOpacity").value),
    bottomOffset: clampBottomOffset(document.getElementById("bottomOffset").value),
    enabled: document.getElementById("enabled").checked
  };
}

function setValues(settings) {
  if (settings.fontSize) {
    document.getElementById("fontSize").value = settings.fontSize;
  }
  if (settings.fontWeight) {
    document.getElementById("fontWeight").value = settings.fontWeight;
  }
  if (settings.fontFamily) {
    document.getElementById("fontFamily").value = settings.fontFamily;
  }
  if (settings.color) {
    document.getElementById("color").value = settings.color;
  }
  if (settings.bgColor) {
    document.getElementById("bgColor").value = settings.bgColor;
  }
  if (settings.bgOpacity != null) {
    document.getElementById("bgOpacity").value = settings.bgOpacity;
  }
  if (settings.bottomOffset != null) {
    document.getElementById("bottomOffset").value = clampBottomOffset(settings.bottomOffset);
  }
  if (settings.enabled != null) {
    document.getElementById("enabled").checked = settings.enabled;
  }

  document.getElementById("fontSizeVal").textContent = `${settings.fontSize || 24}px`;
  document.getElementById("bgOpacityVal").textContent = `${settings.bgOpacity ?? 75}%`;
  document.getElementById("bottomOffsetVal").textContent = `${clampBottomOffset(settings.bottomOffset ?? 0)}px`;
}

chrome.storage.sync.get(null, (settings) => {
  setValues(settings);
  updatePreview(getValues());
});

ids.forEach((id) => {
  document.getElementById(id).addEventListener("input", () => {
    const settings = getValues();

    document.getElementById("fontSizeVal").textContent = `${settings.fontSize}px`;
    document.getElementById("bgOpacityVal").textContent = `${settings.bgOpacity}%`;
    document.getElementById("bottomOffsetVal").textContent = `${settings.bottomOffset}px`;

    updatePreview(settings);
    pushToActiveTab(settings);
    persistSettings(settings);
  });

  document.getElementById(id).addEventListener("change", () => {
    const settings = getValues();
    window.clearTimeout(saveTimer);
    chrome.storage.sync.set(settings);
  });
});
