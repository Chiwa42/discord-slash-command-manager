# Discord Multi-Slash Command Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Userscript](https://img.shields.io/badge/userscript-Tampermonkey%20%2F%20Violentmonkey-blue)](commandManager.user.js)
[![Discord](https://img.shields.io/badge/platform-Discord-5865F2)](https://discord.com/)

> [!WARNING]
> 這個 userscript 會自動化 Discord 使用者帳號的操作。這類行為可能被視為 self-bot，並可能違反 Discord 服務條款，導致帳號受到限制或終止。
>
> 使用風險由你自行承擔。

Discord Multi-Slash Command Manager 是一個瀏覽器 userscript，會在 Discord Web 中加入一個浮動控制面板。它可以儲存多組 slash command interaction payload，並支援手動送出或依照固定間隔重複送出。

本專案僅供個人實驗與學習用途。你必須自行承擔使用方式所造成的結果。

---

## 安裝

1. 如果你還沒有 userscript 管理器，請先安裝：
   - [Tampermonkey](https://www.tampermonkey.net/)
2. 開啟 userscript 檔案：
   - [commandManager.user.js](https://greasyfork.org/en/scripts/588252-discord-multi-slash-command-manager)
3. 透過 userscript 管理器安裝。
4. 在瀏覽器中開啟 [Discord Web](https://discord.com/)。

---

## 使用方式

1. 在瀏覽器中開啟 Discord。
2. 等待 `Discord Multi Slash Manager` 面板出現。
3. 填入連線設定：
   - `User Token`
   - `Guild ID`
   - `Channel ID`
   - `Session ID`
4. 點擊 `Add Command`。
5. 設定指令：
   - `App ID`
   - `Cmd ID`
   - `Version`
   - `Interval (s)`
   - `Options JSON`
6. 點擊 `Send Now` 立即送出一次請求。
7. 點擊 `Start Scheduler`，依照啟用指令的間隔重複送出。
8. 點擊 `Stop Scheduler` 停止排程。

面板可以透過標題列拖曳移動。

---

## Command Options

`Options JSON` 必須是有效的 JSON 陣列，並符合 Discord slash command options 的資料結構。

範例：

```json
[
  {
    "type": 3,
    "name": "message",
    "value": "hello"
  }
]
```

如果指令不需要 options，請保留為：

```json
[]
```

---

## 重要 Token 警告

> [!CAUTION]
> 永遠不要分享你的 Discord user token。

任何取得你 token 的人，都可能能夠存取你的帳號。請不要張貼包含 token 的截圖、log、瀏覽器儲存資料或腳本設定。

如果你的 token 外洩：

1. 從取得該 token 的瀏覽器登出 Discord。
2. 變更 Discord 密碼。
3. 啟用雙重驗證。
4. 檢查目前登入的工作階段與已連接的應用程式。

---

## 安全性疑慮

Userscript 會在你的瀏覽器中執行，並能存取它被允許執行的頁面。只安裝你信任且能檢查內容的腳本。

此腳本會透過 userscript 管理器的儲存 API 保存設定。請將這些儲存資料視為敏感資訊，因為其中可能包含你的 Discord token 與指令識別資料。

---

## 免責聲明

本軟體與此處提供的所有資訊皆以「原樣」提供，不附帶任何明示或暗示之保證，包括但不限於適售性、特定用途適用性與非侵權之保證。在任何情況下，作者或版權持有人均不對任何索賠、損害或其他責任負責，無論其源自契約、侵權或其他原因，亦無論其是否因本軟體或本軟體的使用或其他交易而產生。

使用本專案即表示你同意自行負責透過本專案執行的任何操作。

---

## 授權

MIT License。詳見 [LICENSE](LICENSE)。
