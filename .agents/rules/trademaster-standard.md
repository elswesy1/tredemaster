---
trigger: always_on
---

# Trademaster Official Development & Integration Standard

## 🎯 Project Goal
To complete and scale a high-end platform for professional traders that bridges the gap between technical execution (SMC), rigorous Risk Management, and Trader Psychology. The core focus is highlighting the vital importance of journaling and recording the trading routine from a technical, administrative, and psychological perspective.

## 🏗️ Preservation of Existing Architecture
- **Do NOT rebuild from scratch:** The current Next.js/React structure shown in the Vercel deployment (https://trademaster-omega.vercel.app/) must be preserved.
- **UI/UX Consistency:** Maintain the existing dark-themed professional dashboard layout. Use the current palette: Royal Navy Blue, Gold, and Emerald Green for success metrics.
- **Section Integrity:** Fix and enhance existing modules: 
  1. Dashboard (Current HTTP 500 Error must be resolved).
  2. Portfolio & Account Management.
  3. Risk Management Gauges.
  4. Trading Journal & Session Recording.
  5. Psychology Logs (Fix the "Failed to fetch" error).
  6. AI Assistant & Statistics.

## 🧠 Integration Logic (SMC & Mark Douglas)
- **The Journal is the Core:** Every trade must link technical entry data with psychological state logs.
- **Data Flow:** Risk Management metrics must automatically update based on the Trading Journal entries.
- **AI Analysis:** The AI Assistant must use Journal data to identify behavioral patterns (e.g., overtrading during news) based on the "Trading in the Zone" principles.

## 🛠️ Technical Requirements for Agents
- **Modular Code:** Keep components in `src/components/` and logic in `mini-services/` decoupled for future scaling.
- **API Reliability:** Prioritize fixing the backend integration points that are causing data fetch failures in the Psychology and Dashboard sections.
- **Language:** Support bilingual UI (Arabic/English) as seen in current headers.