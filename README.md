# Consistency — Data Engineer Prep PWA

A mobile-first, installable 84-day interview-preparation tracker. It is a static web app suitable for GitHub Pages.

## Features
- Calendar with 84 consecutive dates
- Daily tracker: 2 Python/DSA problems, 2 SQL problems, and 1 theory concept
- Daily completion percentage, current perfect-day streak, total perfect days, logged days
- Weekly completion review and reflection
- Engineering-task and mock-review statuses
- Local saving, JSON export/import backup, offline cache after first load
- Installable to a phone home screen

## Publish using GitHub Pages
1. Create a new GitHub repository, for example `consistency-tracker`.
2. Upload **all files in this folder** to the repository root (not the ZIP file itself).
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then save.
6. Wait for GitHub Pages to publish. Open the displayed `https://...github.io/.../` URL on your phone.

## Add to home screen
- **Android / Chrome:** open the published HTTPS URL → browser menu `⋮` → **Install app** or **Add to Home screen**.
- **iPhone / Safari:** open the URL in Safari → Share → **Add to Home Screen**.

## Important data note
Progress is saved in local browser storage on the device where you use the app. GitHub Pages hosts the app files but does not sync your data between devices. Use **Export backup (JSON)** regularly, and import that backup on another device if needed. Clearing browser/site data may erase progress.

## Plan dates
On first load, the app creates an 84-day plan starting on the current local date and remembers that start date in the browser. The calendar can be used to review previous and future days.
