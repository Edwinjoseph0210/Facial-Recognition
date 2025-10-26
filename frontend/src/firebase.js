import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Replace with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyD6ENT1Dw5Jog0P6LJbrhfyJHC6yQdH2bI",
    authDomain: "facial-reco-18490.firebaseapp.com",
    projectId: "facial-reco-18490",
    storageBucket: "facial-reco-18490.firebasestorage.app",
    messagingSenderId: "784553729701",
    appId: "1:784553729701:web:aebb4a2650e9cee66d774c",
    measurementId: "G-5F5LM02WWL"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;

