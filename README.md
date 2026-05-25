# 🏋️ C1FIT - Premium Fitness Club Management System

Welcome to the **C1FIT** documentation. C1FIT is a modern, high-end web application designed to manage fitness club operations seamlessly. It provides dedicated interfaces for Members, Trainers, and Administrators, wrapped in a premium, ultra-minimalist UI.

---

## 1. Project Overview & Tech Stack

**Project Name:** C1FIT  
**Description:** A complete Premium Fitness Club Management System featuring class booking, workout tracking, membership management, and role-based administrative controls.

### Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **Database:** SQLite (Turso / libSQL)
- **Authentication:** JWT (JSON Web Tokens) & bcrypt

### High-level Folder Structure

```text
C1FIT/
├── api/                  # Express.js backend API and database setup
│   ├── index.js          # Main server entry point
│   └── setup-db.js       # Database schema and seed data
├── public/               # Static public assets (Favicon, etc.)
├── src/                  # React frontend application
│   ├── assets/           # Images, SVGs, and visual assets
│   ├── components/       # Reusable UI components (Navbar, Modal, Spinner)
│   │   └── ui/           # Atomic UI elements (Buttons, Inputs)
│   ├── context/          # React Context (AuthContext)
│   ├── pages/            # Application routes/pages
│   └── utils/            # Helper functions (API interceptors)
├── index.html            # Main HTML template
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite bundler configuration
```

---

## 2. Authentication & Roles (Авторизація)

The system utilizes secure role-based access control (RBAC).

**Login Page URL:** `/login`  
**Registration Page URL:** `/register`

### User Roles
1. **Member:** Can view schedules, book classes, track personal workout logs, and manage their membership plans.
2. **Trainer:** Can view their assigned classes, create new classes, and track their clients' progress.
3. **Admin:** Has full system control. Can view global statistics, manage users (change roles, delete accounts), and manage all classes and memberships.

### Demo Credentials Table

Use the following credentials to easily test the application's different roles.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@fitness.com` | `password123` |
| **Trainer** | `jane@fitness.com` | `password123` |
| **Trainer** | `max@fitness.com` | `password123` |
| **Member** | `john@fitness.com` | `password123` |
| **Member** | `maria@fitness.com` | `password123` |

---

## 3. Application Pages & Features (Сторінки та Функції)

Below is a comprehensive list of all routes and their respective functionalities.

### Home (Головна)
- **URL Path:** `/`
- **Core Features & Functions:**
  - Landing page with a premium hero section.
  - Call-to-action buttons for class browsing and free trials.
  - Ultra-minimalist conversion-focused layout.

![Home Page](./screenshots/home.png)

---

### Classes (Класи)
- **URL Path:** `/classes`
- **Core Features & Functions:**
  - View all upcoming fitness classes in a perfectly centered grid.
  - Check class capacity, date, time, and assigned trainers.

![Classes Page](./screenshots/classes.png)

---

### Memberships (Абонементи)
- **URL Path:** `/memberships`
- **Core Features & Functions:**
  - View available membership tiers (Basic, Pro, Elite).
  - Compare features and pricing.
  - Dynamic highlight for the most popular plan.

![Memberships Page](./screenshots/memberships.png)

---

### Member Dashboard (Панель Користувача)
- **URL Path:** `/dashboard`
- **Core Features & Functions:**
  - **Overview Tab:** View total workouts, calories burned, active minutes, and a visual activity chart.
  - **Workouts Tab:** Log new personal workouts and view history.
  - **Bookings Tab:** View upcoming booked classes and cancel bookings.
  - **Membership Tab:** Check current active plan details, validity, and upgrade options.

![Member Dashboard](./screenshots/member-dashboard.png)

---

### Trainer Dashboard (Панель Тренера)
- **URL Path:** `/trainer`
- **Core Features & Functions:**
  - **Classes Tab:** View personal teaching schedule, create new classes, edit class details, and delete classes.
  - **Clients Tab:** View a list of clients who have booked their classes and check their progress.

![Trainer Dashboard](./screenshots/trainer-dashboard.png)

---

### Admin Dashboard (Панель Адміністратора)
- **URL Path:** `/admin`
- **Core Features & Functions:**
  - **Overview Tab:** View global system statistics (Total Users, Total Classes, Bookings, Revenue) with a Bar Chart.
  - **Users Tab:** Manage all users, edit roles (promote to Trainer/Admin), or delete accounts.
  - **Classes Tab:** Full CRUD (Create, Read, Update, Delete) access to the entire system schedule.
  - **Memberships Tab:** Full CRUD access to membership pricing plans and features.

![Admin Dashboard](./screenshots/admin-dashboard.png)

---

### Login & Register (Вхід та Реєстрація)
- **URL Path:** `/login` and `/register`
- **Core Features & Functions:**
  - Secure authentication and account creation.
  - Automatic redirection to the appropriate dashboard based on user role.

![Login Page](./screenshots/login.png)

---

*Documentation generated for C1FIT.*
