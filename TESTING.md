# Production Testing Checklist

Run through every item below after deploying. Tick each box as you verify it.

**Frontend:** https://your-app.vercel.app  
**Backend:** https://your-backend.onrender.com

---

## Backend Health

- [ ] `GET https://your-backend.onrender.com/api/health` returns `{ "status": "ok", "timestamp": "...", "uptime": ... }`
- [ ] Response time is under 2 seconds (cold start may take ~30s on free tier)

---

## Authentication

- [ ] **Register** — create a new account on the live site; success redirects to dashboard
- [ ] **Login** — email + password works; JWT stored in localStorage
- [ ] **Persist on refresh** — reload the page; still logged in, not redirected to /login
- [ ] **Logout** — clears session; redirected to /login; back button does not restore session
- [ ] **Forgot password** — enter email; receive reset email within 1 minute
- [ ] **Reset password** — follow the link in the email; set a new password; login works

---

## Applications (CRUD)

- [ ] **Add** — open "Add Application" modal; fill all fields; submit; card appears in list
- [ ] **Edit** — click edit on a card; change company name; save; updated name shows immediately
- [ ] **Delete** — click delete; confirm dialog appears; application removed from list
- [ ] **Search** — type a company name in the search bar; list filters in real time
- [ ] **Filter by status** — select "Applied" from status filter; only applied cards show
- [ ] **Filter by source** — select "LinkedIn"; only LinkedIn cards show
- [ ] **Combined filters** — status + source filter together returns correct subset
- [ ] **Pagination** — add 15+ applications; page 2 exists and loads correctly

---

## Kanban Board

- [ ] All 6 columns visible: Applied, Shortlisted, Interview Scheduled, Offer, Rejected, Ghosted
- [ ] **Drag card** from Applied to Shortlisted — card moves and status updates in the database
- [ ] **Refresh page** after drag — card stays in the new column (not reverted)
- [ ] **Optimistic update** — card moves instantly before the network response returns
- [ ] **Mobile touch drag** — works on a phone or tablet (or browser DevTools mobile mode)

---

## Interview Round Tracker

- [ ] Open an application detail view
- [ ] **Add round** — fill in round type, date, notes; save; appears in timeline
- [ ] **Edit round** — change status from Pending to Passed; saved correctly
- [ ] **Delete round** — round removed from timeline
- [ ] **Timeline order** — rounds display in chronological order

---

## Notifications

- [ ] **Bell icon** shows a red badge with unread count when reminders are due
- [ ] **Click bell** — dropdown opens listing notifications
- [ ] **Mark one as read** — unread count decreases by 1; item no longer highlighted
- [ ] **Mark all as read** — badge disappears; all items shown as read
- [ ] **Email reminder** — set a follow-up date in the past on an application; cron job sends email (check inbox within 1 hour)

---

## Analytics Dashboard

- [ ] All **6 metric cards** show real numbers (not zeroes or NaN)
- [ ] **Weekly/Monthly toggle** on the line chart switches the time axis
- [ ] **Donut chart** shows status breakdown with correct colors and labels
- [ ] **Horizontal bar chart** shows source breakdown
- [ ] **Top companies** list appears (requires 2+ applications to the same company)
- [ ] **Recent activity** feed shows last 10 changes
- [ ] Data **updates** after adding a new application (cache clears within 5 minutes)

---

## CSV Export

- [ ] Click **Export** button on the Applications page
- [ ] Select status filter "Applied" — preview count updates
- [ ] Click **Download CSV** — browser saves `applications.csv`
- [ ] Open the file in Excel/Sheets — all columns present, data looks correct
- [ ] Export with **no filters** — all applications included

---

## CSV Import

- [ ] Click **Import** button on the Applications page
- [ ] Click **Download Template** — saves a blank `applications-template.csv`
- [ ] Open template in Excel, fill in 3 rows, save as CSV
- [ ] Drag-and-drop the file into the import modal — preview table shows first 5 rows
- [ ] Click **Import** — success screen shows count of imported rows
- [ ] Newly imported applications appear in the Applications list

---

## Chrome Extension

### Setup
- [ ] Extension loaded at `chrome://extensions` with no errors
- [ ] Extension icon visible in Chrome toolbar
- [ ] Click icon → login popup appears
- [ ] Enter production backend URL + credentials → login succeeds
- [ ] Logged-in state persists after closing and reopening popup

### LinkedIn
- [ ] Navigate to a LinkedIn job listing (`linkedin.com/jobs/view/...`)
- [ ] Open extension popup → **Company** and **Role** fields auto-filled
- [ ] **Location** populated (if shown on the page)
- [ ] **Source** set to `LinkedIn`
- [ ] Click **Save to Tracker** → success screen appears
- [ ] Open web app → new application visible in the list

### Naukri
- [ ] Navigate to a Naukri job listing (`naukri.com/...`)
- [ ] Open extension popup → Company and Role auto-filled
- [ ] Source set to `Naukri`
- [ ] Save → appears in web app

### Internshala
- [ ] Navigate to an Internshala listing (`internshala.com/jobs/...` or `.../internships/...`)
- [ ] Open extension popup → Company and Role auto-filled
- [ ] Source set to `Internshala`
- [ ] Save → appears in web app

### Duplicate Detection
- [ ] Navigate to a job you already saved
- [ ] Open popup → "Already in tracker!" screen appears (not the save form)
- [ ] Click **Save again anyway** → form opens pre-filled
- [ ] Submit → second entry saved

### Non-Job Page
- [ ] Navigate to `google.com`
- [ ] Open popup → "Not a job page" screen with platform links

### Logout
- [ ] Click the logout icon (top-right of popup) → auth screen shown
- [ ] Close and reopen popup → still on auth screen (session cleared)

---

## Performance

- [ ] Frontend **Lighthouse score** ≥ 80 on Performance (run in Chrome DevTools)
- [ ] Initial page load under 3 seconds on a fast connection
- [ ] No JavaScript errors in browser console on any page

---

## Security

- [ ] Visiting `/api/applications` without a token returns `401 Unauthorized`
- [ ] Trying to access another user's application ID returns `404` or `403`
- [ ] Password is not visible anywhere in the network responses
- [ ] Stack traces are NOT included in production error responses
