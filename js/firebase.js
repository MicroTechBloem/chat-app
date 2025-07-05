import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgXwfnYsRluJb9LQuWBAR8AN5vImAQNrw",
  authDomain: "zyramessaging.firebaseapp.com",
  projectId: "zyramessaging",
  storageBucket: "zyramessaging.appspot.com",
  messagingSenderId: "491143635040",
  appId: "1:491143635040:web:f4c1e853b5754c47306305",
  measurementId: "G-B79SPZZEBX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

window.loginWithGoogle = async function () {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    window.location.href = "/messages.html";
  } catch (error) {
    document.getElementById("msg").innerText = error.message;
  }
};

window.loginWithEmail = async function () {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user);
      document.getElementById('msg').innerText = "Verify your email to continue.";
    } else {
      window.location.href = "/messages.html";
    }
  } catch (error) {
    document.getElementById('msg').innerText = error.message;
  }
};

window.sendLoginLink = async function () {
  const email = document.getElementById('email').value;
  const actionCodeSettings = {
    url: window.location.href,
    handleCodeInApp: true
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", email);
    document.getElementById('msg').innerText = "Check your inbox to complete login.";
  } catch (error) {
    document.getElementById('msg').innerText = error.message;
  }
};

if (isSignInWithEmailLink(auth, window.location.href)) {
  let email = window.localStorage.getItem("emailForSignIn");
  if (!email) email = window.prompt("Enter your email to complete sign-in");

  signInWithEmailLink(auth, email, window.location.href)
    .then((result) => {
      if (!result.user.emailVerified) {
        sendEmailVerification(result.user);
      }
      window.localStorage.removeItem("emailForSignIn");
      window.location.href = "/messages.html";
    })
    .catch((error) => {
      document.getElementById('msg').innerText = error.message;
    });
}
