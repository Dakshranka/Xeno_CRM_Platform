# Project : Campaign Management & Analytics Platform

## Overview
Project is a full-stack platform for managing, scheduling, and analyzing marketing campaigns across multiple channels (Email, SMS, Push). It provides real-time analytics, AI-powered insights, and flexible data ingestion for modern marketing teams.

---

## Functionalities

### 1. User Authentication
- Secure login via Google OAuth.
- JWT-based session management.
- Protected routes for authenticated users.

### 2. Campaign Management
- Create, edit, delete, and view campaigns.
- Support for multiple campaign types: Email, SMS, Push, Multi-channel.
- Audience targeting by segments and filters.
- Content editor for messages and templates.
- Real-time scheduling using Node.js (node-schedule).
- Manual and AI-powered scheduling suggestions.

### 3. Data Ingestion
- Upload customer and order data via API or UI.
- Validate and persist ingested data to MongoDB.
- Supports custom data sources and connectors.

### 4. Real-Time Analytics Dashboard
- Visualize campaign performance (delivered, opened, clicked) by day.
- Real-time metrics: Total Audience, Engagement Rate, AI Score.
- Audience segment distribution and demographics.
- Device usage and best engagement times.
- Export reports and compare campaigns.

### 5. Engagement Simulation
- Simulate open and click events for campaigns via frontend buttons.
- Instantly updates engagement rate, open rate, and click rate in analytics.

### 6. AI-Powered Insights
- Smart scheduling recommendations using Gemini AI.
- Audience lookalike generation.
- Auto-tagging campaigns based on content and audience.

### 7. Backend API
- RESTful endpoints for campaigns, analytics, data ingestion, and simulation.
- Real-time stats aggregation for dashboard.
- Secure endpoints with JWT middleware.

### 8. Frontend Features
- Modern React UI with Tailwind CSS.
- Context-based state management for campaigns, data, and auth.
- Instant analytics refresh after campaign actions.
- Responsive design for desktop and mobile.

---

## Getting Started
1. Clone the repository and install dependencies:
   ```sh
   git clone <repo-url>
   cd project
   npm install
   cd backend
   npm install
   ```
2. Set up your `.env` files for backend and frontend.
3. Start backend and frontend servers:
   ```sh
   cd backend
   node src/server.js
   cd ../
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

---

## Folder Structure
- `/backend` - Node.js/Express API, MongoDB models, scheduling, and services.
- `/src` - React frontend, contexts, pages, and components.
- `/public` - Static assets and index.html.

---

## Contribution & Support
- Open issues for bugs or feature requests.
- PRs welcome for improvements and new features.
- See code comments and API docs for integration details.

---

## License
MIT
