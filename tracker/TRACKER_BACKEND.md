# Backend Tracker (Django/DRF)

## 1. Contract Alignment
- [x] Verify all frontend-used endpoints exist and return required fields
- [x] Ensure naming parity for list/detail routes and fields
- [ ] Confirm pagination strategy for large datasets

## 2. PRD Workflow Coverage
- [ ] Category/custom field management
- [ ] Item and stock management (fixed asset + consumables)
- [ ] Assignment/return workflow with validations
- [ ] Audit log completeness with attachments
- [ ] Reporting/export endpoints for dashboard and reports

## 3. Role and Scope Enforcement
- [ ] Validate role matrix against PRD roles
- [ ] Validate office hierarchy scoping for read and write actions

## 4. Operational and Production Readiness
- [ ] Data validation hardening for create/update flows
- [ ] API performance checks on read-heavy endpoints
- [ ] Verify backup/audit/report command paths still healthy

## 5. Verification
- [x] Run targeted Django tests for touched areas
- [ ] Smoke test API routes consumed by frontend
