const socket = io();

const loginDiv = document.getElementById('login');
const usernameInput = document.getElementById('usernameInput');
const usernameBtn = document.getElementById('usernameBtn');

const chatArea = document.getElementById('chatArea');
const messages = document.getElementById('messages');
const userList = document.getElementById('userList');
const form = document.getElementById('form');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');

let username = '';

usernameBtn.onclick = () => {
  if (usernameInput.value.trim() === '') return;
  username = usernameInput.value.trim();
  socket.emit('set username', username);
  loginDiv.style.display = 'none';
  chatArea.style.display = 'block';
  input.focus();
};

socket.on('chat message', msg => {
  const li = document.createElement('li');
  li.textContent = msg;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('user list', users => {
  userList.textContent = users.join(', ');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (input.value.trim() === '') return;
  socket.emit('chat message', input.value.trim());
  input.value = '';
});

input.addEventListener('input', () => {
  sendBtn.disabled = input.value.trim() === '';
});
