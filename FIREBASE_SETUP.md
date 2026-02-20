# Firebase Setup Guide

Firebase has been integrated into your Time Logger app! Follow these steps to complete the setup:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `time-logger` (or any name you prefer)
4. Disable Google Analytics (optional for this app) → **Create project**
5. Wait for project creation (~30 seconds)

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon** (`</>`) to add a web app
2. App nickname: `Time Logger Web`
3. **Do NOT** check "Set up Firebase Hosting"
4. Click **Register app**
5. You'll see your Firebase configuration - **copy it** (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Enable Firestore Database

1. In the Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (allows read/write for 30 days)
4. Select a location close to you (e.g., `us-central` or `asia-southeast1`)
5. Click **Enable**

## Step 4: Update Your App Configuration

1. Open `src/firebase.ts` in your code editor
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // Replace this
  authDomain: "YOUR_PROJECT.firebaseapp.com",  // Replace this
  projectId: "YOUR_PROJECT_ID",             // Replace this
  storageBucket: "YOUR_PROJECT.appspot.com", // Replace this
  messagingSenderId: "YOUR_SENDER_ID",      // Replace this
  appId: "YOUR_APP_ID"                      // Replace this
};
```

3. Save the file

## Step 5: Set Firestore Security Rules (Important!)

By default, test mode expires in 30 days. Set proper rules:

1. In Firebase Console → **Firestore Database** → **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /time-logs/{document} {
      allow read, write: if true;  // Change this if you want authentication
    }
  }
}
```

3. Click **Publish**

> **Note:** The rule `allow read, write: if true` means ANYONE can read/write your data. This is fine for personal use on localhost, but if you deploy publicly, you should add authentication!

## Step 6: Test It!

1. Restart your dev server if needed: `npm run dev`
2. Open http://localhost:5173
3. You should see "Synced across all devices" indicator
4. Add a time log entry
5. Check Firebase Console → **Firestore Database** → you should see your data!

## Step 7: Test Cross-Device Sync

1. Open http://192.168.1.252:5173 on your phone (same WiFi)
2. Add an entry from your phone
3. Watch it appear **instantly** on your computer!
4. Delete from computer → disappears from phone

---

## Troubleshooting

### Error: "Failed to add log. Check Firebase configuration."
- Make sure you updated `src/firebase.ts` with your actual config
- Check browser console for detailed error messages

### Data not syncing
- Ensure Firestore is enabled in Firebase Console
- Check security rules allow read/write
- Open browser DevTools → Network tab → look for Firebase errors

### Want to migrate existing localStorage data?
Run this in browser console:
```javascript
const oldLogs = JSON.parse(localStorage.getItem('time-logs') || '[]');
console.log('Old logs:', oldLogs);
// Then manually add them via the app UI, or we can write a migration script
```

---

## Next Steps (Optional)

### Add Authentication
To secure your data, add Firebase Authentication:
- Only YOU can see your time logs
- Let me know if you want this!

### Deploy to Production
- Host on Firebase Hosting (free)
- Get a public URL: `your-app.web.app`
- Access from anywhere!

---

**Need help?** Let me know if you encounter any issues!
