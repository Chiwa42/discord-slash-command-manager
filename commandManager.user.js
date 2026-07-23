// ==UserScript==
// @name         Discord Multi-Slash Command Manager
// @description  Auto send slash command interactions
// @namespace    https://tampermonkey.net/
// @version      1.1
// @author          chiwa42 (https://github.com/Chiwa42)
// @homepageURL     https://github.com/Chiwa42/discord-slash-command-manager
// @supportURL      https://github.com/Chiwa42/discord-slash-command-manager/discussions
// @license         MIT
// @icon            https://github.com/Chiwa42/discord-slash-command-manager/images/icon.png
// @match           https://discord.com/*
// @updateURL       https://github.com/Chiwa42/discord-slash-command-manager/commandManager.meta.js
// @downloadURL     https://github.com/Chiwa42/discord-slash-command-manager/commandManager.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const STORAGE = "discord_multi_slash_panel";

    let cfg = {
        token: "",
        guild: "",
        channel: "",
        sessionId: "",
        commands: [] // Stores multiple command configurations
    };

    // ==============================
    // Configuration
    // ==============================

    // Load configuration
    try {
        cfg = Object.assign(cfg, JSON.parse(GM_getValue(STORAGE, "{}")));
    } catch (e) {
        console.error("[Multi-Slash Panel] Load config error:", e);
    }

    // ==============================
    // Utility Functions
    // ==============================

    // Save configuration
    function save() {
        GM_setValue(STORAGE, JSON.stringify(cfg));
    }

    // Wait for the given number of milliseconds
    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    let textarea = null;

    // Write log message
    function log(msg) {
        console.log("[Multi-Slash]", msg);
        if (textarea) {
            textarea.value += msg + "\n";
            textarea.scrollTop = textarea.scrollHeight;
        }
    }

    // ==============================
    // Discord API
    // ==============================

    // Send interaction request
    async function sendInteraction(cmd) {
        if (!cfg.token || !cfg.sessionId || !cfg.guild || !cfg.channel) {
            log(`[${cmd.name}] Missing required settings (Token / Session ID / Guild ID / Channel ID)`);
            return false;
        }

        try {
            const payload = {
                type: 2,
                application_id: cmd.application,
                guild_id: cfg.guild,
                channel_id: cfg.channel,
                session_id: cfg.sessionId,
                nonce: Date.now().toString(),
                data: {
                    version: cmd.version,
                    id: cmd.commandId,
                    name: cmd.name,
                    type: 1,
                    options: JSON.parse(cmd.options || "[]")
                }
            };

            const res = await fetch("https://discord.com/api/v10/interactions", {
                method: "POST",
                headers: {
                    "Authorization": cfg.token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            log(`[${cmd.name}] HTTP ${res.status}`);

            if (res.ok) {
                cmd.sent = (cmd.sent || 0) + 1;
                cmd.lastSent = Date.now();
                save();
                log(`Command /${cmd.name} sent successfully. (Total: ${cmd.sent})`);
                renderCommands();
                return true;
            } else {
                log(`Command /${cmd.name} failed: ` + await res.text());
            }
        } catch (e) {
            log(`[${cmd.name}] ERROR: ` + e.message);
        }
        return false;
    }

    // Main sending loop
    let schedulerInterval = null;
    function startScheduler() {
        if (schedulerInterval) return;

        schedulerInterval = setInterval(() => {
            const now = Date.now();

            cfg.commands.forEach(async (cmd) => {
                if (!cmd.enabled) return;

                const intervalMs = Number(cmd.delay) * 1000;
                const last = cmd.lastSent || 0;

                if (now - last >= intervalMs) {
                    cmd.lastSent = now;
                    log(`Triggering command: /${cmd.name} (Interval: ${cmd.delay}s)`);
                    await sendInteraction(cmd);
                }
            });
        }, 1000);
        log("Global scheduler started");
    }

    function stopScheduler() {
        if (schedulerInterval) {
            clearInterval(schedulerInterval);
            schedulerInterval = null;
            log("Global scheduler stopped");
        }
    }

    // ==============================
    // User Interface
    // ==============================

    // Create panel
    const panel = document.createElement("div");
    panel.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        width: 420px;
        max-height: 90vh;
        overflow-y: auto;
        background: #202225;
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        box-shadow: 0 0 20px black;
    `;

    panel.innerHTML = `
        <div id="title" style="cursor: move; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
            Discord Multi Slash Manager
        </div>

        <details open style="margin-bottom: 10px; background: #2f3136; padding: 8px; border-radius: 5px;">
            <summary style="cursor: pointer; font-weight: bold;">Connection Settings</summary>
            <div style="margin-top: 8px;">
                <label style="font-size: 12px;">User Token</label>
                <input id="token" type="password" style="width: 100%; box-sizing: border-box; margin-bottom: 5px;">

                <label style="font-size: 12px;">Guild ID</label>
                <input id="guild" style="width: 100%; box-sizing: border-box; margin-bottom: 5px;">

                <label style="font-size: 12px;">Channel ID</label>
                <input id="channel" style="width: 100%; box-sizing: border-box; margin-bottom: 5px;">

                <label style="font-size: 12px;">Session ID</label>
                <input id="sessionId" style="width: 100%; box-sizing: border-box;" placeholder="Gateway Session ID">
            </div>
        </details>

        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <button id="addCmdBtn" style="flex: 1; padding: 6px; background: #4f545c; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Command</button>
            <button id="startAllBtn" style="flex: 1; padding: 6px; background: #43b581; color: white; border: none; border-radius: 4px; cursor: pointer;">Start Scheduler</button>
            <button id="stopAllBtn" style="flex: 1; padding: 6px; background: #f04747; color: white; border: none; border-radius: 4px; cursor: pointer;">Stop Scheduler</button>
        </div>

        <div id="cmdListContainer" style="margin-bottom: 10px;"></div>

        <textarea id="log" readonly style="width: 100%; height: 120px; background: #111; color: #0f0; font-family: monospace; box-sizing: border-box; resize: none;"></textarea>
    `;

    // Render command list
    function renderCommands() {
        const container = panel.querySelector("#cmdListContainer");
        container.innerHTML = "";

        if (cfg.commands.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: #8e9297; padding: 10px;">No commands yet. Click "Add Command" to create one.</div>`;
            return;
        }

        cfg.commands.forEach((cmd, index) => {
            const card = document.createElement("div");
            card.style.cssText = `
                background: #2f3136;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 8px;
                border-left: 4px solid ${cmd.enabled ? '#43b581' : '#747f8d'};
            `;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <label style="font-weight: bold; cursor: pointer;">
                        <input type="checkbox" class="cmd-enable" ${cmd.enabled ? 'checked' : ''}> /${cmd.name || 'Unnamed'}
                    </label>
                    <div>
                        <button class="cmd-send-now" style="padding: 2px 6px; font-size: 11px;">Send Now</button>
                        <button class="cmd-delete" style="padding: 2px 6px; font-size: 11px; background: #f04747; color: white; border: none; border-radius: 3px;">Delete</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px;">
                    <div>
                        App ID: <input class="cmd-app" value="${cmd.application || ''}" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div>
                        Cmd ID: <input class="cmd-id" value="${cmd.commandId || ''}" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div>
                        Version: <input class="cmd-ver" value="${cmd.version || ''}" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div>
                        Interval (s): <input class="cmd-delay" type="number" value="${cmd.delay || 3600}" style="width: 100%; box-sizing: border-box;">
                    </div>
                </div>

                <div style="margin-top: 5px; font-size: 11px;">
                    Options JSON:
                    <input class="cmd-options" value='${cmd.options || "[]"}' style="width: 100%; box-sizing: border-box;">
                </div>

                <div style="margin-top: 5px; font-size: 10px; color: #b9bbbe; display: flex; justify-content: space-between;">
                    <span>Sent: ${cmd.sent || 0}</span>
                    <span>Last: ${cmd.lastSent ? new Date(cmd.lastSent).toLocaleTimeString() : 'Never'}</span>
                </div>
            `;

            // Bind command events
            card.querySelector(".cmd-enable").onchange = (e) => { cmd.enabled = e.target.checked; save(); renderCommands(); };
            card.querySelector(".cmd-app").oninput = (e) => { cmd.application = e.target.value.trim(); save(); };
            card.querySelector(".cmd-id").oninput = (e) => { cmd.commandId = e.target.value.trim(); save(); };
            card.querySelector(".cmd-ver").oninput = (e) => { cmd.version = e.target.value.trim(); save(); };
            card.querySelector(".cmd-delay").oninput = (e) => { cmd.delay = Number(e.target.value); save(); };
            card.querySelector(".cmd-options").oninput = (e) => { cmd.options = e.target.value; save(); };

            card.querySelector(".cmd-send-now").onclick = () => sendInteraction(cmd);
            card.querySelector(".cmd-delete").onclick = () => {
                cfg.commands.splice(index, 1);
                save();
                renderCommands();
            };

            container.appendChild(card);
        });
    }

    // Initialize UI
    async function init() {
        while (!document.body) await sleep(500);
        await sleep(1500);
        document.body.appendChild(panel);

        textarea = panel.querySelector("#log");

        // Bind shared fields
        const token = panel.querySelector("#token");
        const guild = panel.querySelector("#guild");
        const channel = panel.querySelector("#channel");
        const sessionId = panel.querySelector("#sessionId");

        token.value = cfg.token || "";
        guild.value = cfg.guild || "";
        channel.value = cfg.channel || "";
        sessionId.value = cfg.sessionId || "";

        token.oninput = () => { cfg.token = token.value.trim(); save(); };
        guild.oninput = () => { cfg.guild = guild.value.trim(); save(); };
        channel.oninput = () => { cfg.channel = channel.value.trim(); save(); };
        sessionId.oninput = () => { cfg.sessionId = sessionId.value.trim(); save(); };

        // Bind add command button
        panel.querySelector("#addCmdBtn").onclick = () => {
            const name = prompt("Enter command name (for example: hourly or daily):", "hourly");
            if (!name) return;

            cfg.commands.push({
                name: name,
                application: "",
                commandId: "",
                version: "",
                options: "[]",
                delay: 3600,
                enabled: true,
                sent: 0,
                lastSent: 0
            });
            save();
            renderCommands();
        };

        // Bind scheduler buttons
        panel.querySelector("#startAllBtn").onclick = () => startScheduler();
        panel.querySelector("#stopAllBtn").onclick = () => stopScheduler();

        // Render initial command list
        renderCommands();

        // Enable panel dragging
        const title = panel.querySelector("#title");
        let drag = false, ox = 0, oy = 0;
        title.onmousedown = e => {
            drag = true;
            ox = e.clientX - panel.offsetLeft;
            oy = e.clientY - panel.offsetTop;
        };
        document.onmousemove = e => {
            if (!drag) return;
            panel.style.left = (e.clientX - ox) + "px";
            panel.style.top = (e.clientY - oy) + "px";
            panel.style.right = "auto";
        };
        document.onmouseup = () => {
            return (drag = false);
        };

        log("Panel Loaded (Multi-Command Ready)");
    }

    init();
})();
