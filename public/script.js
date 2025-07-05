// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCgXwfnYsRluJb9LQuWBAR8AN5vImAQNrw",
  authDomain: "zyramessaging.firebaseapp.com",
  projectId: "zyramessaging",
  storageBucket: "zyramessaging.appspot.com",
  messagingSenderId: "491143635040",
  appId: "1:491143635040:web:f4c1e853b5754c47306305",
  measurementId: "G-B79SPZZEBX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser;

// UI references
const authSection = document.getElementById('auth-section');
const chatSection = document.getElementById('chat-section');
const messageInput = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');
const emojiPicker = document.getElementById('emojiPicker');

// Auth
function signUp() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => showChat())
    .catch(e => alert(e.message));
}

function signIn() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => showChat())
    .catch(e => alert(e.message));
}

function signOut() {
  auth.signOut().then(() => {
    chatSection.style.display = 'none';
    authSection.style.display = 'block';
  });
}

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => showChat())
    .catch(e => alert(e.message));
}

// Show chat
function showChat() {
  currentUser = auth.currentUser;
  if (!currentUser) return;
  authSection.style.display = 'none';
  chatSection.style.display = 'block';
  listenForMessages();
}

// Send message
function sendMessage() {
  const text = messageInput.value;
  if (!text.trim()) return;
  db.collection('messages').add({
    sender: currentUser.email,
    text: text,
    type: 'text',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  messageInput.value = '';
}

// Listen for messages
function listenForMessages() {
  db.collection('messages')
    .orderBy('createdAt')
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.classList.add('chat-message');
        if (data.sender === currentUser.email) {
          div.classList.add('self');
        }

        if (data.type === 'image') {
          const img = document.createElement('img');
          img.src = data.text;
          img.style.maxWidth = '200px';
          div.appendChild(img);
        } else if (data.type === 'video') {
          const video = document.createElement('video');
          video.src = data.text;
          video.controls = true;
          video.style.maxWidth = '200px';
          div.appendChild(video);
        } else {
          div.textContent = `${data.sender}: ${data.text}`;
        }

        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      });
    });
}

// Media upload
function triggerMediaUpload() {
  document.getElementById('mediaUpload').click();
}

document.getElementById('mediaUpload').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const ref = storage.ref(`media/${Date.now()}_${file.name}`);
  await ref.put(file);
  const url = await ref.getDownloadURL();

  const type = file.type.startsWith('image') ? 'image' :
               file.type.startsWith('video') ? 'video' : 'file';

  db.collection('messages').add({
    sender: currentUser.email,
    text: url,
    type: type,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
});

// Emoji picker
function toggleEmojiPicker() {
  emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
  if (emojiPicker.innerHTML === '') {
    ['😀','😎','😂','🥲','😡','😭','❤️','👍','👎','🔥','🎉','🥳'].forEach(emoji => {
      const span = document.createElement('span');
      span.textContent = emoji;
      span.style.cursor = 'pointer';
      span.style.fontSize = '20px';
      span.onclick = () => {
        messageInput.value += emoji;
        emojiPicker.style.display = 'none';
      };
      emojiPicker.appendChild(span);
    });
  }
}

// Placeholder call functions
function startVoiceNote() {
  alert("Voice note recording coming soon.");
}
function startVideoCall() {
  alert("Video calling coming soon.");
}
function startVoiceCall() {
  alert("Voice calling coming soon.");
}

// Auth listener
auth.onAuthStateChanged(user => {
  if (user) showChat();
});

