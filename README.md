
<div align="right">
  <details>
    <summary >🌐 Language</summary>
    <div>
      <div align="right">
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=en">English</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=zh-CN">简体中文</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=zh-TW">繁體中文</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=ja">日本語</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=ko">한국어</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=hi">हिन्दी</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=th">ไทย</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=fr">Français</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=de">Deutsch</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=es">Español</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=it">Itapano</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=ru">Русский</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=pt">Português</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=nl">Nederlands</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=pl">Polski</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=ar">العربية</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=fa">فارسی</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=tr">Türkçe</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=vi">Tiếng Việt</a></p>
        <p><a href="https://openaitx.github.io/view.html?user=runebookai&project=tome&lang=id">Bahasa Indonesia</a></p>
      </div>
    </div>
  </details>
</div>

# Tome - Magical AI Spellbook

<img src="static/images/repo-header.png" alt="Tome" />

<p align="center">
    <code>a magical desktop app that puts the power of LLMs and MCP in the hands of everyone</code>
</p>

<p align="center">
    <a href="https://discord.gg/9CH6us29YA" target="_blank"><img src="https://img.shields.io/discord/1365100902561742868?logo=discord&logoColor=fff&label=Join%20Us!&color=9D7CD8" alt="Join Us on Discord" /></a>
    <a href="https://opensource.org/licenses/Apache-2.0" target="_blank"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0" /></a>
    <a href="https://github.com/runebookai/tome/releases" target="_blank"><img src="https://img.shields.io/github/v/release/runebookai/tome" alt="GitHub Release" /></a>
</p>

<p align="center">
    🔮 Download the Tome Desktop App: <a href="https://github.com/runebookai/tome/releases/download/0.6.0/Tome_0.6.0_x64-setup.exe">Windows</a> | <a href="https://github.com/runebookai/tome/releases/download/0.6.0/Tome_0.6.0_aarch64.dmg">MacOS</a>
</p>

# Tome

Tome is a desktop app that lets **anyone** harness the magic of LLMs and MCP. Download Tome, connect any local or remote LLM and hook it up to thousands of MCP servers to create your own magical AI-powered spellbook.

🫥 Want it to be 100% local, 100% private? Use Ollama and Qwen3 with only local MCP servers to cast spells in your own pocket universe. ⚡ Want state of the art cloud models with the latest remote MCP servers? You can have that too. It's all up to you!

🏗️ This is a Technical Preview so bear in mind things will be rough around the edges. [Join us on Discord](https://discord.gg/9CH6us29YA) to share tips, tricks, and issues you run into. Star this repo to stay on top of updates and feature releases!

## 🪄 Features

- 🧙 **Streamlined Beginner Friendly Experience**
  - Simply download and install Tome and hook up the LLM of your choice
  - No fiddling with JSON, Docker, python or node
- 🤖 **AI Model Support**
  - **Remote**: Google Gemini, OpenAI, any OpenAI API-compatible endpoint
  - **Local**: Ollama, LM Studio, Cortex, any OpenAI API-compatible endpoint
- 🔮 **Enhanced MCP support**
  - UI to install, remove, turn on/off MCP servers
  - npm, uvx, node, python MCP servers all supported out of box
- 🏪 **Integration into [Smithery.ai](https://smithery.ai) registry**
  - Thousands of MCP servers available via one-click installation
- ✏️ **Customization of context windows and temperature**
- 🧰 **Native support for tool calls and reasoning models**
  - UI enhancements that clearly delineate tool calls and thinking messages

## Demo

https://github.com/user-attachments/assets/0775d100-3eba-4219-9e2f-360a01f28cce

# Getting Started

## Requirements

- MacOS or Windows (Linux coming soon!)
- LLM Provider of your choice: [Ollama](https://ollama.com/) or [Gemini API key](https://aistudio.google.com/app/apikey) are easy/free
- [Download the latest release of Tome](https://github.com/runebookai/tome/releases)

## Quickstart

1. Install [Tome](https://github.com/runebookai/tome/releases)
2. Connect your preferred LLM provider - OpenAI, Ollama and Gemini are preset but you can also add providers like LM Studio by using http://localhost:1234/v1 as the URL
3. Open the MCP tab in Tome and install your first [MCP server](https://github.com/modelcontextprotocol/servers) (Fetch is an easy one to get started with, just paste `uvx mcp-server-fetch` into the server field).
4. Chat with your MCP-powered model! Ask it to fetch the top story on Hacker News.

# Vision

We want to make local LLMs and MCP accessible to everyone. We're building a tool that allows you to be creative with LLMs, regardless
of whether you're an engineer, tinkerer, hobbyist, or anyone in between.

## Core Principles

- **Tome is local first:** You are in control of where your data goes.
- **Tome is for everyone:** You shouldn't have to manage programming languages, package managers, or json config files.

## What's Next

We've gotten a lot of amazing feedback in the last few weeks since releasing Tome but we've got big plans for the future. We want to break LLMs out of their chatbox, and we've got a lot of features coming to help y'all do that.

- Scheduled tasks: LLMs should be doing helpful things even when you're not in front of the computer.
- Native integrations: MCP servers are a great way to access tools and information, but we want to add more powerful integrations to interact with LLMs in unique. ways
- App builder: we believe long term that the best experiences will not be in a chat interface. We have plans to add additional tools that will enable you to create powerful applications and workflows.
- ??? Let us know what you'd like to see! Join our community via the links below, we'd love to hear from you.

# Community

[Discord](https://discord.gg/9CH6us29YA) [Blog](https://blog.runebook.ai) [Bluesky](https://bsky.app/profile/gettome.app) [Twitter](https://twitter.com/get_tome) 
