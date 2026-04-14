# AI Auto-Apply: Autonomous Job Application System

An intelligent, full-stack SaaS platform designed to automate the job application process across multiple portals like Glassdoor, Indeed, and Wellfound using AI and browser automation.

---

## 🚀 Project Overview
This application allows users to upload their resumes, which are then parsed by AI. The system autonomously navigates job portals, identifies relevant fields, and fills out applications on behalf of the user, bypassing repetitive manual entry.

## 🛠️ Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+** | User dashboard, application tracking, and resume management. |
| **Backend API** | **Express.js** | Orchestrates automation tasks and handles the heavy logic. |
| **Database & Auth** | **Supabase** | Managed PostgreSQL database, User Authentication, and Resume PDF Storage. |
| **Automation** | **Playwright** | Headless browser engine for navigating job portals. |
| **AI Engine** | **OpenAI / LangChain** | Intelligent form detection and resume-to-job mapping. |
| **Task Queue** | **BullMQ + Redis** | Asynchronous processing to handle multiple applications safely. |

---

## 📋 Development Roadmap (10 Key Tasks)

1.  **Project Initialization:** Setup Next.js (Frontend) and Express (Backend) boilerplate.
2.  **Supabase Integration:** Configure Supabase Auth for user login and Database for storing profiles.
3.  **Resume Parsing (AI):** Build a route to convert uploaded PDFs into structured JSON using GPT-4o.
4.  **Stealth Browser Setup:** Implement Playwright with Stealth plugins to avoid bot detection.
5.  **Secure Vault:** Use encryption to store portal credentials (Indeed/Glassdoor) safely.
6.  **Task Queue System:** Integrate Redis & BullMQ to process applications in the background without timeouts.
7.  **DOM Intelligence:** Use AI to analyze HTML and find the correct input selectors for forms.
8.  **Portal Strategies:** Create specific scripts for different portals (e.g., "Easy Apply" logic for Indeed).
9.  **Real-time Updates:** Use WebSockets or Supabase Realtime to show live application progress to the user.
10. **Proxy & Safety:** Implement residential proxies to prevent IP blacklisting.

---

## 🏗️ System Flow
1. **User Login:** User signs in via Supabase Auth.
2. **Profile Setup:** User uploads a PDF resume (stored in Supabase Buckets).
3. **Parsing:** AI converts the PDF into a "Master Profile" JSON.
4. **Queueing:** User provides a list of Job URLs; these are pushed to the Redis Queue.
5. **Execution:** The Express worker opens a Playwright instance, logs into the portal, and uses AI to map the Master Profile to the job form fields.
6. **Confirmation:** Application is submitted, and the status is updated in the dashboard.

---

## 🛡️ Safety & Ethics
* **Encryption:** All user credentials are encrypted at rest.
* **Human-in-the-loop:** The system will pause and notify the user if a CAPTCHA is encountered.
* **Rate Limiting:** Applications are spaced out to mimic human behavior.