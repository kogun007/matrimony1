# 💍 LivePartner Matrimony Platform

> 🚀 **Live Website on GitHub Pages**: [https://kogun007.github.io/matrimony1/](https://kogun007.github.io/matrimony1/)

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
- **🕒 Recently Viewed Profiles**:
  - Automatically records inspected candidate profiles with clear history action.
- **👤 Member Profile & Preferences**:
  - Personal info, education, career, Kundali/astrology details, and partner preferences checklist with instant save.
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
├── recently-viewed.html     # Recently Inspected Candidate Profiles
├── profile.html             # Member Profile & Kundali Preferences
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
*Prerequisite: Node.js 22 (LTS) or higher*

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
- **Recently Viewed**: [http://localhost:8080/recently-viewed.html](http://localhost:8080/recently-viewed.html)

---

## 🌐 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check PostgreSQL server health and candidate count |
| `GET` | `/api/candidates` | Search & filter candidates by age, height, sub-caste, city |
| `GET` | `/api/candidates/:id` | Fetch candidate profile by ID; enforces **dual limit: 75 views & 3 months validity from profile creation** & locks contact details once exceeded |
| `GET` | `/api/user-quota` | Check current user's profile view count, 3-month profile validity status, and remaining days |
| `POST` | `/api/user-quota/reset` | Reset user's profile view count & renew 3-month validity (demo/testing) |
| `POST` | `/api/user-quota/simulate-limit` | Simulate reaching maximum 75 profile views (demo/testing) |
| `POST` | `/api/user-quota/simulate-expiry` | Simulate 3-month profile validity expiration from creation date (demo/testing) |
| `GET` | `/api/subcastes` | List Jain sub-castes and their counts |
| `GET` | `/api/stats` | Summary metrics and top cities |
| `POST` | `/api/candidates` | Register a new candidate profile into PostgreSQL |
| `GET` | `/api/admin/candidates` | Admin search and filter candidate profiles with unredacted details |
| `GET` | `/api/admin/candidates/:id` | Admin fetch single profile details by ID with viewer metrics |
| `POST` | `/api/admin/candidates` | Admin create candidate profile with auto ID generation and validation |
| `PUT` | `/api/admin/candidates/:id` | Admin update candidate profile attributes |
| `DELETE` | `/api/admin/candidates/:id` | Admin delete candidate profile with cascade cleanup of profile views |
| `GET` | `/api/admin/stats` | Admin metrics (gender ratio, verified count, total views, sub-caste counts) |

---

## 📜 License
MIT License. Built for the Matrimony Platform.
