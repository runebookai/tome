# Changelog

## 0.13.0 - 2025-10-20

### New Features

- Syntax highlights code within User input
- MCP server commands now support `uv`

## 0.12.5 - 2025-09-30

### Fixes

- Fixes issue where Tome shows Smithery MCP servers it's not capable of running.

## 0.12.4 - 2025-09-24

### Fixes

- Smithery seems to have removed their `is:local` query filter in the API,
  resulting in Tome's Smithery tab being broken. - This change removes that filter

## 0.12.3 - 2025-09-18

### Fixes

- Fixes an issue with saving MCP servers for Apps/Relays
- Fixes ordering issue with App/Relay MCP servers

## 0.12.2 - 2025-09-12

### Fixes

- Adds /update to Svelte route list for build 🙃

## 0.12.1 - 2025-09-12

### Fixes

- Fixes an issue where the update modal doesn't display on startup

## 0.12.0 - 2025-09-12

### Improvements

- Apps now use a single LLM for all steps
    - You can change the model an App uses on import
- Added "Manual" trigger for Apps
- Made Session->McpServer associations explicit in the database
- Added gpt-5, gemini-2.5-pro, gemini-2.5-flash-lite, gemini-2.0-flash-lite
- Removed gemini-1.5-pro

## 0.11.0 - 2025-09-08

### New Features

- Import & Export Apps
    - You can now export Apps to share with other folks
    - Exported Apps generate a URL that opens Tome and installs the App
      directly.

### Improvements

- Improved onboarding to help setup LLMs and MCP servers

### Fixes

- Fixes issue with certain App (Trigger) fields not saving

## 0.10.0 - 2025-08-22

### New Features

- Introducing Apps
    - Create Apps with any model, MCP server(s), and prompt(s). Apps can be scheduled or triggered by Filesystem events.
    - We'll be building out a ton of powerful features around Apps in the coming
      weeks/months/millennia, so stay tuned.
    - If you were using Tasks before, they have become Apps using the
      "scheduled" Trigger.
- Introducing Relays
    - Relays allow you to interact with your LLMs and MCP servers through
      external chat applications. Currently Tome support Telegram.
- Labs
    - Experimental features are now going to be available when Tome is in Labs
      Mode.
    - To enable this, do so in Settings.
    - Relays are currently in Labs.

### Improvements

- Redesigned LLM dropdowns in chat and app creation
- Redesigned "forms" through the app
- Introduced tooltips for nav and form labels

### Fixes

- Fixes various Light Mode color issues
    - Toggles
    - Chat progress dots
    - Syntax highlighting

## 0.9.3 - 2025-07-28

### New Features

- Added support for [iMCP](https://github.com/mattt/iMCP) (macos only)

### Misc

- Added a View Logs button to the settings page

## 0.9.2 - 2025-07-07

### Fixes

- Fixed issue with scrollbars rendering empty space in lists
- Silenced various Svelte warnings
- Fixed issue where double dashes were being replaced with an emdash in inputs
  (caused any MCP commands with flags to not work)
- Ensure the User's selected colorscheme is applied on startup
- Ensure the content area on all tabs is scrollable

### Refactors

- Refactored the `Setting` model to behave the same as `Config` (static
  properties that both getters/setters)

### Misc

- Updated Gemini models to the currently available ones

## 0.9.1 - 2025-07-06

### Fixes

- Fix Smithery MCP install from in-app

## 0.9.0 - 2025-07-03

### 🎉 BIG CHANGES 🎉

- INTRODUCING Scheduled Tasks
    - Schedule prompts to run automatically hourly or at a specific time every day.
    - Use all your favorite MCP Servers.
    - Use any model
- Light Mode! Huge thanks to @bneil for contributing a System/Light/Dark Mode to
  Tome! Choose your theme in Settings.

### Fixes

- Fixed text formatting issue with welcome modal on smaller resolutions
- Removed MSI Windows installer due to problems with auto-update. Use the NSIS
  exe 🙂
- Fixed issue where certain OpenAI-compatible Engines would error out if you
  passed an empty array of `tools`.

## 0.8.1 - 2025-06-27

### Fixes

- Reverted MSI removal – it's causing the Windows build to fail. Unsure why.

## 0.8.0 - 2025-06-27

### New Features

- Ability to rename MCP servers

### Improvements

- Improved error handling a bit, when adding MCP servers

### Misc

- Removed MSI Windows installer

> [!IMPORTANT]
> If you previously installed on Windows via the MSI installer, you MUST
> reinstall using the `.exe`

## 0.7.0 - 2025-06-13

### New Features

- Customizable System Prompt (in settings)

### Fixes

- Correctly handle shell arguments with quotes

### Refactors

- Refactored models to be sane. They're now just instances of classes. No more
  "static everything".

### Fixes

- Fixes false negetive issue when validating Engines

## 0.6.2 - 2025-06-03

### Fixes

- Fixes false negetive issue when validating Engines

## 0.6.1 - 2025-06-03

### Fixes

- Fixed issue causing infinite errors when Ollama not configured

## 0.6.0 - 2025-05-30

### New Features

- Engines reworked to support any OpenAI API-compatible engine – eg. vLLM or
  Cortex.cpp
- Supports MCP servers using `node`, `python`, and `bunx` now.

### Improvements

- Improved Tool Call UI
    - Arguments are truncated in the single line preview to prevent a multi-line
      preview
    - Expanded Tool Call UI now explicitly shows the Arguments passed to the MCP
      server as well as the result
- Syntax highlighting added to Chat
- Window position and size preserved through restarts
- Redesigned Settings tab to support Engines more explicitly

### Refactors

- Rewrote most of the Engine code to support arbitrary OpenAI API-compatible
  engines.
- Prettier-ified codebase

### Fixes

- Fixed issue with user messages overflowing chat area

## 0.5.0 - 2025-05-22

![developers developers developers](https://github.com/runebookai/tome/blob/9dcb808e2fadceb9710e9c77843dcb06640c90b1/.github/images/bill.png)

### 🎉 Big Changes 🎉

- Windows Support
- OpenAI Models support
- Gemini Models support

### New Features

- Default model setting (star the model you want as your default on the Models page)
- `node`, `python`, and `bunx` MCP servers now supported.

### Minor Changes

- Page transitions added
- Model selection dropdown organizes models by engine
- Model page organizes models by engine
- All requests made from the frontend are proxied through a Rust function to mitigate CORS issues.
- Release workflow now builds for MacOS and Windows.

### Misc. Changed / Refactoring

- Moved all types from `.d.ts` files into explicit `types.ts` in their corresponding place.
- Refactored `Config` to be database-backed, instead of file-backed, to be consistent with the rest of the app.
- Refactored LLM engines code into a more modular setup to support multiple engines more cleanly.
- Switched from tabs to spaces and ran prettier. Tabs were unintentional 🙃

## 0.4.0 - 2025-05-16

Adds in-app update notifications and update process. We no longer have to download new
releases from Github every time. Hooray! 🎉

## 0.3.3 - 2025-05-13

### Fixes

- Fixed build script to include updater JSON
- Fixed build script to pull changelog from CHANGELOG.md

## 0.3.2 - 2025-05-09

### Fixes

- Fixes issue with deep link URLs. Turns out VSCode abuses them even more and uses no // in the scheme. So `tome:` instead of `tome://` for us. 🙃

## 0.3.1 - 2025-05-09

### Fixes

- Changed MCP Server deep link to conform to VSCode style urls, to support magic link installs via Smithery. New deep link URL format:
    - eg. `tome://mcp/install?{urlencoded-payload}`

## 0.3.0 - 2025-05-08

_Big Smithery integration to make using MCP even easier 🎉_

### Added

- Smithery registry browsing, searching, and installation.
- MCP Server installation deep-links.
    - `tome://install-mcp-server?payload={payload}`
    - See: https://github.com/runebookai/tome/blob/main/ARCHITECTURE.md#deep-links
- Added slide controls for deleting list items (a la iOS)
- Replaced hamburger menus in lists with right-click context menus

### Refactored

- Revamped MCP Server management UI and configuration

### Fixes

- Changed MCP Server routes to be by id instead of name to prevent UI issues when you have two of the same server with different configurations.
- Fixed issue with scrollbar styling on some machines

## 0.2.0 - 2025-05-02

### Added

- Links to initial Tome release to README
- Proactively install Node/Python on boot
- Allow nightly build on demand
- Session configuration (context window + temp)
- Tool Calls chat log UI

### Fixes

- Fixes load error when model has been removed

## 0.1.0 - 2025-04-25

_First release 🎉_
