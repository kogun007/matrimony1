# 💍 LivePartner Matrimony Platform

A modern, full-stack Matrimony Platform built with reusable components, a persistent collapsible navigation system, PostgreSQL database engine, and REST API seeded with authentic Indian profiles (Jain caste & sub-castes).

---

## ✨ Key Features

- **📱 Collapsible Navigation System**:
  - Desktop Expanded (260px) & Collapsed Mini-Rail (78px) with hover tooltips and `Ctrl/Cmd + B` keyboard shortcut.
  - Mobile responsive drawer with touch backdrop.
  - State persistence across pages using `localStorage`.
- **🐘 PostgreSQL 16 Backend & REST API**:
  - Native schema, indexed tables (`age`, `height`, `sub_caste`, `city`, `score`).
  - Dynamic filtering, sorting, and search API endpoints.
  - Seeded with verified Indian Jain community candidate profiles across 7 sub-castes.
- **🔍 Advanced Partner Search**:
  - Live interactive Age & Height sliders with dynamic gradient tracks.
  - Candidate ID lookup and sub-caste dropdown.
  - Instant live filtering connected to the PostgreSQL API.
- **👥 Daily Matches Hub**:
  - Filter tabs (All Recommendations, Verified Only, Premium, >90% Match).
  - Quick Sort by Compatibility Score, Age, Height, or Name.
  - Interactive Bio modal & Express Interest micro-interactions.
- **👤 Member Profile & Preferences**:
  - Personal info, education, career, Kundali/astrology details, and partner preferences checklist with instant save.
- **💬 Messages & Connections**:
  - Received interests inbox and real-time chat interface.
- **⭐ Shortlisted Profiles**:
  - Client-synced bookmarks with empty state recovery.
- **🔐 Secure Authentication**:
  - Dynamic canvas-generated captcha verification with anti-distortion noise and password reveal toggle.
- **📋 Master Page Template (`template.html`)**:
  - Boilerplate blueprint for rapidly building new pages with the design system.

---

## 🗂️ Project Structure

```
Matrimony/
├── index.html               # Main Portal & Activity Dashboard
├── search.html              # Advanced Partner Search & Live Sliders
├── matches.html             # Daily Recommendations Hub
├── profile.html             # Member Profile & Kundali Preferences
├── messages.html            # Connections & Chat Inbox
├── shortlist.html           # Bookmarked Profiles
├── login.html               # Sign In with Dynamic Captcha
├── template.html            # Master Reusable Boilerplate
├── styles/
│   ├── tokens.css           # CSS Variables, Color Palette, Typography
│   ├── layout.css           # App Shell & Collapsible Sidebar Grid
│   └── components.css       # Buttons, Cards, Sliders, Modals, Toasts
├── js/
│   ├── components/
│   │   ├── navigation.js    # Collapsible Sidebar Navigation
│   │   ├── modal.js         # Candidate Quick-View Bio Modal
│   │   └── toast.js         # Toast Notification Manager
│   └── data/
│       └── candidates.js    # Client Database & API Connector
├── server/
│   ├── server.js            # Express REST API Server
│   ├── db.js                # PostgreSQL Connection, Schema & Indexes
│   └── seeds/
│       └── jain_profiles.js # Indian Jain Candidate Dataset
└── README.md
```

---

## 🚀 Quick Start

### 1. Start the PostgreSQL REST API Server
```bash
cd server
npm install
node server.js
```
*API will run at `http://localhost:3000`*

### 2. Start the Frontend Web App
In the project root directory:
```bash
python3 -m http.server 8080
```
*Open in your browser:*
- **Home / Dashboard**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Partner Search**: [http://localhost:8080/search.html](http://localhost:8080/search.html)
- **Matches**: [http://localhost:8080/matches.html](http://localhost:8080/matches.html)

---

## 🌐 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check PostgreSQL server health and candidate count |
| `GET` | `/api/candidates` | Search & filter candidates by age, height, sub-caste, city |
| `GET` | `/api/candidates/:id` | Fetch specific candidate profile by ID (e.g. `JAIN-1001`) |
| `GET` | `/api/subcastes` | List Jain sub-castes and their counts |
| `GET` | `/api/stats` | Summary metrics and top cities |
| `POST` | `/api/candidates` | Register a new candidate profile into PostgreSQL |

---

## 📜 License
MIT License. Built for the Matrimony Platform.
