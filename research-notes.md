# Research notes

## CRM workflow patterns used

- Pipedrive: activity-based selling; sales teams should track the next activity per deal and keep pipeline stages actionable.
- HubSpot: separate lead/customer lifecycle, use clear pipeline stages, assign owners, and keep follow-up tasks attached to records.
- monday/ClickUp agency patterns: board views plus calendar/task views for production work, with owner, due date, and status on every item.
- Agency sales workflow applied here: lead -> new/warm -> active project -> delivered -> uninterested/lost, with tasks for closing, website work, content/TikTok, and client questions.

## Product decisions

- One screen for pipeline status.
- One shared agenda view for Emilio/Ayman/Beide.
- One task list with category, owner, due date, and status.
- Customer records include niche, city, value, priority, next action, questions, and notes.
- Local browser storage for immediate zero-cost use.
- JSON and CSV export/import so data can be backed up or migrated later.

## Limit

- This first version is static and stores data locally in the browser. True shared real-time sync between Emilio and Ayman needs a backend such as Supabase, Firebase, Airtable, Notion, or Google Sheets API.
