import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBF7CT0zjsqG01WTcWZr-KUFbmiNyVVWSw",
    authDomain: "cursorai-12ebe.firebaseapp.com",
    projectId: "cursorai-12ebe",
    storageBucket: "cursorai-12ebe.appspot.com",
    messagingSenderId: "327589599737",
    appId: "1:327589599737:web:4ea05227ea786c8b550528"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
