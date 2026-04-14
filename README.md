# YT Shorts 字幕增強器

一個給 Chromium 瀏覽器使用的 Chrome Extension，用來調整 YouTube Shorts 上 Immersive Translate 雙字幕的樣式，讓字幕更容易閱讀。

## 功能

- 即時調整字幕字體大小
- 切換字重
- 切換字型
- 自訂字幕文字顏色
- 自訂字幕背景色與透明度
- 調整字幕上下位置
- 支援快速啟用 / 停用
- 設定會透過 `chrome.storage.sync` 保存

## 適用情境

如果你在 YouTube Shorts 搭配 Immersive Translate 使用雙字幕，覺得預設字幕：

- 太小
- 太貼底部
- 顏色不清楚
- 背景不夠明顯

這個 extension 可以直接幫你把樣式調整到更適合自己的閱讀方式。

## 安裝方式

### 1. 下載專案

你可以直接 clone：

```bash
git clone <your-repo-url>
cd yt-shorts-caption-extension
```

或直接下載 ZIP 後解壓縮。

### 2. 載入 Chrome Extension

1. 打開 `chrome://extensions/`
2. 開啟右上角「開發人員模式」
3. 點擊「載入未封裝項目」
4. 選擇這個專案資料夾

## 使用方式

1. 打開 YouTube Shorts 頁面
2. 確認 Immersive Translate 雙字幕已顯示
3. 點擊瀏覽器工具列中的 extension 圖示
4. 在 popup 中調整字體、顏色、背景透明度與垂直位移
5. 設定會即時套用到目前頁面，並自動保存

## 專案結構

```text
.
├─ manifest.json
├─ popup.html
├─ popup.js
├─ content.js
├─ caption-override.css
├─ icon16.png
├─ icon48.png
└─ icon128.png
```

## 權限說明

- `storage`：保存使用者字幕設定
- `activeTab`：對目前開啟的 YouTube 分頁套用預覽設定
- `scripting`：保留給目前 extension 腳本操作用途
- `https://www.youtube.com/*`：僅在 YouTube 頁面注入 content script

## 實作方式

- `popup.js` 負責讀寫設定、更新預覽、推送即時變更到目前分頁
- `content.js` 負責監聽 YouTube / Immersive Translate 字幕節點變化，並把樣式套用到字幕元素
- 字幕樣式以 JavaScript 動態注入到對應的 Shadow DOM 中

## 限制與注意事項

- 目前是針對 Immersive Translate 字幕結構設計，依賴 `#immersive-translate-caption-window` 與 `.imt-*` 類名
- 如果 YouTube 或 Immersive Translate 更新 DOM 結構，可能需要調整程式碼
- 主要目標場景是 YouTube Shorts；其他 YouTube 頁面不保證效果一致

## 隱私說明

這個 extension：

- 不會蒐集個人資料
- 不會把字幕內容傳送到外部伺服器
- 不依賴任何第三方後端服務

## 開發與測試

修改程式後：

1. 回到 `chrome://extensions/`
2. 找到這個 extension
3. 點擊重新整理
4. 回到 YouTube Shorts 頁面重新測試

## License

如果你準備公開到 GitHub，但還沒決定授權方式，可以先保留為 `All rights reserved`，或之後再補上 MIT License。
