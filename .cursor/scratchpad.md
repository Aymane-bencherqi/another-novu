## Background and Motivation

The following user stories from the notification project are either partially implemented or not implemented. Completing these will ensure the platform meets all business and user requirements for notification management, reporting, automation, and SDK support.

## Key Challenges and Analysis

- **Scheduled/Automated Reporting (US16):** Requires backend scheduling, report generation (PDF/Excel), and secure delivery.
- **Template Duplication (US17):** Needs UI and backend logic for duplicating templates safely.
- **Notification Listing/Filtering (US20):** Requires advanced filtering by instance/channel in both backend and UI.
- **Notification Retry (US21):** Needs backend support for retrying delivery and UI controls.
- **User Preferences via SDK (US26):** SDK and backend must expose/manage user notification preferences.
- **Topic Subscription/Unsubscription (US27):** Needs robust topic management in backend, UI, and SDK.
- **Personalized Message Views (US31):** Requires backend and UI support for user-specific filtering and presentation.
- **Segment-based Notification (US35):** Needs segment definition, management, and targeted sending.
- **Device-specific Notification (US36):** Requires device registration and targeting logic.
- **Campaign Scheduling (US38):** Needs calendar UI, backend scheduling, and recurring logic.
- **Workflow Automation by Topic (US41):** Requires workflow-topic association and automation triggers.

## High-level Task Breakdown

### US16: Scheduled/Automated Reporting

- [ ] Design report data structure and export format (PDF/Excel)
- [ ] Implement backend report generation logic
- [ ] Add scheduling (cron jobs or similar)
- [ ] Secure report delivery (email/download)
- **Success:** Admin receives scheduled reports as specified

### US17: Template Duplication

- [ ] Add backend endpoint for duplicating templates
- [ ] Implement UI action for template duplication
- [ ] Ensure duplicated templates are editable and safe
- **Success:** Admin can duplicate and edit templates via UI

### US20: Notification Listing/Filtering

- [ ] Enhance backend to support filtering by instance/channel
- [ ] Update UI to allow advanced filtering
- **Success:** Admin can filter notifications by instance/channel

### US21: Notification Retry

- [ ] Add backend support for retrying notification delivery
- [ ] Implement UI controls for retrying failed notifications
- **Success:** Admin can manually or automatically retry notifications

### US26: User Preferences via SDK

- [ ] Expose user preferences endpoints in backend
- [ ] Update SDKs to manage preferences
- [ ] Add UI for managing preferences (if needed)
- **Success:** Users can manage notification preferences via SDK

### US27: Topic Subscription/Unsubscription

- [ ] Implement subscribe/unsubscribe endpoints in backend
- [ ] Update SDKs and UI for topic management
- **Success:** Users can subscribe/unsubscribe to topics via UI/SDK

### US31: Personalized Message Views

- [ ] Enhance backend to support user-specific message filtering
- [ ] Update UI for personalized message views
- **Success:** Users see personalized message lists/views

### US35: Segment-based Notification

- [ ] Implement segment definition and management in backend
- [ ] Add UI for segment management
- [ ] Enable sending notifications to segments
- **Success:** Admin can send notifications to user segments

### US36: Device-specific Notification

- [ ] Implement device registration and management
- [ ] Add backend logic for device targeting
- [ ] Update UI/SDK for device selection
- **Success:** Admin can send notifications to specific devices

### US38: Campaign Scheduling (Calendar)

- [ ] Design calendar UI for scheduling
- [ ] Implement backend scheduling logic (one-time/recurring)
- [ ] Integrate with notification sending logic
- **Success:** Admin can schedule campaigns via calendar UI

### US41: Workflow Automation by Topic

- [ ] Implement workflow-topic association in backend
- [ ] Add automation triggers for topic events
- [ ] Update UI for workflow-topic management
- **Success:** Workflows can be automated based on topic events

## Project Status Board

- [ ] US16: Scheduled/Automated Reporting - Backend: Create reports module/service and endpoint for manual report export (PDF/Excel)
- [x] Fix build errors caused by Unix shell commands in @novu/js and novu packages
- [x] Replace shell scripts with Node.js scripts for cross-platform compatibility
- [x] Successfully build all packages using pnpm build:packages

## Executor's Feedback or Assistance Requests

Started implementation for US16 (Scheduled/Automated Reporting):

- Creating a new `reports` module/service in the backend (`apps/api/src/app/reports/`).
- Adding an endpoint for manual report export (PDF/Excel).
- Will proceed step by step, documenting each change and integration point.
