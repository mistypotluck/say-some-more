# 👵 Say Some More 
> **An empathetic attentive companion that turns "lorsor" parent 'lore' into 20-second actionable family capsules with human-in-the-loop consent.**

[![Live Prototype Demo](https://img.shields.io/badge/🌐_Live_Demo-say--some--more.ai.studio-1B4D3E?style=for-the-badge&logo=googlecloud)](https://say-some-more.ai.studio/)
[![Hackathon Track](https://img.shields.io/badge/Hackathon_Track-Track_2:_Best_Elderly_Hack_(2.3)-D95D39?style=for-the-badge)](https://65labs-gemini-hack.notion.site)
[![AI Engine](https://img.shields.io/badge/Powered_by-Google_Gemini_Flash-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

### 🌐 Live Application
👉 **Experience the Live Prototype:** [https://say-some-more.ai.studio/](https://say-some-more.ai.studio/)  
*(Optimized for desktop side-by-side Dual View as well as mobile view)*

---

## 🎯 The Core Problem & Cultural Insight

By 2030, 1 in 6 people globally will be aged 60+. In Singapore and worldwide, thousands of elderly parents live alone.

- **The Elderly Parent (Mdm Lim, 74):** Speaks in long, winding Singlish stories filled with rich neighborhood lore (visiting St. Luke's ElderCare, partnering with an 86-year-old retired nurse, watching Teochew opera). Buried within this 5-minute ramble is an important request (*"Sunday coming for makan or not?"*) or comfort check-in (*"Freezing cinema aircon gave me a bad runny nose"*).
- **The Adult Child (Mei, 38):** Works 10-hour days. 5-minute unstructured voice notes cause cognitive overload. Important family questions get missed, parents feel unheard, and children feel guilty.

**Say Some More** bridges this attention gap without diminishing the senior's voice. Gemini listens patiently, extracts actionable items from casual neighborhood lore, generates a **20-second family capsule** with explicit consent, and allows the daughter to send a warm, human-in-the-loop reply back to Mum.

---

## 📱 Two-Phone Experience & Asynchronous Loop

---

## 🛡️ Responsible AI, Safety & Privacy Guardrails

Our prototype strictly complies with the hackathon safety and accessibility baselines:

1. **Strict Non-Diagnostic Constraint:** The companion captures explicitly stated wellness and physical comfort needs (e.g., *"caught a cold from cinema AC and has a bad runny nose"*), but strictly avoids making clinical diagnoses or recommending medication changes.
2. **Anti-Impersonation Disclosure:** The AI companion transparently identifies itself (*"I'm the Say Some More companion, not Mei"*), eliminating deception and confusion.
3. **Explicit Human Consent Gate:** Stories and questions are never sent automatically. Mum must explicitly tap `📤 Pass to Mei` or can select `🔒 Keep this private`.
4. **Human-in-the-Loop AI Drafts:** AI-generated reply suggestions are strictly drafts. Mei must review, edit, and manually tap `Approve & Send` before Mum receives the message.
5. **Zero-Downtime Resilience:** Features an integrated deterministic mock fallback engine and `localStorage` persistence so the live demo runs flawlessly even during network dropouts.

---

## 🎨 Elderly-First Design System (Warm Organic Theme)

- **Palette:** Soft Warm Neutrals (`#FAF7F2`), Deep Heritage Botanical Green (`#1B4D3E`), Terracotta accents (`#D95D39`).
- **Typography:** `Fraunces` & `Playfair Display` serif headers with clean, high-legibility `Plus Jakarta Sans` body typography (20px–26px).
- **Dual-Phone Simulation:** Built-in side-by-side **Dual View Mode** designed specifically for judging presentations on desktop displays.

---

## 🛠️ Tech Stack & Multimodal AI Integration

- **Model:** Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash`) for Singlish semantic comprehension, memory extraction, and context-aware reply drafting.
- **Voice & Speech:** Native Web Speech Recognition (STT) and Web Speech Synthesis (TTS) with pitch and rate calibrated for elderly listening.
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons.
- **Platform:** Google AI Studio App Engine (`https://say-some-more.ai.studio/`).

---

## 👥 Hackathon Submission Details
- **Project Name:** Say Some More (说多一点)
- **Hackathon Track:** Track 2 — Best Elderly Hack *(Track 2.3: Family and Community Connection)*
- **Live Demo Link:** [https://say-some-more.ai.studio/](https://say-some-more.ai.studio/)
- **One-Line Description:** An empathetic attentive companion that turns endless parent 'lore' into 20-second actionable family capsules with human-in-the-loop consent.
