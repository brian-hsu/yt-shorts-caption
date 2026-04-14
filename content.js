const HOST_SELECTOR = "#immersive-translate-caption-window";
const SHADOW_STYLE_ID = "yt-caption-custom-style";
const DEFAULT_SETTINGS = {
  fontSize: 24,
  fontWeight: "700",
  fontFamily: "inherit",
  color: "#ffffff",
  bgColor: "#000000",
  bgOpacity: 75,
  bottomOffset: 0,
  enabled: true
};

let currentSettings = { ...DEFAULT_SETTINGS };
let scanTimer = null;

function toRgba(color, opacity) {
  const safeColor = color || DEFAULT_SETTINGS.bgColor;
  const r = Number.parseInt(safeColor.slice(1, 3), 16);
  const g = Number.parseInt(safeColor.slice(3, 5), 16);
  const b = Number.parseInt(safeColor.slice(5, 7), 16);
  const alpha = (opacity ?? DEFAULT_SETTINGS.bgOpacity) / 100;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildStyleText(settings) {
  return `
    .imt-caption-window {
      left: 5% !important;
      right: auto !important;
      width: 90% !important;
      top: unset !important;
      margin-bottom: 0 !important;
      transform: none !important;
      max-height: none !important;
    }

    .imt-captions-text {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 2px !important;
    }

    .imt-caption-window .imt-cue,
    .source-cue.imt-cue,
    .target-cue.imt-cue {
      display: inline-block !important;
      width: fit-content !important;
      max-width: 100% !important;
      padding: 2px 6px !important;
      border-radius: 4px !important;
      line-height: 1.45 !important;
      text-align: center !important;
      white-space: pre-wrap !important;
      box-sizing: border-box !important;
    }
  `;
}

function normalizeSettings(settings) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

function ensureShadowStyle(shadowRoot) {
  let style = shadowRoot.getElementById(SHADOW_STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = SHADOW_STYLE_ID;
    shadowRoot.appendChild(style);
  }

  return style;
}

function getShadowRoots() {
  return Array.from(document.querySelectorAll(HOST_SELECTOR))
    .map((host) => host.shadowRoot)
    .filter(Boolean);
}

function applyWindowPosition(shadowRoot, settings) {
  const captionWindows = shadowRoot.querySelectorAll(".imt-caption-window");

  captionWindows.forEach((captionWindow) => {
    captionWindow.style.setProperty("left", "5%", "important");
    captionWindow.style.setProperty("right", "auto", "important");
    captionWindow.style.setProperty("width", "90%", "important");
    captionWindow.style.setProperty("top", "unset", "important");
    captionWindow.style.setProperty("bottom", `${settings.bottomOffset}px`, "important");
    captionWindow.style.setProperty("margin-bottom", "0", "important");
    captionWindow.style.setProperty("transform", "none", "important");
    captionWindow.style.setProperty("max-height", "none", "important");
  });
}

function applyTextLayout(shadowRoot) {
  shadowRoot.querySelectorAll(".imt-captions-text").forEach((textBlock) => {
    textBlock.style.setProperty("display", "flex", "important");
    textBlock.style.setProperty("flex-direction", "column", "important");
    textBlock.style.setProperty("align-items", "center", "important");
    textBlock.style.setProperty("justify-content", "flex-end", "important");
    textBlock.style.setProperty("gap", "2px", "important");
  });
}

function applyCueStyles(shadowRoot, settings) {
  const backgroundColor = toRgba(settings.bgColor, settings.bgOpacity);

  shadowRoot.querySelectorAll(".imt-cue").forEach((cue) => {
    cue.style.setProperty("display", "inline-block", "important");
    cue.style.setProperty("width", "fit-content", "important");
    cue.style.setProperty("max-width", "100%", "important");
    cue.style.setProperty("padding", "2px 6px", "important");
    cue.style.setProperty("border-radius", "4px", "important");
    cue.style.setProperty("font-size", `${settings.fontSize}px`, "important");
    cue.style.setProperty("font-weight", settings.fontWeight, "important");
    cue.style.setProperty("font-family", settings.fontFamily, "important");
    cue.style.setProperty("color", settings.color, "important");
    cue.style.setProperty("background-color", backgroundColor, "important");
    cue.style.setProperty("line-height", "1.45", "important");
    cue.style.setProperty("text-align", "center", "important");
    cue.style.setProperty("white-space", "pre-wrap", "important");
    cue.style.setProperty("box-sizing", "border-box", "important");
  });
}

function applyToShadowRoot(shadowRoot, settings) {
  const style = ensureShadowStyle(shadowRoot);

  if (!settings.enabled) {
    style.textContent = "";

    shadowRoot.querySelectorAll(".imt-caption-window").forEach((captionWindow) => {
      captionWindow.style.removeProperty("left");
      captionWindow.style.removeProperty("right");
      captionWindow.style.removeProperty("width");
      captionWindow.style.removeProperty("top");
      captionWindow.style.removeProperty("bottom");
      captionWindow.style.removeProperty("margin-bottom");
      captionWindow.style.removeProperty("transform");
      captionWindow.style.removeProperty("max-height");
    });

    shadowRoot.querySelectorAll(".imt-captions-text").forEach((textBlock) => {
      textBlock.style.removeProperty("display");
      textBlock.style.removeProperty("flex-direction");
      textBlock.style.removeProperty("align-items");
      textBlock.style.removeProperty("justify-content");
      textBlock.style.removeProperty("gap");
    });

    shadowRoot.querySelectorAll(".imt-cue").forEach((cue) => {
      cue.style.removeProperty("display");
      cue.style.removeProperty("width");
      cue.style.removeProperty("max-width");
      cue.style.removeProperty("padding");
      cue.style.removeProperty("border-radius");
      cue.style.removeProperty("font-size");
      cue.style.removeProperty("font-weight");
      cue.style.removeProperty("font-family");
      cue.style.removeProperty("color");
      cue.style.removeProperty("background-color");
      cue.style.removeProperty("line-height");
      cue.style.removeProperty("text-align");
      cue.style.removeProperty("white-space");
      cue.style.removeProperty("box-sizing");
    });

    return;
  }

  style.textContent = buildStyleText(settings);
  applyWindowPosition(shadowRoot, settings);
  applyTextLayout(shadowRoot);
  applyCueStyles(shadowRoot, settings);
}

function applySettings(settings) {
  currentSettings = normalizeSettings(settings);

  getShadowRoots().forEach((shadowRoot) => {
    applyToShadowRoot(shadowRoot, currentSettings);
  });
}

function scheduleRefresh() {
  window.clearTimeout(scanTimer);
  scanTimer = window.setTimeout(() => {
    applySettings(currentSettings);
  }, 80);
}

function observeShadowRoot(shadowRoot) {
  if (shadowRoot.__ytCaptionObserverAttached) {
    return;
  }

  const observer = new MutationObserver(() => {
    scheduleRefresh();
  });

  observer.observe(shadowRoot, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"]
  });

  shadowRoot.__ytCaptionObserverAttached = true;
}

function startWatching() {
  const observer = new MutationObserver(() => {
    getShadowRoots().forEach((shadowRoot) => {
      observeShadowRoot(shadowRoot);
    });
    scheduleRefresh();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  getShadowRoots().forEach((shadowRoot) => {
    observeShadowRoot(shadowRoot);
  });

  window.setInterval(() => {
    applySettings(currentSettings);
  }, 1500);
}

chrome.storage.sync.get(null, (settings) => {
  applySettings(settings);
});

chrome.storage.onChanged.addListener((_changes, area) => {
  if (area === "sync") {
    chrome.storage.sync.get(null, (settings) => {
      applySettings(settings);
    });
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "YT_CAPTION_PREVIEW" || !message.settings) {
    return;
  }

  applySettings(message.settings);
  sendResponse?.({ ok: true });
});

startWatching();
