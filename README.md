# Taskora

Plan. Track. Thrive. — a student productivity app with tasks, calendar, categories, analytics, life-balance tracking, and **Tora**, your built-in AI assistant.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts, Framer Motion and dnd-kit.

## What's implemented

- **Auth**: sign up (name, DOB, school, class, email, password, optional avatar), login, logout, change password, local "forgot password" reset.
- **Dashboard**: profile card, live clock + date + greeting, today's/upcoming tasks, progress bar, weekly summary chart, life balance meter, recent activity, motivational quote.
- **Tasks**: full CRUD, pin, duplicate, archive, undo delete, complete with confetti, drag-and-drop reordering, search, filter, sort.
- **Categories**: seeded Education / Entertainment / Personal groups with subcategories, plus fully custom categories with colors, icons, reordering.
- **Calendar**: month / week / day views, drag tasks between dates, exam countdown banner.
- **Tora AI**: chat + quick actions (break down tasks, estimate duration, best time to work, exam study plans, weekly summary). Uses the Anthropic API when `ANTHROPIC_API_KEY` is set, otherwise runs a helpful rule-based offline mode — the app is fully usable either way.
- **Reports**: date-range filtering, totals (total/completed/pending/missed/hours), pie/bar/line charts, CSV and PDF export.
- **Themes**: dark / light / pink / blue, compact/comfortable layout, English/Urdu (with RTL).
- **Data**: auto-save to the browser (localStorage), JSON backup & restore.
- **Smart reminders**: browser notifications for upcoming tasks, overdue tasks, exams, and birthdays.
- **PWA**: installable, with an offline-friendly service worker.
- Keyboard shortcuts: `n` new task, `/` focus search.

## Honest limitations (and how to remove them)

This is a **local-first** app: all data lives in the signed-in browser's `localStorage`, so there is no real password security and no true cross-device sync out of the box — that keeps the app deployable with zero configuration. If you want real accounts and cross-device sync, swap `lib/store/authStore.ts` and `lib/store/taskStore.ts` for calls to a backend such as [Supabase](https://supabase.com) (Postgres + Auth, generous free tier, deploys cleanly alongside Vercel). The data shapes in `lib/types.ts` map directly onto Supabase tables if you go this route.

## Getting started locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

Optional: create `.env.local` (see `.env.example`) and set `ANTHROPIC_API_KEY` to enable real AI responses from Tora.

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Taskora"
git branch -M main
git remote add origin https://github.com/<your-username>/taskora.git
git push -u origin main
```

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected) — no build settings to change.
3. (Optional) Add an environment variable `ANTHROPIC_API_KEY` for real Tora responses.
4. Click **Deploy**.

That's it — Vercel builds and hosts it, no database to provision.

## Project structure

```
app/            routes (App Router) — dashboard, tasks, calendar, categories, reports, tora, settings, api/tora
components/     UI primitives, dashboard widgets, task/calendar/category components, logos
lib/            zustand stores, types, utils, i18n dictionary
public/         manifest, service worker, icons
```
