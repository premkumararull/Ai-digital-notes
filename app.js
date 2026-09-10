let imgFile = null;

document.getElementById('imgInput').addEventListener('change', e => {
  imgFile = e.target.files[0];
  document.getElementById('preview').innerHTML =
    `<img src="${URL.createObjectURL(imgFile)}">`;
});

document.getElementById('scanBtn').addEventListener('click', () => {
  if (!imgFile) return alert('Pick an image first');
  const status = document.getElementById('status');
  status.textContent = 'SCANNING...';
  Tesseract.recognize(imgFile, 'eng')
    .then(({ data: { text } }) => {
      document.getElementById('output').value = text;
      status.textContent = 'DONE';
    })
    .catch(err => status.textContent = 'ERROR: ' + err.message);
});

document.getElementById('saveBtn').addEventListener('click', () => {
  const text = document.getElementById('output').value.trim();
  if (!text) return;
  const notes = JSON.parse(localStorage.getItem('notes') || '[]');
  notes.push({ text, date: new Date().toLocaleString() });
  localStorage.setItem('notes', JSON.stringify(notes));
  renderNotes();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const text = document.getElementById('output').value.trim();
  if (!text) return alert('Nothing to export');

  const { Document, Packer, Paragraph, TextRun } = docx;
  const doc = new Document({
    sections: [{
      children: text.split('\n').map(line =>
        new Paragraph({
          children: [new TextRun({ text: line, font: 'Calibri', size: 24 })]
        })
      )
    }]
  });

  Packer.toBlob(doc).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'note.docx';
    a.click();
    URL.revokeObjectURL(url);
  });
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
