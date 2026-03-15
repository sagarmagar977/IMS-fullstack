# Frontend Tracker (Next.js)

## 1. App Shell and Visual Foundation
- [x] Fix `(main)/layout.tsx` provider/layout composition
- [ ] Normalize global tokens/colors to screenshot palette
- [x] Align sidebar spacing, active state, logout style, and labels
- [x] Align header search/profile/notification layout

## 2. API and Data Integration
- [x] Fix RTK query endpoint URLs to match Django routes
- [x] Add auth header injection using access token
- [x] Add typed API response contracts for core modules
- [ ] Replace hardcoded arrays in:
  - [x] Dashboard cards
  - [x] Recent activity table
  - [x] Items table
  - [x] Categories table
  - [x] Assignments table
  - [x] Stock table/history
  - [x] Audit log table

## 3. Screen-by-Screen Parity
- [ ] Login screen
- [ ] Dashboard
- [ ] Items + Add Item drawer
- [ ] Categories + Create Category drawer
- [ ] Assignments + Create Employee/Department drawer
- [ ] Consumables Stock + Create Transaction drawer
- [ ] Audit Log
- [ ] Filter modal

## 4. Quality
- [x] Remove broken emoji fallback icons and use deterministic icon set
- [ ] Ensure responsive behavior (desktop/tablet baseline)
- [ ] Run lint/build and fix regressions
