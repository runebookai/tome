# Changelog

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
