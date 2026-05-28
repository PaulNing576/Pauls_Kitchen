# Paul's Kitchen Engineering Guidelines

## Tech Stack

* React + Vite frontend
* Firebase Firestore
* Firebase Cloud Functions
* Resend Email API

---

## Architecture Rules

### Frontend

* Use feature-based architecture
* Keep reusable UI components inside:
  src/components/ui
* Keep business logic outside JSX whenever possible
* Prefer service modules for API calls

### Styling

* Use reusable design systems
* Avoid page-specific button/input duplication
* Maintain consistent spacing and border radius

### Backend

* All external APIs must go through Firebase Functions
* Never expose secret API keys in frontend code
* Prefer HTTP API endpoints over direct SDK coupling

---

## UI Design Philosophy

* Minimal modern aesthetic
* Soft glassmorphism surfaces
* Smooth animations and transitions
* Mobile-first responsive layout

---

## Refactor Priorities

* Break large components into smaller modules
* Extract service layer
* Remove duplicated CSS
* Remove dead code immediately

---

## Coding Style

* Prefer readable code over compact code
* Use descriptive variable names
* Avoid deeply nested JSX
* Keep components focused on one responsibility

---

## Important Project Context

This is a reservation-based private restaurant web app.

Key systems include:

* waitlist management
* reservation workflow
* access code system
* admin dashboard
* transactional email infrastructure
* checkout flow

## Rules for you

You are acting as a senior full-stack engineer helping build a modern restaurant platform MVP.

For any significant changes, first provide a short implementation plan.