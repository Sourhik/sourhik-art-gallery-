# PhotoFrame — Full Stack Photo Gallery Platform

A production-grade, full-stack Photo Gallery platform built with **React**, **Node.js/Express**, and **MongoDB**. Featuring Instagram-Style Stories, Interactive Photo Puzzles, Digital Travel/Memory Boxes, and an executive standalone Admin Panel.

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────┐
                      │    MongoDB Database      │
                      │   (localhost:27017)      │
                      └────────────▲─────────────┘
                                   │
                      ┌────────────┴─────────────┐
                      │   Node.js + Express API  │
                      │     (Port: 5000)         │
                      └───────▲──────────▲───────┘
                              │          │
                 ┌────────────┘          └────────────┐
                 │                                    │
       ┌─────────┴──────────┐               ┌─────────┴──────────┐
       │   Main Website     │               │    Admin Panel     │
       │  React + Vite SPA  │               │ React + Vite SPA   │
       │    (Port: 5173)    │               │    (Port: 5174)    │
       └────────────────────┘               └────────────────────┘
```

---

## 🚀 Key Features

### 1. 📸 Photo Gallery & Albums
- High-resolution photo upload with category tagging, location, exposure info, and privacy controls.
- Dynamic categorization (Nature, Travel, Food, People, Architecture, Events, Animals, Sports).
- Rich album collections with custom covers, multi-photo assignment, and privacy toggles.
- Real-time likes, threaded comments, and universal content reporting.
- 5 Luxury Theme Engine (Dark Obsidian, Cyber Violet, Emerald Luxury, Sunset Gold, Clean Light).

### 2. 🎬 Instagram-Style Stories
- **Creation Studio**: Upload images/short clips, customizable text overlay, 10+ emoji stickers, location badges, audio/music tags, and customizable gradient backgrounds.
- **Horizontal Story Bar**: Gradient animated story rings indicating unseen vs seen status.
- **Full-Screen Story Viewer**: Segmented auto-progress bars, click/hold-to-pause, next/previous story & user navigation, viewer tracking, instant emoji reactions, and direct message replies.
- **24-Hour Auto-Expiry**: Real-time backend expiration calculation.
- **Story Highlights**: Archive expired/active stories into custom categorized collections (Travel, College, Friends, Mountains, Events).

### 3. 🧩 Photo Puzzles
- Convert any gallery photo into an interactive sliding tile puzzle.
- **3 Difficulty Tiers**: Easy (3×3), Medium (4×4), Hard (6×6).
- **Anti-Cheat Engine**: Backend verifies solvable move permutations, elapsed time, and calculates official server-side scores.
- **Interactive HUD**: Live move counter, stopwatch timer, and hint preview.
- **Global Leaderboard**: Tracks top solvers, rank, completion time, score, and moves.

### 4. 🧳 Collaborative Memory Boxes
- Comprehensive digital travel and milestone diaries (e.g. *"My First Darjeeling Trip"*).
- **Interactive Roadmap Timeline**: Chronological chapters with milestone dates, titles, descriptions, and photo attachments.
- **Collaborator Suite**: Invite fellow travelers as **Editors** or **Viewers** with fine-grained permission control.
- Social engagement with likes, comments, and direct shareable URLs.

### 5. 👑 Standalone Executive Admin Panel (`admin-panel/`)
- Dedicated executive dashboard connected directly to the same backend and database.
- **Role-Based Access Control**: `SUPER ADMIN`, `ADMIN`, and `MODERATOR`.
- **15 Management Modules**:
  1. **Dashboard**: 11 real-time KPI metrics, upload trends, and notification badges.
  2. **Photos**: Metadata editing, publish/unpublish, feature spotlight, and bulk delete.
  3. **Albums**: Album management, cover selection, and privacy management.
  4. **Stories**: Active vs. expired story audit, viewer counts, and moderation removal.
  5. **Puzzles**: Difficulty configuration, leaderboard audit, and puzzle disabling.
  6. **Memory Boxes**: Collaborator review, timeline verification, and spotlighting.
  7. **User Management**: Role changing, suspension, ban/unban, and password reset.
  8. **Comments**: Moderation, deletion, and flagged comment cleanup.
  9. **Reports Center**: Review submitted reports (Photo, Story, Comment, User, Memory Box, Puzzle) with actions (Warn User, Suspend User, Remove Content, Reject).
  10. **Categories**: Create, edit, and feature photography categories.
  11. **Homepage CMS**: Banner announcements, featured highlights, and trending creator spotlights.
  12. **Analytics**: Visual metric charts (7d, 30d, 90d, 1y).
  13. **Storage & Garbage Collector**: Server storage statistics, largest files, and safe orphaned file cleaner.
  14. **Activity Audit Logs**: Comprehensive administrative audit trail with timestamps and IP logging.
  15. **System Settings**: Site name, upload limits, video rules, story expiry, and maintenance toggle.

---

## 🔑 Demo Accounts & Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@photoframe.com` | `admin123` | Full Admin Panel & Main Website |
| **Admin** | `admin@photoframe.com` | `admin123` | Full Admin Panel & Main Website |
| **Moderator** | `moderator@photoframe.com` | `admin123` | Content & Report Moderation |
| **User (Alex)** | `alex@photoframe.com` | `password123` | Main Website |
| **User (Ankita)** | `ankita@photoframe.com` | `password123` | Main Website |
| **User (Bibek)** | `bibek@photoframe.com` | `password123` | Main Website |
| **User (Arnab)** | `arnab@photoframe.com` | `password123` | Main Website |

---

## 🛠️ How to Run Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017/photogallery` (or cloud MongoDB Atlas URI).

### 2. Start the Backend API (Port 5000)
```bash
cd backend
npm install
node src/utils/seedData.js   # Seed demo database with users, stories, puzzles & memory boxes
npm run dev                  # Starts server on http://localhost:5000
```

### 3. Start the Main React Website (Port 5173)
```bash
# In the project root:
npm install
npm run dev                  # Starts main frontend on http://localhost:5173
```

### 4. Start the Admin Panel (Port 5174)
```bash
# In the admin-panel directory:
cd admin-panel
npm install
npm run dev                  # Starts admin panel on http://localhost:5174
```

---

## 📡 REST API Summary

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/profile`
- **Photos**: `/api/photos` (GET, POST, PUT, DELETE), `/api/photos/:id/like`, `/api/photos/:id/comments`
- **Stories**: `/api/stories` (GET, POST), `/api/stories/:id/view`, `/api/stories/:id/react`, `/api/stories/:id/reply`, `/api/stories/highlights`
- **Puzzles**: `/api/puzzles` (GET, POST), `/api/puzzles/:id/complete`, `/api/puzzles/:id/leaderboard`
- **Memory Boxes**: `/api/memory-boxes` (GET, POST), `/api/memory-boxes/:id/entries`, `/api/memory-boxes/:id/collaborators`
- **Albums**: `/api/albums` (GET, POST, PUT, DELETE)
- **Reports**: `/api/reports` (GET, POST, PUT)
- **Categories**: `/api/categories` (GET, POST, PUT, DELETE)
- **Admin**: `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/analytics`, `/api/admin/storage`, `/api/admin/storage/clean-orphans`, `/api/admin/activity-logs`, `/api/admin/settings`