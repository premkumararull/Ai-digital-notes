let imgFile = null;

document.getElementById('imgInput').addEventListener('change', e => {
  imgFile = e.target.files[0];
  document.getElementById('preview').innerHTML =
    `<img src="${URL.createObjectURL(imgFile)}">`;
});

document.getElementById('scanBtn').addEventListener('click', () => {
  if (!imgFile) return alert('Pick an image first');
  const status = document.getElementById('status');
  status.textContent = 'Scanning...';
  Tesseract.recognize(imgFile, 'eng')
    .then(({ data: { text } }) => {
      document.getElementById('output').value = text;
      status.textContent = 'Done';
    })
    .catch(err => status.textContent = 'Error: ' + err.message);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const text = document.getElementById('output').value.trim();
  if (!text) return;
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.push({ text, date: new Date().toLocaleString() });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
});

function renderNotes() {
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  document.getElementById('notesList').innerHTML =
    notes.map(n => `<li><b>${n.date}</b><br>${n.text}</li>`).join('');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
renderNotes();
