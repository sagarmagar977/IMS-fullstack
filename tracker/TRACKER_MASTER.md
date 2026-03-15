# IMS Alignment Tracker (PRD + Design)

## Scope
- Source of truth:
  - `reference/PRD - IMS.md`
  - `reference/IMS design/*.png`
- Implementation targets:
  - Frontend: `frontend` (Next.js)
  - Backend: `backend` (Django + DRF)

## Execution Rules
- Figma/screenshot visual parity is primary for UI structure and layout.
- PRD is authority for business logic, RBAC, and data behavior.
- When design and PRD conflict, implement PRD behavior with design-aligned UI.
- All list screens must fetch from backend (no hardcoded mock arrays).

## Current Gap Summary
- Frontend still uses hardcoded data on key tables/cards.
- Frontend API routes do not match backend route names.
- Shared layout has provider duplication and composition issue.
- Categories page import path is broken.
- UI has encoding/icon issues and does not fully match screenshot polish.

## Parallel Workstreams
- Frontend tracker: `tracker/TRACKER_FRONTEND.md`
- Backend tracker: `tracker/TRACKER_BACKEND.md`

## Status
- [x] Initial gap analysis completed
- [ ] Frontend aligned to screenshot parity (in progress)
- [x] Backend contracts aligned to frontend route needs
- [ ] PRD workflow coverage verified end-to-end
