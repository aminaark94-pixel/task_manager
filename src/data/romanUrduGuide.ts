export const ROMAN_URDU_GUIDE = `# 🏡 Family Task Manager - Asaan Roman Urdu Setup Guide

Yeh guide aapko step-by-step batayegi ke aap is single-file Family Task Manager ko **Supabase Database**, **Voice-to-Text Feature**, aur **Free Hosting (Netlify / Vercel)** par kaise setup kar sakte hain.

---

## 📌 Step 1: Supabase Free Account Aur Database Banana

1. **Supabase Website** par jaen: [https://supabase.com](https://supabase.com)
2. Free account sign up karein (GitHub ya Email ke zariye).
3. Dashboard me **"New Project"** button par click karein.
4. Project ka naam rakhein (e.g. \`family-tasks\`) aur strong database password select karein.
5. Region me sab se qareeb region (e.g. *Singapore* ya *Frankfurt*) choose karein aur **"Create new project"** par click karein.

---

## 📌 Step 2: SQL Script Run Karna (Tables & Rules)

1. Supabase Dashboard me left sidebar se **"SQL Editor"** par click karein.
2. **"New Query"** par click karein.
3. Hamari provide ki hui **\`supabase-setup.sql\`** file ka poora code copy karein aur SQL Editor me paste kar dein.
4. Niche **"Run"** (ya Ctrl+Enter) button dabayein.
5. **Result:** Aapke Supabase me \`profiles\`, \`tasks\`, aur \`task_logs\` tables, Row Level Security (RLS) policies aur auto-signup trigger ready ho jayenge!

---

## 📌 Step 3: API URL Aur Anon Public Key Hasil Karna

1. Supabase Dashboard me left sidebar ke sab se niche **"Project Settings" (Gear icon ⚙️)** par click karein.
2. **"API"** tab par click karein.
3. Yahan se yeh do cheezein copy karein:
   - **Project URL** (e.g. \`https://xyzcompany.supabase.co\`)
   - **Project API Keys -> anon (public)** (e.g. \`eyJhbGciOiJIUzI1NiIsIn...\`)
4. Downloaded **\`index.html\`** ko kisi bhi text editor (Notepad ya VS Code) me open karein, ya app ke andar **"Supabase Settings"** modal me daal dein.

---

## 📌 Step 4: Web Speech API (Voice-to-Text) Use Karna

1. Is app me native **Web Speech API** use hoti hai jo Google Chrome, Microsoft Edge, aur Safari me bina kisi external paid API ke 100% free kaam karti hai.
2. **Microphone Permission:** Jab aap pehli baar **"Voice Task"** ya mic icon par click karenge, browser aap se Microphone access allow karne ka poochhe ga — **"Allow"** par click karein.
3. **Voice Commands:**
   - Aap simply bol sakte hain: *"Add task complete math homework for Ali"*
   - Ya kisi bhi input field ke sath wale mic icon par click kar ke Urdu ya English me bol kar type karwa sakte hain.

---

## 📌 Step 5: File Run Aur Free Host Karna (Netlify / Vercel / Local)

### 🔹 Tareeqa A: Apne Laptop / Mobile me Direct Chalana
- Download ki hui **\`index.html\`** file par double-click karein — yeh foran aapke Google Chrome ya Edge browser me chal paregi!

### 🔹 Tareeqa B: Netlify Drop par 10 Seconds me Free Live Karna
1. [https://app.netlify.com/drop](https://app.netlify.com/drop) par jaen.
2. Ek naya folder banayein jismein sirf aapki **\`index.html\`** file ho.
3. Is folder ko Netlify Drop par drag & drop kar dein.
4. Aapko 5 seconds me free live link mil jayega jo poori family apne mobile phones par open kar sakti hai!

---

## 👨‍👩‍👧‍👦 User Roles Aur Features Ka Khulasa:

- **Parent (Admin):**
  - Bachon ko tasks assign karna (Daily, Weekly, Custom duration, ya One-time).
  - Rewards ke stars/points set karna (e.g. 15 ⭐).
  - Poori family ka daily completion progress chart dekhna.
  - Sab bacho ke completion logs verify karna.

- **Children / Spouse (Users):**
  - Apne "Today's Tasks" dekhna aur complete hone par tick lagana.
  - Confetti celebration aur reward stars hasil karna.
  - Daily habit streak maintain karna (e.g. 🔥 5 Days streak).

---
`;
