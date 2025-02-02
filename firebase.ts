// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "instagram-next-30132.firebaseapp.com",
  projectId: "instagram-next-30132",
  storageBucket: "instagram-next-30132.firebasestorage.app",
  messagingSenderId: "785083082617",
  appId: "1:785083082617:web:b8daf0a3c87b07208671a8",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
//       allow read;
//       allow write: if
//       request.resource.size < 2 * 1024 * 1024 &&
//       request.resource.contentType.matches('image/.*')
//     }
//   }
// }