🚍 Central Hub Report System (Private)

Internal web system for managing bus operations, issue reporting, and analytics tracking.

«⚠️ This repository is private. Not intended for public use or distribution.»

---

📌 Overview

This system is designed to:

- Capture bus-related issues route-wise
- Store reports securely using JSONBin
- Provide analytics dashboard for monitoring activity
- Separate fleet data and report data for better control

---

🧠 System Architecture

Frontend (HTML/JS)
   ↓
Cloudflare Pages Functions (API Layer)
   ↓
JSONBin (Data Storage)

---

⚙️ Core Components

1. Report Builder ("index.html")

- Input form for route-wise issues
- Supports Morning / Evening modes
- Generates structured report data
- Sends data to backend API

---

2. Analytics Dashboard ("analytics.html")

- Displays:
  - Total reports
  - Route activity
  - Trends
  - Morning vs Evening split
- Fetches data from API and renders UI

---

3. Fleet Management ("Fleet.js")

- Loads fleet data (busMaster, excluded buses)
- Used for validation / filtering logic

---

4. Backend APIs (Cloudflare Functions)

Located in:

/functions/api/

APIs:

- "/api/data"
  
  - Fetches:
    - Fleet data
    - Analytics data

- "/api/save"
  
  - Stores new report entry into JSONBin

- "/api/fleet"
  
  - Returns fleet configuration data

- "/api/db"
  
  - Advanced read/write endpoint (optional usage)

---

🗄️ Data Structure

Fleet Bin (JSONBin)

{
  "busMaster": ["BUS101", "BUS102"],
  "excludedBuses": ["BUS999"],
  "savedAt": "timestamp"
}

---

Analytics Bin (JSONBin)

[
  {
    "routes": {
      "T-LP": "Issue text",
      "T-BKC": ""
    },
    "mode": "morning",
    "timestamp": "ISO string"
  }
]

---

🔄 Data Flow

Report Save Flow

User Input (Builder)
   ↓
POST /api/save
   ↓
Fetch existing data from JSONBin
   ↓
Append new entry
   ↓
Save back to JSONBin

---

Analytics Load Flow

Analytics Page
   ↓
GET /api/data
   ↓
Fetch:
   - Fleet Bin
   - Analytics Bin
   ↓
Render UI

---

🔐 Environment Variables

Configured in Cloudflare:

JSONBIN_API_KEY
JSONBIN_BIN_ID
JSONBIN_FLEET_BIN_ID

---

⚠️ Important Implementation Rules

- Always use:

/api/...

- Never use:

/.netlify/functions/...

- API keys must remain in Cloudflare (never frontend)

- Redeploy required after env updates

---

🛠️ What You Can Do With This System

Operational

- Track daily bus issues
- Separate Morning / Evening reporting
- Maintain fleet list and exclusions

Analytics

- Identify most active routes
- Monitor issue trends
- Compare shift performance

Automation Ready

- Can integrate:
  - Telegram reporting
  - CSV export
  - Auto alerts
  - Google Sheets sync

---

🚧 Current Limitations

- No authentication (internal use only)
- JSONBin used as storage (not scalable for heavy load)
- No real-time updates (manual refresh required)

---

🔮 Possible Enhancements

- Role-based login system
- Real-time dashboard updates
- Advanced filtering (date, route, mode)
- Chart.js integration
- Automated notifications

---

🧑‍💻 Internal Notes

- Functions must remain in "/functions/api/"
- Ensure correct API routing before debugging UI
- If data not loading → check:
  - API endpoint
  - Env variables
  - JSONBin response

---

📍 Status

System is functional with:

- Data input ✔
- Data storage ✔
- Data retrieval ✔
- UI rendering ✔

---

👤 Maintained By

Akshay
