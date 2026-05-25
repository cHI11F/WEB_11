# Light Theme, UI Layouts, and API Fixes

- `[x]` **Theme Refactoring (Light Theme)**
  - `[x]` Update `src/index.css` (background, text, glassmorphism)
  - `[x]` Update `App.jsx`
  - `[x]` Update `Button.jsx`
  - `[x]` Update `Navbar.jsx` (colors)
  - `[x]` Update `Home.jsx`
  - `[x]` Update `AdminDashboard.jsx`
  - `[x]` Update `TrainerDashboard.jsx`
  - `[x]` Update `MemberDashboard.jsx`
  - `[x]` Update `Classes.jsx`, `Memberships.jsx`, `Footer.jsx`
  - `[x]` Update `Modal.jsx`, `Spinner.jsx`

- `[x]` **UI Layout Fixes & Cleanups**
  - `[x]` Navbar: Fix squished links (ClassesMemberships) and overlapping buttons
  - `[x]` Footer: Fix invisible text (contrast) and remove dead links/icons completely
  - `[x]` Memberships: Fix "Most Popular" badge absolute positioning overlapping
  - `[x]` Dashboards: Fix overlapping tabs (add flex-wrap/gap)
  - `[x]` Home: Fix hero buttons overlapping
  - `[x]` Ensure tables/modals handle overflow correctly

- `[x]` **API & Payload Debugging**
  - `[x]` Fix `AdminDashboard.jsx` Class Creation fallback (backend)
  - `[x]` Fix `AdminDashboard.jsx` Membership Creation parsing (backend)
  - `[x]` Add defensive checks to `api/index.js` for `POST /admin/classes`

- `[x]` **Vercel Readiness**
  - `[x]` Update `vercel.json` to handle SPA routing
  - `[x]` Update `api/index.js` for proper CORS
  - `[x]` Update `src/utils/api.js` to use dynamic API Base URL
