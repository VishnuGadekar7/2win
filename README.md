# 📅 Week 2: Auth & User Profile

This week focused on implementing **secure authentication**, **user profile management**, and **health data handling** using **Supabase Auth, JWT, RLS**, and a polished **Tailwind UI**.

🔗 **Live App:** https://innerve-frontend.vercel.app  
🔐 **Login Page:** https://innerve-frontend.vercel.app/login

---

## ✅ Week 2 Goals
- Secure authentication with Supabase
- Protected user profiles with CRUD operations
- Health metrics form with JWT validation
- Responsive, localized UI
- Production-ready deployment

---

## 🟢 Day 1: Supabase Auth

| Member  | Task | Success Metric |
|--------|------|----------------|
| Harsh | Supabase register/login APIs | `/auth/register` ✅ `/auth/login` ✅ |
| Vishnu | Login page + token storage | `localhost:3000/login` → Token saved |
| Saharsh | Supabase project setup | `VITE_SUPABASE_URL` ready |

**Status:** ✅ Completed  
**Live:** https://innerve-frontend.vercel.app/login

---

## 🔄 Day 2: Profile CRUD

| Member | Task | Success Metric |
|------|------|----------------|
| Harsh | `/profile` GET/PUT endpoints | Profile data synced with Supabase |
| Vishnu | Profile form + edit UI | User data saved successfully |
| Atharva | Profiles table schema | `health_metrics` JSONB column |

**Status:** 🟡 In Progress

---

## 🛡️ Day 3: Profile Guard

| Member | Task | Success Metric |
|------|------|----------------|
| Vishnu | Auth guard middleware | `/profile` protected |
| Harsh | JWT token validation | Unauthorized → `401` |
| Saharsh | Supabase RLS policies | Users access only their data |

**Security:** 🔒 Supabase Auth + JWT + RLS

---

## 🩺 Day 4: Health Form + JWT

| Member | Task | Success Metric |
|------|------|----------------|
| Harsh | Health form JWT middleware | `/health` protected |
| Vishnu | Profile + Health form UI | BMI & weight submission |
| Atharva | Health metrics validation | BMI calculation works |

---

## 🎨 Day 5: UI Polish

| Member | Task | Success Metric |
|------|------|----------------|
| Vishnu | Tailwind styling | Fully responsive UI |
| Saharsh | Localization (PL) | `pl.json` labels |
| Atharva | UX improvements | Loading spinners on API calls |

---

## 🚀 Day 6: Frontend Deployment

| Member | Task | Success Metric |
|------|------|----------------|
| Vishnu | Vercel deployment | `/profile` live |
| Saharsh | Env vars + CORS | Supabase keys secured |
| Harsh | Backend health check | Full E2E flow tested |

🌐 **Live URL:** https://innerve-frontend.vercel.app

---

## 🎥 Day 7: Demo Preparation

| Member | Task | Success Metric |
|------|------|----------------|
| Vishnu | Full flow recording | Register → Login → Profile → Health |
| Harsh | Supabase logs & docs | Architecture diagram |
| Atharva | Hackathon case study | SIH submission ready |
| Saharsh | README + demo video | GitHub ready 🚀 |

---

## ✅ Week 2 Complete Checklist

- ✅ Register → Login → Profile Edit → Health Form → Logout
- ✅ 100% Protected with Supabase Auth + JWT + RLS
- ✅ Live deployment on Vercel
- ✅ Tailwind responsive UI
- ✅ i18n support (Polish)
- ✅ Hackathon-ready documentation

---

## 🛠️ Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (Auth, DB, RLS)
- **Auth:** JWT + Supabase Auth
- **Deployment:** Vercel

---

## 📌 Team
- **Harsh** – Backend & Auth
- **Vishnu** – Frontend & Deployment
- **Saharsh** – Supabase & Security
- **Atharva** – Schema, Validation & UX

---

⭐ If you like this project, give it a star and follow our journey!
