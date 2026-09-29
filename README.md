# PRMCEAM College Event Management System (Level 2 • A4)

A comprehensive College Event Registration, FIFO Waiting List, and Attendance Management web application built with strict role-based access control (Admin & Student), automated queue promotion, and real-time seat tracking.

---

## 🌟 Advanced Features (Level 2 • A4)

### 1. Automated First-Come, First-Served (FIFO) Waiting List
- **Waitlist Activation**: When an event reaches maximum capacity (0 seats remaining), eligible students can join the waiting list.
- **Queue Position Tracking**: Students see their exact live position in line (e.g. `Queue Position #1`, `Queue Position #2`), complete with helpful countdown messages.
- **Automatic Seat Promotion**: When a confirmed student cancels their pass (or an administrator removes an attendee), the first student in the FIFO waiting list (`#1 in line`) is **automatically promoted to Confirmed status** immediately!
- **Waitlist Cancellation**: Students on the waiting list can withdraw at any time, instantly moving subsequent students forward in queue order.

### 2. Admin Attendance Management
- **Attendance Marking**: Administrators can mark confirmed student attendees as **Attended**, **Absent**, or **Unmarked**.
- **Real-Time Attendance Filtering**: Filter attendee rosters by `All`, `Attended`, or `Absent`.
- **Dual Roster Management**: Admin can inspect both **Confirmed Attendees** and the live **FIFO Waiting List Queue** for every college event.

---

## 🚀 Getting Started in VS Code

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

### Step 1: Open in VS Code & Install Dependencies
Open a terminal in VS Code (`Ctrl + \`` or `Cmd + \``) inside the project folder:
```bash
npm install
```
*(Note: If your local npm reports peer dependency warnings, run: `npm install --legacy-peer-deps`)*

### Step 2: Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to view the live portal.

### Step 3: Production Build
```bash
npm run build
```
This generates the optimized production bundle in the `dist` directory.

---

## 🐙 Connecting to GitHub

Follow these steps in your VS Code terminal to publish this repository to your GitHub account:

1. **Initialize Git (if not already initialized)**:
   ```bash
   git init
   ```

2. **Stage and Commit all files**:
   ```bash
   git add .
   git commit -m "feat: PRMCEAM Event Registration with Waitlist & Attendance (Level 2 A4)"
   ```

3. **Set main branch**:
   ```bash
   git branch -M main
   ```

4. **Link to your GitHub repository**:
   Create a new empty repository on [GitHub](https://github.com/new), copy the repository URL, and run:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   ```

5. **Push your code**:
   ```bash
   git push -u origin main
   ```

---

## 🌐 Deploying Live

You can deploy this project in under a minute on any modern platform:

- **Vercel**: Import your GitHub repo on [vercel.com](https://vercel.com); Vite preset is detected automatically.
- **Netlify**: Connect your GitHub repository on [netlify.com](https://netlify.com); build command: `npm run build`, publish directory: `dist`.
- **Render / Cloudflare Pages**: Connect repo, set build command `npm run build`, and publish directory `dist`.

---

## 🔐 Strict Authentication & User Roles

### 1. Admin Portal (`Admin Access`)
- **Restricted Access**: Only registered Administrator accounts can log in. Student credentials will be rejected with an access-denied error.
- **Admin Registration**: Protected by an Admin Authorization Key (`ADMIN@PRMCEAM2026`) so only authorized faculty/staff can create administrative accounts.
- **Capabilities**:
  - Create college events with strict validation (**Name**, **Date**, **Time**, and **Max Seats** $\ge 1$).
  - Live capacity dashboard displaying confirmed registrations vs available seats vs waitlist count.
  - Review attendee lists, mark student attendance (**Attended** / **Absent**), and view waitlist queues.
  - Remove attendees (which immediately offers the opened seat to the first waitlisted student).

### 2. Student Portal (`Student Access`)
- **Student Registration**: Students can register with:
  - **Full Name** (at least 2 characters)
  - **College Email** (validated against RFC email format regex)
  - **Roll Number** (alphanumeric pattern, e.g. `CS-2024-042`)
  - **Contact Number** (validated 10-digit mobile number)
  - **Department** & **Password**
- **Capabilities**:
  - Browse upcoming events with real-time remaining seat counters.
  - Instant seat registration (when seats are open).
  - One-click join waiting list (when 0 seats remain).
  - "My Passes & Waitlist" view displaying confirmed passes, attendance statuses, and live waitlist queue positions.
  - Cancel confirmed pass (which automatically promotes the #1 student on the waiting list).

---

## 📋 Existing Accounts for Testing

| Portal Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Admin** | Prof. S. R. Deshmukh | `admin@college.edu` | `admin123` | Event Committee Coordinator |
| **Student** | Rahul Sharma | `rahul@college.edu` | `pass123` | Roll No: `CS-2024-042` |
| **Student** | Priya Patil | `priya@college.edu` | `pass123` | Roll No: `IT-2024-019` |
| **Student** | Amit Verma | `amit@college.edu` | `pass123` | Roll No: `ME-2024-008` |
| **Student** | Sneha Kulkarni | `sneha@college.edu` | `pass123` | Roll No: `EC-2024-031` (Waitlisted on Cloud Computing Seminar) |

---

## 🛡️ Business Logic & Edge Cases Handled

- **Email Validation**: Strict regex verification (`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`).
- **Roll Number Validation**: Alphanumeric format check (`^[a-zA-Z0-9\-_/]{3,20}$`) preventing duplicate roll numbers across students.
- **Phone Number Validation**: Strict 10-digit format (`^(\+?[0-9]{1,3}[- ]?)?[0-9]{10}$`).
- **Seat Capacity Validation**: Event creation requires positive integers $\ge 1$.
- **Duplicate Registration**: A student cannot register for an event multiple times or join the waitlist if already holding a confirmed seat.
- **FIFO Waitlist Promotion**: When a confirmed attendee cancels, the first student on the waiting list (`#1 in line`) is promoted to confirmed status automatically.
