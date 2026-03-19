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

# Fleet Adjustment System
### v3.0 — Dual-Shift Algorithm

Automates bus assignment for partial fleet adjustments. Matches buses from Row Data to Partial Fleet slots based on route, time, and shift — separately for Morning and Evening.

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Shift Detection](#2-shift-detection-automatic)
3. [Tab 01 — Row Data](#3-tab-01--row-data)
4. [Tab 02 — Partial Fleet](#4-tab-02--partial-fleet)
5. [Tab 03 — Bus Master](#5-tab-03--bus-master)
6. [The Algorithm](#6-the-adjustment-algorithm)
7. [Tab 04 — Output](#7-tab-04--output)
8. [Copy Output](#8-copy-output)
9. [Typical Daily Workflow](#9-typical-daily-workflow)
10. [Common Scenarios](#10-common-scenarios)
11. [Export Options](#11-export-options)

---

## 1. System Overview

The system has 4 tabs that work in sequence:

| Tab | Purpose |
|-----|---------|
| **01 — Row Data** | Paste today's actual operational fleet (all buses running today, morning + evening combined) |
| **02 — Partial Fleet** | Paste the partial fleet data that needs to be adjusted/corrected |
| **03 — Bus Master** | Permanent registry of all buses and their known routes. Used as fallback when row data has no match |
| **04 — Output** | Run the adjustment and see Morning / Evening results side by side. Copy formatted output. |

> **Key Concept:** Row Data = what buses are actually running today. Partial Fleet = what was scheduled (may be wrong). The system fixes Partial Fleet using Row Data.

---

## 2. Shift Detection (Automatic)

The system automatically detects Morning or Evening shift from the time in each entry:

| Shift | Time Range |
|-------|-----------|
| 🌅 **Morning** | 6:00 AM to 10:59 AM |
| 🌆 **Evening** | 3:00 PM to 10:00 PM |
| **Unknown** | Any time outside these ranges |

> **Important:** Morning row data is only used for Morning partial fleet slots. Evening row data is only used for Evening partial fleet slots. The two shifts do not mix.

> **Tip:** A bus can appear in both Morning and Evening row data with different routes. For example: C123 does Chembur-BKC in the morning and Thane-Sobo in the evening. Paste both entries in Row Data and the system handles them separately.

---

## 3. Tab 01 — Row Data

Row Data is today's actual operational fleet. Paste morning and evening data together in one go.

### Data Format

Each bus entry follows this structure (one item per line):

```
Chembur - Bkc       ← Main Route Header (city phrase or with dash)
C317                ← Bus Number
ALL                 ← Route Code
23/27               ← Load — automatically skipped
8:30 AM             ← Time / Slot
```

### Supported Route Codes

`ALL`, `HNMN` (or `HN MN`), `NTH` (or `NTH EXP`), `KLS` (or `KLS EXP`), `VV` (or `VV EXP`), `LBS`, and any other route name.

Auto-normalised: `HN MN → HNMN`, `NTH EXP → NTH`, `KLS EXP → KLS`

### Steps
1. Paste raw data into the text area (morning + evening together)
2. Click **Clean Data**
3. Verify the cleaned table — Shift badge, Main Route, Bus, Route, Time shown per row
4. Delete any incorrect rows if needed

---

## 4. Tab 02 — Partial Fleet

Partial Fleet contains the slots that need adjustment — buses that are scheduled but may be wrong or mismatched.

### Steps
1. Paste raw data in same format as Row Data (morning + evening together)
2. Click **Parse Fleet**
3. Excluded buses are automatically skipped during parsing
4. Each row is editable — you can change Time, Route, Bus, Main Route, Notes directly

> The Shift badge auto-updates when you change the time in a row.

> You can also add blank rows manually using **+ Add Row** and fill them in.

---

## 5. Tab 03 — Bus Master

Bus Master is a permanent knowledge base. It stores which routes each bus is capable of running. Used as fallback when Row Data has no matching bus for a slot.

### Adding a Bus

Fill in the form:
- **Bus Number** — e.g. C223 (required)
- **Main Route Group** — auto-populated from Row Data
- **Known Routes** — comma separated, e.g. `HNMN, ALL, NTH`
- **Driver Base / Depot** — optional, e.g. Thane, Kurla

### Excluded Buses

Buses in the Excluded section are permanently skipped during adjustment. Use this for buses that are broken down, in maintenance, or otherwise unavailable.

You can exclude a bus by:
- Typing the bus number in the Excluded section and clicking **Add**
- Clicking the **Exclude** button next to any bus in the registry table

> **Important:** Excluded buses are never assigned to any slot, even if they are a perfect match.

### When is Bus Master Used?

Bus Master is only used as a **fallback** — only when Row Data has no matching bus for a slot. The system checks Bus Master for buses whose known routes include the required route, and who are available in Row Data today.

> **Key Rule:** A bus must be present in Row Data to be eligible for assignment — even via Bus Master fallback. If a bus is not in Row Data, it is not available today.

---

## 6. The Adjustment Algorithm

When you click **Run Adjustment**, the system processes each slot in Partial Fleet independently using this priority order:

| Priority | Name | Description |
|----------|------|-------------|
| **P1** | Original Bus Retained | Partial fleet bus exists in row data + not excluded → mandatory use, no change |
| **P2** | Same Time Match | Row data has a bus with exact same route + same time → perfect match |
| **P3** | Different Time Match | Row data has a bus with exact same route but different time → similar match |
| **P4** | Bus Master Fallback | No row data match found → check Bus Master known routes for an available bus |
| **P5** | Unassigned | No match found anywhere → slot remains unassigned |

### Slot-First Logic

The **slot** (Time + Route + Main Route) is the center of the algorithm — not the bus. The system asks: *"Which bus from Row Data best fits this slot?"* The bus listed in Partial Fleet is just a preference, not a requirement.

### Shift Isolation

Morning slots only match against Morning row data. Evening slots only match against Evening row data.

### Same Bus, Two Shifts

If C123 appears in both Morning and Evening row data (possibly with different routes), it can be assigned to slots in both shifts independently. Used-bus tracking is per-shift, so there is no conflict.

### Non-Ops Buses

Any bus in Row Data that was not assigned to any slot in that shift becomes a **Non-Op**. Non-Ops are shown in the output and included in Copy Output under the NON OPS section.

---

## 7. Tab 04 — Output

Results are shown side by side — Morning on the left, Evening on the right.

### Stats Bar
Shows: Total Slots, Perfect matches, Similar matches, Unassigned slots, Non-Ops count, Morning count, Evening count.

### Result Table Columns

| Column | Meaning |
|--------|---------|
| Slot | Time from Partial Fleet |
| Route | Route from Partial Fleet |
| Orig Bus | Bus originally in Partial Fleet |
| Assigned | Bus assigned by the algorithm |
| Match | Perfect / Similar / Unassigned |

### Match Type Colors

- 🟢 **Green border** — Perfect match (same time + same route, or original bus retained)
- 🟡 **Yellow border** — Similar match (same route, different time, or Bus Master fallback)
- ⚫ **Gray border** — Unassigned (no match found)

---

## 8. Copy Output

Click **Copy Output** to copy a formatted text summary to clipboard. Designed for WhatsApp and Telegram where `**text**` renders as bold.

### What is Included

- Title: `**Partial Fleet Readiness**`
- **MORNING** section — changed slots only
- **EVENING** section — changed slots only
- **REPLACEMENT BUSES** list per shift
- **UNASSIGNED** slots per shift (if any)
- **NON OPS** section at end — all buses comma separated, 6 per line

### What is Excluded

Slots where the original bus was **retained unchanged are not shown**. Only changes, replacements, and problems are reported.

### Sample Output Format

```
**Partial Fleet Readiness**

**MORNING**
────────────────────────────────────────

**CHEMBUR - BKC**
C227 7:00 AM NTH

**REPLACEMENT BUSES**
C133 → C227

**EVENING**
────────────────────────────────────────

**THANE SOUTH MUMBAI**
C140 4:45 PM HNMN

**NON OPS**
────────────────────────────────────────
C06,C11,C111,C132,C147,C181,
C183,C223,C227,C235,C256,C294,
```

---

## 9. Typical Daily Workflow

1. **Paste Row Data** — Tab 01. Paste today's complete row data (morning + evening together). Click Clean Data.
2. **Paste Partial Fleet** — Tab 02. Paste the partial fleet data. Click Parse Fleet.
3. **Check Bus Master** — Tab 03. Verify excluded buses are correct for today.
4. **Run Adjustment** — Tab 04. Click Run Adjustment. Review Morning and Evening tables.
5. **Review Logs** — Scroll down to Adjustment Logs. Check for warnings (red) or info messages.
6. **Copy and Share** — Click Copy Output. Paste into WhatsApp or Telegram group.

---

## 10. Common Scenarios

### Bus in Partial Fleet but not in Row Data
The bus is not available today. The system finds a replacement from Row Data with the same route and main route. The original bus number is shown with strikethrough in the output.

### Bus does Morning on one route, Evening on another
Add two entries for the same bus in Row Data — one with the morning time and route, one with the evening time and route. The system uses each entry for the correct shift.

### Excluded Bus appears in Partial Fleet
The bus is skipped when parsing Partial Fleet. The slot is treated as if no bus was assigned, and the system finds a replacement from Row Data.

### No matching bus found for a slot
The system tries Row Data first, then Bus Master fallback. If still nothing found, the slot is Unassigned (shown in red). Check if the route exists in Row Data for that shift.

### Same bus needed in both Morning and Evening
Fully supported. Used-bus tracking is per-shift, so C123 can be assigned to a Morning slot AND an Evening slot without conflict.

---

## 11. Export Options

| Button | What it Exports |
|--------|----------------|
| Row Data → Export CSV | Shift, Main Route, Bus, Route, Slot |
| Partial Fleet → Export CSV | Shift, Slot, Route, Bus, Main Route, Notes |
| Output → Export Results | Full results with Shift, match type, reason for every slot |
| Output → Copy Output | Formatted text for WhatsApp/Telegram (only changes shown) |

---

## Files in this Repository

| File | Description |
|------|-------------|
| `index.html` | Main application — open in any browser |
| `FAS_User_Guide.docx` | Detailed user guide (Word document) |
| `README.md` | This file |

---

*Fleet Adjustment System v3.0 — Row Data drives everything. Keep it accurate and complete for best results.*

👤 Maintained By

Akshay
