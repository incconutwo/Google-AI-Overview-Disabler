# Google AI Overview Disabler

A lightweight Chrome extension that automatically switches Google searches to "Web" results, disabling AI Overview.

## How It Works

The extension adds `udm=14` to Google search URLs, which forces the classic "Web" results without AI-generated content.

**Before:** `google.com/search?q=hello`  
**After:** `google.com/search?udm=14&q=hello`

## Features

- ⚡ **Efficient** - Uses Chrome's `declarativeNetRequest` API (network-level, no page scripts)
- 🎛️ **Toggle** - Enable/disable with one click
- 🎨 **Clean UI** - Google-inspired design

## Installation

1. Download or clone this repository
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the extension folder

## Screenshots

Click the extension icon to toggle the redirect:

| Enabled | Disabled |
|---------|----------|
| ✅ All Google searches redirect to Web results | ❌ Normal Google search behavior |

## License

MIT

---

<p align="center">made by <a href="https://x.com/tnemoroccan">@tnemoroccan</a></p>
