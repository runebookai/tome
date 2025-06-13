# Changelog

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
