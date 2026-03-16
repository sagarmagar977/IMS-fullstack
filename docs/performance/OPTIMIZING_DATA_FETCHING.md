# Optimizing Data Fetching

## Goal

This note is for improving slow data loading in the IMS app.

In this stack:

- `Vercel` serves the frontend
- `Render` serves the Django API
- `Supabase/Postgres` stores the data

If the page shell loads quickly but tables, cards, and lists take time, the bottleneck is usually not Vercel. It is usually:

- slow backend API responses
- slow database queries
- too many requests on page load
- region mismatch between backend and database
- underpowered backend hosting

## First Principle

When the UI appears fast but data appears slowly:

- frontend hosting is usually fine
- API or database work is usually slow

So performance work should focus on:

1. reducing request count
2. making each request cheaper
3. making database queries faster
4. avoiding unnecessary data loads

## Quick Diagnosis

Use browser DevTools `Network` tab.

Look for:

- which `/api/...` request is slow
- whether only the first request is slow
- whether all requests are slow
- whether one page triggers too many requests

How to interpret it:

- first request slow, later ones faster: likely `Render` wake-up or warm-up effect
- all requests slow: likely backend or database problem
- only one endpoint slow: likely query/view issue in backend
- many parallel requests on first load: frontend overfetching

## Likely Causes In This Project

### 1. Too Many Requests On First Render

If a page loads many datasets at once, users feel the app is slow even if each request is only moderately slow.

Examples:

- dashboard loading summary cards and recent activity together
- search page hitting many endpoints in parallel
- tables loading full datasets immediately

Fixes:

- fetch only what the visible page section needs
- lazy-load secondary panels
- fetch hidden tab data only when that tab opens
- avoid loading all modules on one screen at once

### 2. Heavy Search

Search is often expensive because it queries multiple tables and may scan too much data.

Fixes:

- debounce search input
- avoid querying on every keystroke unless needed
- paginate search results
- index searched fields
- limit fields returned by the API

Useful indexed candidates:

- `title`
- `item_number`
- `status`
- `created_at`
- `office`
- `category`

### 3. Slow Django ORM Queries

Slow endpoints often come from repeated joins or N+1 query patterns.

Fixes in Django:

- use `select_related()` for foreign keys
- use `prefetch_related()` for reverse or many-to-many relations
- use pagination
- use `.only()` or `.values()` when full model data is not needed
- avoid repeated serializer lookups that trigger extra queries

Common examples:

- inventory items with category and office
- assignments with item, office, and user
- audit logs with related item and performer

### 4. Missing Database Indexes

If filters or ordering happen often without indexes, the database gets slow as data grows.

Add indexes for fields commonly used in:

- `WHERE`
- `ORDER BY`
- search lookups
- joins

Priority fields to review:

- `created_at`
- `status`
- `office_id`
- `category_id`
- `item_number`
- `title`
- assignment status/date fields

### 5. Backend And Database Region Mismatch

If `Render` and `Supabase` are in different regions, every DB call pays extra network latency.

Fix:

- keep backend and database in the same region whenever possible

## Frontend Optimization Checklist

- avoid fetching large datasets on initial render unless necessary
- paginate all list-heavy pages
- debounce search
- do not refetch unchanged reference data too often
- avoid loading data for hidden modals until opened
- cache stable data like categories and offices
- use loading skeletons so perceived performance improves

## Backend Optimization Checklist

- inspect slow API endpoints first
- add `select_related()` and `prefetch_related()`
- paginate responses
- trim serializer fields
- avoid repeated computed queries inside serializer methods
- cache expensive dashboard or summary endpoints
- add indexes for common filters and sorting

## Hosting Optimization Checklist

### Render

- keep the service warm
- use an instance with enough CPU and RAM
- monitor API response times
- check logs for slow requests and timeouts

### Supabase

- confirm region matches Render
- inspect slow queries
- add indexes
- avoid returning very large result sets

### Vercel

Vercel is usually not the main cause if:

- the page itself opens quickly
- only data waits

Vercel matters more when:

- assets load slowly
- page bundles are too large
- client-side JavaScript is excessive

## Practical Action Plan

1. Use DevTools `Network` and list the slowest API calls.
2. Map each slow API call to its Django view.
3. Optimize the queryset with `select_related()`, `prefetch_related()`, and pagination.
4. Add missing indexes for filters and ordering.
5. Reduce unnecessary frontend requests on first render.
6. Check Render and Supabase regions.
7. Re-test and compare timings.

## Good Performance Targets

These are rough targets, not strict rules:

- reference data endpoints: under `300ms`
- normal list endpoints: under `800ms`
- dashboard endpoints: under `1s`
- search endpoints: under `1s` to `1.5s`

If many endpoints are above `2s`, backend or database work likely needs attention.

## Recommended Next Step

Start with the slowest visible page and answer:

1. Which exact `/api/...` request is slow?
2. How many seconds does it take?
3. Does that endpoint fetch too much data or too many relations?

Then optimize one endpoint at a time instead of changing everything at once.

## Backend Findings From Code Review

The following backend improvements were identified and partly implemented:

### Implemented

- `inventory` list query now preloads `fixed_asset`
- `inventory` list query now preloads active assignments
- item serializer now reuses prefetched assignments instead of doing per-row `.first()` and `.exists()`
- dashboard summary now uses aggregate counts instead of many separate count queries

### Still Worth Reviewing

- office scoping in `common/access.py` walks descendants level by level and can become expensive with a large hierarchy
- report endpoints may still return large result sets without pagination
- search endpoints still need real browser-network timing checks to confirm their slowest queries
- `title` search may still benefit from additional indexing or full-text strategy if data grows a lot

## What Was Verified

- targeted Django tests for `inventory`, `actions`, `audit`, and `reports` passed after the optimizations
- no obvious serializer-driven N+1 pattern remains in the assignment, audit, or stock transaction list views reviewed in this pass

## Important Limitation

This review reduces confirmed N+1 issues in the inspected backend paths, but it does not prove that no N+1 pattern exists anywhere in the project.

To prove that more confidently, use:

- Django Debug Toolbar in development
- query logging for slow endpoints
- browser Network timings mapped to backend logs
