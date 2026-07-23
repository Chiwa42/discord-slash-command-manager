# Discord Multi-Slash Command Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Userscript](https://img.shields.io/badge/userscript-Tampermonkey%20%2F%20Violentmonkey-blue)](commandManager.user.js)
[![Discord](https://img.shields.io/badge/platform-Discord-5865F2)](https://discord.com/)

> [!WARNING]
> This userscript automates actions from a Discord user account. Automation that behaves like a self-bot may violate Discord's Terms of Service and can result in account restrictions or termination.
>
> USE AT YOUR OWN RISK.

Discord Multi-Slash Command Manager is a browser userscript that adds a floating control panel to Discord Web. It lets you save multiple slash command interaction payloads and send them manually or on a repeating interval.

This project is intended for personal experimentation and learning. You are responsible for how you use it.

---

## Installation

1. Install a userscript manager if you do not already have one:
   - [Tampermonkey](https://www.tampermonkey.net/) 
2. Open the userscript file:
   - [commandManager.user.js](https://greasyfork.org/en/scripts/588252-discord-multi-slash-command-manager)
3. Install it through your userscript manager.
4. Open [Discord Web](https://discord.com/) in your browser.

---

## Usage

1. Open Discord in the browser.
2. Wait for the `Discord Multi Slash Manager` panel to appear.
3. Fill in the connection settings:
   - `User Token`
   - `Guild ID`
   - `Channel ID`
   - `Session ID`
4. Click `Add Command`.
5. Configure the command:
   - `App ID`
   - `Cmd ID`
   - `Version`
   - `Interval (s)`
   - `Options JSON`
6. Click `Send Now` to send one request immediately.
7. Click `Start Scheduler` to repeatedly send enabled commands based on their interval.
8. Click `Stop Scheduler` to stop the loop.

The panel can be dragged by its title bar.

---

## Field Reference

> [!CAUTION]
> Your `Authorization` header value is your Discord user token. Do not share it.

Open Discord Web, press `F12`, and use the `Network` tab to inspect requests.

Connection settings:

- `User Token`: select any `POST` request, such as typing status, sending a message, or using a slash command. Open `Headers` and copy the `Authorization` value.
- `Guild ID`: use any slash command, wait until it is sent, find the `interactions` request, then check the request payload or parameters for `guild_id`.
- `Channel ID`: from the same `interactions` request, use `channel_id`.
- `Session ID`: from the same `interactions` request, use `session_id`.

Command settings:

- `App ID`: from the `interactions` request, use `application_id`.
- `Cmd ID`: from the `interactions` request data, use `id`.
- `Version`: from the `interactions` request data, use `version`.
- `Interval (s)`: how many seconds to wait between automatic sends.
- `Options JSON`: required only for commands that have required fields or options.

---

## Command Options

`Options JSON` should be a valid JSON array matching Discord's slash command option structure.

Example:

```json
[
  {
    "type": 3,
    "name": "message",
    "value": "hello"
  }
]
```

If a command does not require options, leave it as:

```json
[]
```

---

## Important Token Warning

> [!CAUTION]
> Never share your Discord user token.

Anyone with your token may be able to access your account. Do not post screenshots, logs, browser storage, or script configuration that contains your token.

If your token is exposed:

1. Log out of Discord from the browser where the token was taken.
2. Change your Discord password.
3. Enable two-factor authentication.
4. Review active sessions and connected apps.

---

## Security Concerns

Userscripts run inside your browser and can access pages they are allowed to run on. Only install scripts that you trust and can inspect.

This script stores configuration through the userscript manager storage API. Treat that stored data as sensitive because it may include your Discord token and command identifiers.

---

## Disclaimer

THE SOFTWARE AND ALL INFORMATION HERE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

By using this project, you agree that you are responsible for any actions performed with it.

---

## License

MIT License. See [LICENSE](LICENSE).
