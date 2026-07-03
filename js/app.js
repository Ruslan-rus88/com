/* COM — shared page logic */

// ---------- search (start page) ----------
const searchInput = document.querySelector('.search input');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = searchInput.value.toLowerCase();
    if (/(gef|qualle|kaktus|spinne|gift)/.test(q)) location.href = 'gefaehrlich.html';
    else if (/(abc|buchstabe|tier)/.test(q)) location.href = 'abc.html';
    else if (/(freund)/.test(q)) location.href = 'freunde.html';
  });
}

// ---------- quiz (danger page) ----------
const quiz = document.querySelector('.quiz');
if (quiz) {
  const feedback = quiz.querySelector('.quiz-feedback');
  quiz.querySelectorAll('.quiz-options button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const right = btn.dataset.answer === 'right';
      quiz.querySelectorAll('.quiz-options button').forEach((b) => b.classList.remove('picked-right', 'picked-wrong'));
      btn.classList.add(right ? 'picked-right' : 'picked-wrong');
      feedback.textContent = right ? 'Richtig! Super aufgepasst! ★' : 'Hmm, lieber nicht — probier nochmal!';
      feedback.className = 'quiz-feedback ' + (right ? 'right' : 'wrong');
      feedback.hidden = false;
    });
  });
}

// ---------- abc page ----------
const abcGrid = document.querySelector('.abc-grid');
if (abcGrid) {
  const bubbleSlot = document.querySelector('.abc-bubble-slot');
  const colors = ['orange', 'blue', 'green'];
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.textContent = ch;
    btn.className = colors[i % 3];
    const tilt = (i % 2 === 0 ? -1 : 1) * (1 + (i % 3));
    btn.style.transform = 'rotate(' + tilt + 'deg)';
    btn.addEventListener('click', () => {
      abcGrid.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      bubbleSlot.innerHTML = '<div class="abc-bubble">' + ch + ch + ch + '!</div>';
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(ch);
        u.lang = 'de-DE';
        u.rate = 0.85;
        speechSynthesis.speak(u);
      }
    });
    abcGrid.appendChild(btn);
  });
}

// ---------- friends page ----------
const friendBtn = document.querySelector('.friend-btn');
if (friendBtn) {
  const row = document.querySelector('.friends-row');
  const msg = document.querySelector('.friend-msg');
  const names = ['Mia', 'Ben', 'Lina', 'Tom', 'Emma', 'Leo', 'Nala', 'Max', 'Ida', 'Paul'];
  const palette = [
    { color: '#E8823C', bg: '#FBE8D8' },
    { color: '#5B9BD5', bg: '#E4EFF9' },
    { color: '#8CBF3F', bg: '#EDF5DE' },
  ];
  let count = 0;

  const stickFigure = (color) =>
    '<svg width="52" height="52" viewBox="0 0 52 52">' +
    '<circle cx="26" cy="20" r="11" fill="none" stroke="' + color + '" stroke-width="3.5"></circle>' +
    '<circle cx="22" cy="18" r="1.8" fill="' + color + '"></circle>' +
    '<circle cx="30" cy="18" r="1.8" fill="' + color + '"></circle>' +
    '<path d="M21 24 q 5 4, 10 0" stroke="' + color + '" stroke-width="2.5" fill="none" stroke-linecap="round"></path>' +
    '<line x1="26" y1="31" x2="26" y2="42" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"></line>' +
    '<line x1="26" y1="34" x2="16" y2="40" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"></line>' +
    '<line x1="26" y1="34" x2="36" y2="40" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"></line>' +
    '<line x1="26" y1="42" x2="19" y2="51" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"></line>' +
    '<line x1="26" y1="42" x2="33" y2="51" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round"></line>' +
    '</svg>';

  friendBtn.addEventListener('click', () => {
    if (count >= 10) return;
    const p = palette[count % 3];
    const friend = document.createElement('div');
    friend.className = 'friend';
    friend.innerHTML =
      '<div class="avatar" style="background:' + p.bg + '; border-color:' + p.color + '; animation-delay:' + count * 0.3 + 's;">' +
      stickFigure(p.color) +
      '</div><div class="name">' + names[count % names.length] + '</div>';
    row.appendChild(friend);
    count++;

    msg.hidden = false;
    msg.textContent =
      count >= 10 ? 'Wow, so viele Freunde! Dein Herz ist voll! ♥'
        : count === 1 ? '1 Freund!'
        : count + ' Freunde!';
  });
}
