# BMC LIVE — Build. Compete. Pitch. Win.

Live classroom Business Model Canvas competition platform for engineering students.
Built with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **Framer Motion**, and **Firebase Realtime Database** (with Anonymous Authentication).

---

## Features

- **Dual Responsive Interfaces**:
  - **Host / Teacher View**: Projector-optimized (16:9 1920×1080) with dynamic contextual control bar.
  - **Student View**: Mobile-first, touch-friendly, read-only team views with peer captain scoring.
- **Server-Authoritative Timers**:
  - Centralized Firebase timestamp sync for 15-min preparation, 10-min study, and 3-min presentations.
- **Automated Balanced Teams**:
  - Distributes 5–7 members per team while balancing engineering departments (`AI`, `CSE`, `CY`, `ME`, `CE`, `ECE`, `EEE`, `IC`).
- **Single-Pass Case Assignment**:
  - Assigns unique failed & successful case studies without duplicate reshuffling on refresh.
- **Peer Captain Scoring**:
  - Confidential score submissions by non-presenting team captains with hidden projector tallies until reveal.
- **Winner Celebration**:
  - Podium animations and confetti particle effects on final leaderboard reveal.

---

## Setup & Firebase Configuration

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project (or select your existing project).

### 2. Enable Realtime Database
1. In the left navigation bar, go to **Build** -> **Realtime Database**.
2. Click **Create Database**.
3. Choose your database location and start in **Locked mode**.
4. Go to the **Rules** tab and paste the security rules from `database.rules.json`:

```json
{
  "rules": {
    ".read": "auth != null",
    "sessions": {
      "$sessionId": {
        ".write": "auth != null && (!data.exists() || data.child('hostUid').val() === auth.uid)"
      }
    },
    "sessionCodes": {
      ".write": "auth != null"
    },
    "participants": {
      "$sessionId": {
        "$uid": {
          ".write": "auth != null && ($uid === auth.uid || root.child('sessions').child($sessionId).child('hostUid').val() === auth.uid)"
        }
      }
    },
    "groups": {
      "$sessionId": {
        ".write": "auth != null && root.child('sessions').child($sessionId).child('hostUid').val() === auth.uid"
      }
    },
    "scores": {
      "$sessionId": {
        "$presentingGroupId": {
          "$evaluatorUid": {
            ".write": "auth != null && $evaluatorUid === auth.uid && !data.exists()"
          }
        }
      }
    }
  }
}
```

### 3. Enable Anonymous Authentication
1. Go to **Build** -> **Authentication**.
2. Click **Get Started** -> Select **Sign-in method** tab.
3. Click **Anonymous**, enable the toggle, and click **Save**.

### 4. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase Web App credentials:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=studio-3692413383-3932e.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://studio-3692413383-3932e-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=studio-3692413383-3932e
VITE_FIREBASE_STORAGE_BUCKET=studio-3692413383-3932e.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=324012792381
VITE_FIREBASE_APP_ID=1:324012792381:web:dc7571ed0d41d46a722854
```

---

## Local Development & Build

### Install Dependencies
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```

### Run Type Checking & Build
```bash
npm run build
```

---

## Deployment to Vercel

1. Push code repository to GitHub.
2. Import project into Vercel Dashboard.
3. Add the `VITE_FIREBASE_*` environment variables in Vercel project settings.
4. Deploy!
