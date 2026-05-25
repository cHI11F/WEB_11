# C1FIT — Premium Fitness Club & Membership Management System.

**Live URL:** [https://web-11-iota.vercel.app/](https://web-11-iota.vercel.app/)

## 1. Title & Overview

### Core Features:
- **Membership Plan Management:** Seamless package upgrades and switches.
- **Workout Logging & Tracking:** CRUD operations: Log, Edit, and Delete workouts.
- **Class Booking & Cancellations:** Smooth booking system with instant error-free cancellation backend handling.
- **Role-Based Dynamic Dashboards:** Dedicated portal spaces for Members, Trainers, and Admins.
- **Modern Light Glassmorphism Responsive UI:** Premium, aesthetically polished interface across all devices.

---

## 2. Authentication & Role Access (Авторизація)

**Auth Pages:** 
- `/login`
- `/register`

*Secure session handling is implemented using JWTs securely passed between the client and the Express backend.*

### Roles & Privileges

| Role | Privileges |
| :--- | :--- |
| **Admin** | Full system command. Has team and management control, oversees all classes, users, and global metrics. |
| **Trainer** | Manages personal class schedules and views trainee/client progression. |
| **Member** | Books classes, logs personal workouts, and manages active subscription tiers. |

### Demo Credentials

*Use these credentials to instantly log in and test the respective role functionalities.*

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@fitness.com` | `password123` |
| **Trainer** | `jane@fitness.com` | `password123` |
| **Member** | `john@fitness.com` | `password123` |

---

## 3. Application Pages & Routes (Сторінки проекту)

Below is the ordered list of every primary page/route present in the frontend architecture.

1. **Home Page (Landing)** — `/`
   - **Description:** Hero section with call-to-actions, centralized modern grid view of fitness modules.
   - ![Home Page](./screenshots/home.png)

2. **Login / Register** — `/login` and `/register`
   - **Description:** Clean, centered responsive forms with premium validation indicators.
   - ![Login / Register](./screenshots/login.png)

3. **Classes** — `/classes`
   - **Description:** Symmetrical centered grid layout showing upcoming personal and group training sessions.
   - ![Classes](./screenshots/classes.png)

4. **Memberships** — `/memberships`
   - **Description:** Centered grid array displaying subscription pricing tiers and plan details.
   - ![Memberships](./screenshots/memberships.png)

5. **Member Dashboard** — `/dashboard`
   - **Description:** Personal client space for scheduling, active plans tracker, and workout logs.
   - ![Member Dashboard](./screenshots/member-dashboard.png)

6. **Trainer Dashboard** — `/trainer`
   - **Description:** Specialized workspace for managing personal trainee rosters and group tracking metrics.
   - ![Trainer Dashboard](./screenshots/trainer-dashboard.png)

7. **Admin Dashboard** — `/admin`
   - **Description:** Global command center with pill-navigation tabs, user directory table, system metrics widgets, and record mutations.
   - ![Admin Dashboard](./screenshots/admin-dashboard.png)

8. **Profile Settings** — `/profile`
   - **Description:** User identity configuration page for personal details updating *(Note: Future roadmap integration)*.
   - ![Profile Settings](./screenshots/profile.png)
