## Background and Motivation

The following user stories from the notification project are either partially implemented or not implemented. Completing these will ensure the platform meets all business and user requirements for notification management, reporting, automation, and SDK support.

### US17: Template Duplication

Admins want to quickly duplicate existing notification templates to save time and avoid repetitive setup. This feature should allow an admin to select a template, duplicate it, and then edit the new copy as needed.

### US18: Workflow Definition (Admin)

- [ ] **Backend:** Implement endpoints to define and manage notification workflows (steps, conditions, channels).
  - Input: Workflow definition (steps, triggers, conditions, channels).
  - Output: Workflow object with all configuration.
  - Success: Admin can create/update workflows with multiple steps and conditions.
- [ ] **Frontend:** UI for workflow builder (drag-and-drop, step configuration, conditionals).
  - Success: Admin can visually define workflows and save them.
- [ ] **Testing:** Ensure workflows execute as defined, including all steps and conditions.
- **Success:**
  - Admin can define complex notification workflows with conditions and multiple channels.
  - Workflows execute as configured.

### US19: Workflow Versioning (Admin)

- [ ] **Backend:** Add support for workflow versioning (CRUD for versions, rollback, view history).
  - Input: Workflow changes, version actions (create, rollback, view).
  - Output: Versioned workflow objects.
  - Success: Admin can view, create, and rollback workflow versions.
- [ ] **Frontend:** UI for managing workflow versions (history, compare, rollback).
  - Success: Admin can see version history and restore previous versions.
- [ ] **Testing:** Ensure versioning works for all workflow changes and edge cases.
- **Success:**
  - Admin can manage workflow versions and safely rollback changes.

### US20: Notification Listing/Filtering

- [ ] Enhance backend to support filtering by instance/channel
- [ ] Update UI to allow advanced filtering
- **Success:** Admin can filter notifications by instance/channel

### US21: Notification Retry

- [ ] Add backend support for retrying notification delivery
- [ ] Implement UI controls for retrying failed notifications
- **Success:** Admin can manually or automatically retry notifications

### US22: Notification Receipt (User)

- [ ] **Backend:** Track notification delivery and receipt status (per user/channel).
  - Input: Delivery/receipt events from providers/clients.
  - Output: Status updates in DB.
  - Success: System records when a notification is received by the user.
- [ ] **Frontend:** UI indicator for received notifications (in-app, email, SMS, push).
  - Success: User can see which notifications were received.
- [ ] **Testing:** Simulate delivery/receipt events and verify status updates.
- **Success:**
  - Accurate tracking and display of notification receipt status.

### US23: Message State Management (User)

- [ ] **Backend:** Track message state (read/unread, archived, deleted) per user.
  - Input: User actions (mark as read, archive, delete).
  - Output: State updates in DB.
  - Success: System updates and persists message state.
- [ ] **Frontend:** UI controls for managing message state (mark as read, archive, delete).
  - Success: User can manage message state in the app.
- [ ] **Testing:** Ensure state changes persist and reflect in UI.
- **Success:**
  - Users can manage message state and see accurate status in the app.

### US24: Message List (User)

- [ ] **Backend:** Endpoint to fetch user messages with state (read/unread, etc.).
  - Input: User ID, filters.
  - Output: List of messages with state.
  - Success: User receives accurate message list.
- [ ] **Frontend:** UI for displaying message list with state indicators.
  - Success: User sees all messages and their states.
- [ ] **Testing:** Ensure list is accurate and updates with state changes.
- **Success:**
  - Users can view and interact with their message list.

### US25: SDK Authentication (User)

- [ ] **Backend:** Support SDK authentication to the notification hub (API keys, tokens).
  - Input: SDK credentials.
  - Output: Authenticated session/token.
  - Success: SDK can authenticate and interact with the hub.
- [ ] **SDK:** Implement authentication logic in SDKs (web, mobile, etc.).
  - Success: SDKs can securely authenticate and use notification APIs.
- [ ] **Testing:** Ensure authentication works for all SDKs and edge cases.
- **Success:**
  - Secure SDK authentication and access to notification APIs.

### US26: User Preferences via SDK

- [ ] Expose user preferences endpoints in backend
- [ ] Update SDKs to manage preferences
- [ ] Add UI for managing preferences (if needed)
- **Success:** Users can manage notification preferences via SDK

### US27: Topic Subscription/Unsubscription

- [ ] Implement subscribe/unsubscribe endpoints in backend
- [ ] Update SDKs and UI for topic management
- **Success:** Users can subscribe/unsubscribe to topics via UI/SDK

### US28: Mobile SDK (App)

- [ ] **SDK:** Develop/extend mobile SDKs (Android/iOS) for push notification support.
  - Features: Register device, receive push, handle notification events.
  - Success: Mobile apps can use SDK for push notifications.
- [ ] **Testing:** Ensure SDK works on Android/iOS and handles all notification scenarios.
- **Success:**
  - Mobile SDKs are available and reliable for push notifications.

### US29: Flutter SDK (App)

- [ ] **SDK:** Develop/extend Flutter SDK for notification support.
  - Features: Register device, receive push, handle notification events.
  - Success: Flutter apps can use SDK for notifications.
- [ ] **Testing:** Ensure SDK works on Flutter and handles all notification scenarios.
- **Success:**
  - Flutter SDK is available and reliable for notifications.

### US30: Web SDK (App)

- [ ] **SDK:** Develop/extend Web SDK for notification support.
  - Features: Register device, receive push, handle notification events.
  - Success: Web apps can use SDK for notifications.
- [ ] **Testing:** Ensure SDK works on web and handles all notification scenarios.
- **Success:**
  - Web SDK is available and reliable for notifications.

### US31: Personalized Message Views

- [ ] Enhance backend to support user-specific message filtering
- [ ] Update UI for personalized message views
- **Success:** Users see personalized message lists/views

### US32: Segment-based Notification

- [ ] Implement segment definition and management in backend
- [ ] Add UI for segment management
- [ ] Enable sending notifications to segments
- **Success:** Admin can send notifications to user segments

### US33: Device-specific Notification

- [ ] Implement device registration and management
- [ ] Add backend logic for device targeting
- [ ] Update UI/SDK for device selection
- **Success:** Admin can send notifications to specific devices

### US34: Campaign Scheduling (Calendar)

- [ ] Design calendar UI for scheduling
- [ ] Implement backend scheduling logic (one-time/recurring)
- [ ] Integrate with notification sending logic
- **Success:** Admin can schedule campaigns via calendar UI

### US35: Workflow Automation by Topic

- [ ] Implement workflow-topic association in backend
- [ ] Add automation triggers for topic events
- [ ] Update UI for workflow-topic management
- **Success:** Workflows can be automated based on topic events

## Project Status Board

- [x] US16: Scheduled/Automated Reporting - Backend: Create reports module/service and endpoint for manual report export (PDF/Excel)
- [ ] US17: Template Duplication - Backend: Add endpoint to duplicate a template by ID; Frontend: Add duplicate button/action; Testing: Ensure duplication works for all template types
- [x] Fix build errors caused by Unix shell commands in @novu/js and novu packages
- [x] Replace shell scripts with Node.js scripts for cross-platform compatibility
- [x] Successfully build all packages using pnpm build:packages

## Executor's Feedback or Assistance Requests

Started implementation for US16 (Scheduled/Automated Reporting):

- Creating a new `reports` module/service in the backend (`apps/api/src/app/reports/`).
- Adding an endpoint for manual report export (PDF/Excel).
- Will proceed step by step, documenting each change and integration point.
