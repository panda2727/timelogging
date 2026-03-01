# Time Logger

A mobile-first Progressive Web App for logging daily time across five life categories — synced in real time across all your devices.

> **Screenshot:** drop a capture of the app into `docs/screenshot.png` and the image below will appear automatically.
> ![Time Logger screenshot](docs/screenshot.png)

---

## Features

| Feature | Details |
|---|---|
| **Voice input** | Speak a full entry — all fields auto-fill via the browser's Web Speech API. No API key needed. |
| **Multi-device sync** | Firestore real-time updates — changes appear instantly on every device. |
| **Offline support** | PWA service worker caches the app. Works without internet; syncs on reconnect. |
| **Date navigation** | Browse and log entries for any past or future date with ← / → buttons. |
| **Analytics** | Category & sub-category time breakdowns with progress bars — today, last 7 days, or a custom date range. |
| **Edit & delete** | Inline editing with an amber highlight state; per-entry delete. |
| **Secure auth** | Email/password sign-in via Firebase Auth — data is isolated per user. |

---

## Voice Input

Say a phrase using the keyword landmarks in order:

```
from 8 am  to 9 am  category self  sub-category workout  description running
  ↓            ↓          ↓               ↓                    ↓
start time  end time  category      sub-category           description
```

The parser handles digits or word numbers (`eight`, `nine`), am/pm, `noon`, `midnight`, and spoken "colon" (`category colon self` → category: self).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Build | Vite 7 |
| Backend | Firebase Firestore + Firebase Auth |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| Testing | Vitest (15 unit tests for voice parser) |
| Deploy | Firebase Hosting |

---

## Local Development

```bash
git clone https://github.com/panda2727/timelogging.git
cd timelogging
npm install
cp .env.example .env   # fill in your Firebase project keys
npm run dev            # http://localhost:5173
npm test               # run unit tests
npm run build          # production build
```

### Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** and **Authentication** (Email/Password)
3. Copy the project config into `.env`

---

## Deploy

```bash
npm run build
firebase deploy --only hosting
```
