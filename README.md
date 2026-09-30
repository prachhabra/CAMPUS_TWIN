# CampusTwin — "The Digital Twin of Your College"

> **CampusTwin** is an institutional digital operating system and full-fidelity "Digital Twin" for higher education campuses. It seamlessly unifies academic operations, faculty workflows, student engagement, campus facilities, marketplace, grievances, and administrative governance into a single, cohesive, real-time web application.

---

## 🏛️ System Architecture

CampusTwin is architected on a high-performance, real-time **MERN stack** (MongoDB, Express.js, React.js, Node.js) with native WebSocket telemetry via Socket.io.

```
                           ┌────────────────────────┐
                           │      React 18 UI       │
                           │  Vite • Lucide • Chart │
                           └───────────┬────────────┘
                                       │ HTTP / WSS
                                       ▼
                           ┌────────────────────────┐
                           │   Node.js / Express    │
                           │ JWT • Multer • Socket  │
                           └───────────┬────────────┘
                                       │ Mongoose ODM
                                       ▼
                           ┌────────────────────────┐
                           │    MongoDB Database    │
                           │   Aggregations & POIs  │
                           └────────────────────────┘
```

### 1. Strict Institutional Integrity
- **Zero Mock / Dummy Data**: Every single metric, attendance percentage, event participant, grievance ticket, marketplace listing, and leaderboard score is queried directly from persistent MongoDB collections via REST endpoints.
- **Role-Based Access Control (RBAC)**: Fine-grained middleware authorization segregating `student`, `teacher`, and `admin` portals.
- **Protected Administrative Bootstrap**: Public user registration is restricted to Students and Teachers. The Root Institutional Admin account can only be provisioned via the secure CLI bootstrap script (`npm run create-admin`).
- **Real-Time Bidirectional Telemetry**: Instant peer-to-peer campus chat, live online user indicators, and broadcast notifications powered by Socket.io with JWT handshake verification.
- **Physical Verification Ecosystem**: Student Digital IDs dynamically embed signed institutional verification URLs rendered as scannable 2D QR codes with public verification endpoint (`/verify/:id`).

---

## 📦 Directory Structure

```
CAMPUS_TWIN/
├── CampusTwin/                      # Frontend Application (React 18 + Vite)
│   ├── public/                      # Static assets and icons
│   ├── src/
│   │   ├── Admin/                   # 16 Administration Portal Views
│   │   │   ├── AdminAnalytics.jsx   # Aggregated institutional analytics
│   │   │   ├── AdminAttendance.jsx  # System-wide attendance audit
│   │   │   ├── AdminCampusMap.jsx   # Interactive POI management
│   │   │   ├── AdminClubs.jsx       # Student clubs governance
│   │   │   ├── AdminComplaints.jsx  # Grievance lifecycle resolution
│   │   │   ├── AdminConfessions.jsx # Anonymous wall moderation
│   │   │   ├── AdminDashboard.jsx   # Institutional executive cockpit
│   │   │   ├── AdminEvents.jsx      # Event approval & capacity audit
│   │   │   ├── AdminLostFound.jsx   # Campus lost & found management
│   │   │   ├── AdminMarketplace.jsx # Peer marketplace moderation
│   │   │   ├── AdminPlacements.jsx  # Corporate placement tracker
│   │   │   ├── AdminProfile.jsx     # Administrator identity & security
│   │   │   ├── AdminSkills.jsx      # Skill exchange registry
│   │   │   ├── AdminStudents.jsx    # Student directory & management
│   │   │   ├── AdminStudyGroups.jsx # Peer study circles
│   │   │   └── AdminTeachers.jsx    # Faculty roster & credentials
│   │   ├── Teacher/                 # 7 Faculty Portal Views
│   │   │   ├── TeacherAnalytics.jsx # Course & attendance trends
│   │   │   ├── TeacherAttendance.jsx# Attendance marking & sessions
│   │   │   ├── TeacherClasses.jsx   # Class syllabus & student roster
│   │   │   ├── TeacherDashboard.jsx # Faculty schedule & stats
│   │   │   ├── TeacherEvents.jsx    # Academic & club event creation
│   │   │   ├── TeacherProfile.jsx   # Faculty bio & credentials
│   │   │   └── TeacherStudents.jsx  # Student directory & performance
│   │   ├── Student/                 # 17 Student Portal Views
│   │   │   ├── StudentAchievements.jsx # Badges, levels & points
│   │   │   ├── StudentAnalytics.jsx # Personal attendance & metrics
│   │   │   ├── StudentAttendance.jsx# Attendance log & percentage
│   │   │   ├── StudentCampusMap.jsx # Interactive Leaflet twin map
│   │   │   ├── StudentChat.jsx      # Real-time campus messenger
│   │   │   ├── StudentClubs.jsx     # Club discovery & membership
│   │   │   ├── StudentComplaints.jsx# Grievance submission & tracking
│   │   │   ├── StudentConfession.jsx# Anonymous campus bulletin
│   │   │   ├── StudentDashboard.jsx # Student hub & daily schedule
│   │   │   ├── StudentDigitalId.jsx # Scannable Digital Student ID
│   │   │   ├── StudentEvents.jsx    # Event discovery & RSVP
│   │   │   ├── StudentLostFound.jsx # Lost item reporting & recovery
│   │   │   ├── StudentMarketplace.jsx# Peer-to-peer buy/sell
│   │   │   ├── StudentPlacement.jsx # Career opportunities & status
│   │   │   ├── StudentProfile.jsx   # Student profile & avatar
│   │   │   ├── StudentSkills.jsx    # Peer tutoring & skill sharing
│   │   │   └── StudentStudyGroups.jsx# Collaborative study circles
│   │   ├── components/              # 16 Reusable UI Components
│   │   ├── context/                 # Auth, Toast, and Socket Contexts
│   │   ├── layouts/                 # DashboardLayout & AuthLayout
│   │   ├── pages/                   # Login, Register, VerifyDigitalId, 404
│   │   ├── services/                # 17 Axios REST Service Connectors
│   │   ├── utils/                   # Constants and helper functions
│   │   ├── App.jsx                  # Complete Route Hierarchy
│   │   ├── index.css                # Institutional SaaS Design System
│   │   └── main.jsx                 # Application Entry Point
│   ├── .env                         # Frontend environment configuration
│   ├── .env.example                 # Template for frontend environment
│   ├── package.json
│   └── vite.config.js
│
├── CampusTwin_backend/              # Backend Application (Node.js + Express)
│   ├── config/                      # MongoDB Connection Configuration
│   ├── controllers/                 # 18 Modular REST Controllers
│   ├── middleware/                  # JWT Auth, RBAC, Multer, Error Handlers
│   ├── models/                      # 18 Mongoose Domain Schemas
│   ├── routes/                      # Modular Express Route Declarations
│   ├── socket/                      # Socket.io Event Handlers
│   ├── uploads/                     # Local storage for avatars/receipts
│   ├── utils/                       # Token, Gamification & Admin Bootstrap
│   ├── .env                         # Backend environment configuration
│   ├── .env.example                 # Template for backend environment
│   ├── app.js                       # Express Application Setup
│   ├── server.js                    # HTTP + WebSocket Server Entry
│   └── package.json
└── README.md
```

---

## ⚡ Prerequisites

- **Node.js**: `v18.0.0` or higher (verified on Node `v25.x`)
- **npm**: `v9.0.0` or higher
- **MongoDB**: `v6.0` or higher (local daemon running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

---

## ⚙️ Environment Configuration

### Backend: `CampusTwin_backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/CampusTwin
JWT_SECRET=campustwin_institutional_jwt_secret_key_2026_secure
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend: `CampusTwin/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quickstart Installation & Execution

### Step 1: Install Backend Dependencies
```bash
cd CampusTwin_backend
npm install
```

### Step 2: Bootstrap Initial Institutional Admin Account
To maintain zero-compromise institutional security, admin accounts cannot be created from public registration. Execute the CLI provisioner:
```bash
npm run create-admin
```
*Default Credentials Created:*
- **Email:** `admin@campustwin.edu`
- **Password:** `AdminPass123!`
- **Role:** `admin`

### Step 3: Launch Backend REST & WebSocket Server
```bash
npm start
# or for live watch mode:
npm run dev
```
The backend initializes on `http://localhost:5000` and validates database connectivity.

### Step 4: Install Frontend Dependencies & Start Client
In a new terminal window:
```bash
cd CampusTwin
npm install
npm run dev
```
The client will launch at `http://localhost:5173`.

---

## 🎯 Role Capabilities Matrix

| Feature Domain | Student Portal | Faculty / Teacher Portal | Administration Portal |
| :--- | :---: | :---: | :---: |
| **Authentication & Auth** | Student Registration & Login | Faculty Registration & Login | CLI Bootstrapped Admin Login |
| **Digital Student ID** | Scannable Card with QR Code | View Verification Status | View & Validate System-wide |
| **Attendance Tracking** | Personal Subject-wise % | Mark Sessions & QR Attendance | System-wide Audit & Override |
| **Course Management** | Enrolled Subjects | Class Rosters & Syllabus | Academic Overview |
| **Interactive Campus Map** | POI Navigation & Discovery | Facility Locator | Full CRUD Geo-Marker Placement |
| **Events & Calendar** | RSVP & Capacity Check | Create & Manage Events | Approve, Oversee & Moderate |
| **Clubs & Organizations** | Join & View Chapter Activities| Faculty Advisor Views | Manage Club Status & Leaders |
| **Campus Marketplace** | Post Items, Buy/Sell, Mark Sold | View Postings | Moderate & Remove Listings |
| **Lost & Found** | Report Lost/Found, Claim Flow | View Campus Items | Resolve Claims & Manage Inventory |
| **Grievance Desk** | Submit Grievance with Tracking | Submit Academic Issues | Resolve, Assign & Update Status |
| **Peer Study Circles** | Create & Join Study Groups | Supervise Study Groups | Moderate Study Communities |
| **Skill Exchange** | Offer & Request Peer Tutoring | View Student Skills | Audit Skill Registry |
| **Anonymous Wall** | Post Anonymously & Upvote | Read Feed | Moderate & Remove Inappropriate Posts |
| **Placement Tracker** | Track Drives, Status & Offers | View Company Schedules | Post Drives & Update Student Status |
| **Gamification Engine** | Points, Badges & Milestone Levels | Award Academic Badges | System Leaderboard Governance |
| **Campus Messenger** | Real-Time Peer & Faculty Chat | Direct Student Communications | System Communication Audit |
| **Institutional Analytics**| Personal Academic Performance | Class Attendance Telemetry | MongoDB Aggregation Dashboards |

---

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Salted BCrypt (10 rounds) hashing on all user passwords.
2. **Stateless JWT Authorization**: Bearer tokens with strict 7-day expiration and automatic expiration redirection.
3. **Role Enforcement**: Strict middleware checks on all protected API routes rejecting unauthorized escalations.
4. **Input Sanitization & Validation**: Server-side validation on required schema fields, coordinate bounds, and status enums.
5. **CORS Isolation**: Controlled cross-origin resource sharing restricted exclusively to designated `CLIENT_ORIGIN`.
6. **File Upload Hardening**: Multer storage configured with strict file-type regex (`jpeg|jpg|png|webp`) and 5MB payload limit.

---

## 🧪 Verification & Health Check

- **API Health Check**: `GET http://localhost:5000/api/health` returns `{ "status": "ok", "timestamp": ... }`.
- **Public ID Verification**: `GET http://localhost:5000/api/users/verify/:studentId` returns official institutional student details.
- **WebSocket Gateway**: Connects at `ws://localhost:5000` with JWT auth handshake for real-time channels.
