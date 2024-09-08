# Memojiro

https://memojiro.com/

A minimalist note taking app to stop procastinating and free up mind. It has following features.
- Add and save notes on browser with no sign up
- Save on cloud for free with Google sign up
- Drag and drop to change the prioroty
- Tabs to group note
- Integration with AI back end to analyze notes and get recommendations

## How to run
This app is hosted on Google Firebase. Also it uses a Firestore database.
https://console.firebase.google.com/

So, to use a database, authentication or host first we have to setup a Firebase account.
firebaseConfig.ts would look something like below:
```// firebaseConfig.ts
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "<redacted>",
  authDomain: "<redacted>",
  projectId: "<redacted>",
  storageBucket: "<redacted>",
  messagingSenderId: "<redacted>",
  appId: "<redacted>",
  measurementId: "<redacted>",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, provider, db };
```
### Set up firebase
 - `npm i`
 - `npm run dev`


