# PupilScholar — Cross-Platform School Management App (Expo)

PupilScholar is a modular, production-ready React Native / Expo application built for both **Android** and **iOS**. It provides a unified single login system supporting **Parent**, **Student**, and **Teacher** roles, complete with dedicated, feature-rich dashboards for each user type.

---

## 📁 Project Architecture & File Structure

```text
PupilScholar-Android/
├── App.js                     # Root entry point with SafeAreaProvider, ThemeProvider, AuthProvider
├── app.json                   # Expo cross-platform configuration (iOS & Android)
├── package.json               # Dependencies and start scripts
└── src/
    ├── components/            # Global Reusable UI Components
    │   ├── common/
    │   │   ├── Avatar.js      # User avatar with photo fallback to initials & status
    │   │   ├── Badge.js       # Status badges & role indicators
    │   │   ├── Button.js      # Universal button (variants, roles, loading states)
    │   │   ├── Card.js        # Surface containers (elevated, flat, outlined)
    │   │   ├── ForgotPasswordModal.js # Modal for password recovery
    │   │   ├── Input.js       # Fixed-height text input with dark/light themes
    │   │   └── StatCard.js    # Metric KPI cards for dashboards
    │   ├── feedback/
    │   │   ├── AlertBanner.js # In-app notification & alert banners
    │   │   └── Loading.js     # Spinners (fullscreen, inline, overlay)
    │   ├── layout/
    │   │   ├── GlassTaskbar.js # iOS-style dark & light glass finish taskbar
    │   │   ├── Header.js      # App bar with back, title, role & profile avatar
    │   │   └── ScreenWrapper.js # Modern react-native-safe-area-context container
    │   ├── typography/
    │   │   └── AppText.js     # Unified typography (h1, h2, h3, subtitle, body, etc.)
    │   └── index.js           # Central barrel export for all components
    ├── constants/             # Design Tokens & Theming
    │   ├── colors.js          # Brand, role palettes (teacher, student, parent)
    │   ├── spacing.js         # Spacing scales, border radius, native shadows
    │   ├── typography.js      # Font scales, line heights, weights
    │   └── index.js
    ├── context/               # Global State Management
    │   ├── AuthContext.js     # Single login, auth session, role switching
    │   ├── ThemeContext.js    # Global Dark & Light mode theme engine
    │   └── index.js
    ├── data/                  # Mock Domain Data
    │   ├── mockUsers.js       # Pre-configured teacher, student & parent users
    │   ├── mockSchoolData.js  # Classes, timetables, assignments, attendance, fees
    │   └── index.js
    ├── navigation/            # Routing Layer
    │   └── AppNavigator.js    # Splash & conditional role-based screen routing
    └── screens/               # Application Screens
        ├── splash/
        │   └── SplashScreen.js # 3D animated splash screen with loading sequence
        ├── auth/
        │   └── LoginScreen.js # Non-scrolling login with Remember Me & Forgot Password
        ├── teacher/
        │   └── TeacherDashboardScreen.js # Schedule, grading, classes, notices
        ├── student/
        │   └── StudentDashboardScreen.js # Timetable, assignments, GPA, grades
        ├── parent/
        │   └── ParentDashboardScreen.js  # Child selector, live bus/attendance, fees
        ├── shared/
        │   └── ProfileScreen.js # User profile, Dark/Light mode switcher, & Logout
        └── index.js
```

---

## 🔑 Single Login System & Demo Accounts

PupilScholar uses a **Single Unified Login Page** where any user (Parent, Student, or Teacher) enters their credentials. The portal automatically detects the role upon sign-in.

### Pre-configured Accounts:
| Role | Email / Username | Password | User Details |
| :--- | :--- | :--- | :--- |
| **👩‍🏫 Teacher** | `teacher@school.com` | `password123` | Mrs. Sarah Jenkins (Senior Math Faculty) |
| **🎒 Student** | `student@school.com` | `password123` | Alex Rivera (Grade 10 - Section A) |
| **👨‍👩‍👧 Parent** | `parent@school.com` | `password123` | David Rivera (Guardian of Alex & Emma) |

> **💡 Instant Demo Feature:** The login screen includes **one-tap demo buttons** at the bottom so you can instantly switch into any dashboard without manually typing credentials during evaluation.

---

## 📱 Dashboards by Role

### 1. Teacher Dashboard (`TeacherDashboardScreen.js`)
- **Key Metrics:** Total Students (94), Classes Today (4), Pending Reviews (18), Attendance Rate (96.2%).
- **Quick Action Bar:** Quick actions for Attendance marking, New Assignment creation, Grade Book, and Broadcasting Notices.
- **Teaching Schedule:** Live view of today's periods with active period highlighted, room numbers, and student enrollment counts.
- **Pending Review & Grading:** Mid-term reports, quizzes, and deadline tracking.
- **Faculty Notices:** Departmental circulars and meeting schedules.

### 2. Student Dashboard (`StudentDashboardScreen.js`)
- **Key Metrics:** Overall Attendance (94.5%), Cumulative GPA (3.88), Tasks Due (3), Honors Credits (42/60).
- **Today's Classes:** Interactive timetable with the current in-progress period, teacher names, and classrooms.
- **Assignments & Homework:** Real-time urgency badges, deadlines, and graded homework scores.
- **Recent Test Grades:** Breakdown of quiz, midterm, and project scores.

### 3. Parent Dashboard (`ParentDashboardScreen.js`)
- **Multi-Child Selector:** One-tap switcher between children (e.g., Alex Rivera in Grade 10 and Emma Rivera in Grade 6).
- **Live Child Safety & Attendance:** Real-time campus arrival timestamp and school bus boarding status.
- **Academic Progress & Standing:** Class rank, term performance, and teacher remarks.
- **Fee Management:** Tuition balance, due dates, and instant payment/receipt actions.
- **School Circulars:** Parent-teacher conference bookings and seasonal breaks.

---

## 🧩 Global Components Reference

All components can be imported from a single path:
```javascript
import {
  Button,
  AppText,
  Input,
  Card,
  Badge,
  Avatar,
  StatCard,
  Loading,
  ScreenWrapper,
  Header,
  AlertBanner,
} from './src/components';
```

### Component Highlights:
- **`Button`**: Supports `primary`, `secondary`, `outline`, `ghost`, `soft`, and `danger` variants; `sm`, `md`, `lg` sizes; `loading` spinner; role-specific color adaptation (`role="teacher" | "student" | "parent"`).
- **`AppText`**: Cross-platform typography with preset variants (`h1`, `h2`, `h3`, `subtitle`, `body`, `bodyBold`, `caption`, `label`) and color themes.
- **`Input`**: Clean text input with floating-style labels, required indicator, left accessory, secure password visibility toggle, and error states.
- **`Card`**: Elevated, flat, or outlined surfaces with role accent borders.
- **`Badge`**: Status indicators (`success`, `warning`, `danger`, `info`, `teacher`, `student`, `parent`).
- **`Avatar`**: Remote photo loader with fallback to stylized user initials and live status dot.
- **`StatCard`**: Dashboard KPI cards with icon, metric value, title, and trend.
- **`Loading`**: Flexible loading spinner (`fullscreen`, `inline`, `centered`, or `overlay`).
- **`ScreenWrapper`**: Safe-area aware container handling notches on iOS and Android navigation bars with automatic keyboard avoiding support.

---

## 🚀 Running the App

### Start Expo development server:
```bash
npm start
```

### Run on Android:
```bash
npm run android
```

### Run on iOS (macOS required):
```bash
npm run ios
```

### Run on Web:
```bash
npm run web
```
