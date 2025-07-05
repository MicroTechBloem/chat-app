// rtc.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

let peerConnection;
let localStream;
let remoteStream;
let callDoc;

const servers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ]
};

async function startCall(isVideo = false) {
  const callId = prompt("Enter email of person to call:");
  if (!callId) return;

  const myId = sessionStorage.getItem("uid") || "Caller";
  callDoc = doc(collection(db, "calls"), `${myId}_to_${callId}`);
  peerConnection = new RTCPeerConnection(servers);

  localStream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
  remoteStream = new MediaStream();

  document.body.appendChild(Object.assign(document.createElement("video"), {
    srcObject: localStream,
    muted: true,
    autoplay: true,
    style: "position:fixed;bottom:10px;left:10px;width:150px;border-radius:10px;"
  }));

  const remoteVideo = document.createElement("video");
  remoteVideo.autoplay = true;
  remoteVideo.srcObject = remoteStream;
  remoteVideo.style = "position:fixed;bottom:10px;right:10px;width:150px;border-radius:10px;";
  document.body.appendChild(remoteVideo);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = e => {
    e.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = e => {
    if (e.candidate) {
      setDoc(callDoc, {
        [`${myId}_ice`]: JSON.stringify(e.candidate)
      }, { merge: true });
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  await setDoc(callDoc, {
    offer: JSON.stringify(offer)
  });

  onSnapshot(callDoc, async (snap) => {
    const data = snap.data();

    if (data.answer && !peerConnection.currentRemoteDescription) {
      const answer = JSON.parse(data.answer);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    if (data[`${callId}_ice`]) {
      const candidate = new RTCIceCandidate(JSON.parse(data[`${callId}_ice`]));
      await peerConnection.addIceCandidate(candidate);
    }
  });
}

async function answerCall() {
  const callId = prompt("Enter the call ID sent to you:");
  if (!callId) return;

  const myId = sessionStorage.getItem("uid") || "Receiver";
  callDoc = doc(db, "calls", callId);

  peerConnection = new RTCPeerConnection(servers);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  remoteStream = new MediaStream();

  document.body.appendChild(Object.assign(document.createElement("video"), {
    srcObject: localStream,
    muted: true,
    autoplay: true,
    style: "position:fixed;bottom:10px;left:10px;width:150px;border-radius:10px;"
  }));

  const remoteVideo = document.createElement("video");
  remoteVideo.autoplay = true;
  remoteVideo.srcObject = remoteStream;
  remoteVideo.style = "position:fixed;bottom:10px;right:10px;width:150px;border-radius:10px;";
  document.body.appendChild(remoteVideo);

  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = e => {
    e.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  peerConnection.onicecandidate = e => {
    if (e.candidate) {
      setDoc(callDoc, {
        [`${myId}_ice`]: JSON.stringify(e.candidate)
      }, { merge: true });
    }
  };

  const snap = await callDoc.get();
  const offer = JSON.parse(snap.data().offer);
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  await setDoc(callDoc, {
    answer: JSON.stringify(answer)
  }, { merge: true });

  onSnapshot(callDoc, async (snap) => {
    const data = snap.data();
    if (data[`${callId.split("_to_")[0]}_ice`]) {
      const candidate = new RTCIceCandidate(JSON.parse(data[`${callId.split("_to_")[0]}_ice`]));
      await peerConnection.addIceCandidate(candidate);
    }
  });
}

window.startVoiceCall = () => startCall(false);
window.startVideoCall = () => startCall(true);
