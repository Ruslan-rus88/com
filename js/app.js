/* COM — shared page logic */

// ---------- read-aloud helper ----------
const speakDE = (text) => {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE';
  u.rate = 0.85;
  speechSynthesis.speak(u);
};

// ---------- search (start page) ----------
const search = document.querySelector('.search');
if (search) {
  const searchInput = search.querySelector('input');
  const micBtn = search.querySelector('.mic-btn');

  const searchIndex = [
    { title: 'Die Qualle', emoji: '🪼', where: 'Gefährlich!', href: 'gefaehrlich.html#qualle', keywords: ['qualle', 'quallen', 'glibber', 'meer', 'strand', 'giftig'] },
    { title: 'Der Kaktus', emoji: '🌵', where: 'Gefährlich!', href: 'gefaehrlich.html#kaktus', keywords: ['kaktus', 'kakteen', 'stachel', 'stacheln', 'pieksig', 'wüste', 'wueste'] },
    { title: 'Die Spinne', emoji: '🕷️', where: 'Gefährlich!', href: 'gefaehrlich.html#spinne', keywords: ['spinne', 'spinnen', 'netz', 'beißen', 'beissen', 'krabbeln'] },
    { title: 'Der Hai', emoji: '🦈', where: 'Gefährlich!', href: 'gefaehrlich.html#hai', keywords: ['hai', 'haie', 'shark', 'meer', 'zähne', 'zaehne'] },
    { title: 'Der Löwe', emoji: '🦁', where: 'Gefährlich!', href: 'gefaehrlich.html#loewe', keywords: ['löwe', 'loewe', 'lowe', 'könig', 'koenig', 'mähne', 'maehne', 'zoo'] },
    { title: 'Der Tiger', emoji: '🐯', where: 'Gefährlich!', href: 'gefaehrlich.html#tiger', keywords: ['tiger', 'streifen', 'zoo', 'wild'] },
    { title: 'Der Oktopus', emoji: '🐙', where: 'Gefährlich!', href: 'gefaehrlich.html#oktopus', keywords: ['oktopus', 'krake', 'tintenfisch', 'tentakel', 'meer'] },
    { title: 'Der Strom', emoji: '⚡', where: 'Gefährlich!', href: 'gefaehrlich.html#strom', keywords: ['strom', 'steckdose', 'blitz', 'elektrisch', 'kabel'] },
    { title: 'Das Feuer', emoji: '🔥', where: 'Gefährlich!', href: 'gefaehrlich.html#feuer', keywords: ['feuer', 'flamme', 'heiß', 'heiss', 'streichholz', 'streichhölzer', 'verbrennen'] },
    { title: 'Der Smog', emoji: '🌫️', where: 'Gefährlich!', href: 'gefaehrlich.html#smog', keywords: ['smog', 'luft', 'nebel', 'dreckig', 'schmutzig', 'atmen'] },
    { title: 'Gefährlich!!!', emoji: '⚠️', where: 'Seite', href: 'gefaehrlich.html', keywords: ['gefahr', 'gefährlich', 'gefaehrlich', 'giftig', 'aufpassen', 'vorsicht'] },
    { title: 'Denk nach! (Quiz)', emoji: '❓', where: 'Gefährlich!', href: 'gefaehrlich.html#quiz', keywords: ['quiz', 'frage', 'fragen', 'denken', 'raten'] },
    { title: 'Das ABC-Tier', emoji: '🔤', where: 'Seite', href: 'abc.html#buchstaben', keywords: ['abc', 'alphabet', 'buchstabe', 'buchstaben', 'lesen', 'lernen'] },
    { title: 'Buchstaben-Spiel', emoji: '🕹️', where: 'ABC-Tier', href: 'abc.html#spiel', keywords: ['spiel', 'spielen', 'raten', 'tier', 'tiere', 'hund', 'katze', 'maus', 'affe', 'fisch', 'vogel', 'frosch', 'bär', 'baer', 'elefant', 'ente', 'schwein', 'pferd', 'kuh', 'hase', 'pinguin'] },
    { title: 'Freunde', emoji: '👫', where: 'Seite', href: 'freunde.html', keywords: ['freund', 'freunde', 'freundin', 'zusammen', 'spielen'] },
    { title: '1 2 3 — Zahlen', emoji: '🔢', where: 'Seite', href: '123.html', keywords: ['123', '1 2 3', '12', 'zahl', 'zahlen', 'mathe', 'nummer', 'nummern', 'eins zwei drei'] },
    { title: 'Zahlen schreiben', emoji: '✏️', where: '1 2 3', href: '123.html#schreiben', keywords: ['zahl', 'zahlen', 'schreiben', 'malen', 'eins', 'zwei', 'drei', 'mathe'] },
    { title: 'Plus und Minus', emoji: '🎈', where: '1 2 3', href: '123.html#rechnen', keywords: ['rechnen', 'plus', 'minus', 'mathe', 'ballon', 'ballons', 'zählen', 'zaehlen'] },
  ];

  const dropdown = document.createElement('div');
  dropdown.className = 'search-suggest';
  dropdown.hidden = true;
  search.appendChild(dropdown);

  const norm = (s) =>
    s.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').trim();

  const findMatches = (raw) => {
    const q = norm(raw);
    if (!q) return [];
    return searchIndex
      .map((entry) => {
        const words = [entry.title, ...entry.keywords].map(norm);
        let score = 0;
        if (raw.includes(entry.emoji)) score = 3;
        else if (words.some((w) => w.startsWith(q))) score = 2;
        else if (q.length > 2 && words.some((w) => w.includes(q) || q.includes(w))) score = 1;
        return { entry, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((m) => m.entry);
  };

  let matches = [];

  const renderSuggestions = () => {
    dropdown.innerHTML = '';
    if (!searchInput.value.trim()) {
      dropdown.hidden = true;
      return;
    }
    if (!matches.length) {
      dropdown.innerHTML = '<div class="none">Hmm, das kenne ich noch nicht! 🤔</div>';
      dropdown.hidden = false;
      return;
    }
    matches.forEach((entry) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.innerHTML =
        '<span class="emoji">' + entry.emoji + '</span><span>' + entry.title + '</span>' +
        '<span class="where">' + entry.where + '</span>';
      item.addEventListener('mousedown', () => { location.href = entry.href; });
      dropdown.appendChild(item);
    });
    dropdown.hidden = false;
  };

  const runSearch = () => {
    matches = findMatches(searchInput.value);
    renderSuggestions();
  };

  searchInput.addEventListener('input', runSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && matches.length) location.href = matches[0].href;
    if (e.key === 'Escape') dropdown.hidden = true;
  });
  searchInput.addEventListener('focus', () => { if (searchInput.value.trim()) runSearch(); });
  searchInput.addEventListener('blur', () => setTimeout(() => { dropdown.hidden = true; }, 150));

  // voice search
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (micBtn && SR) {
    micBtn.hidden = false;
    let listening = false;
    micBtn.addEventListener('click', () => {
      if (listening) return;
      const rec = new SR();
      rec.lang = 'de-DE';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      listening = true;
      micBtn.classList.add('listening');
      rec.onresult = (e) => {
        searchInput.value = e.results[0][0].transcript;
        runSearch();
        if (matches.length) speakDE('Ich habe ' + matches[0].title + ' gefunden!');
        else speakDE('Hmm, das kenne ich noch nicht!');
      };
      rec.onend = () => {
        listening = false;
        micBtn.classList.remove('listening');
      };
      rec.start();
    });
  }
}

// ---------- arrived via search: scroll to the card and let it wiggle ----------
if (location.hash.length > 1) {
  const found = document.getElementById(location.hash.slice(1));
  if (found) {
    setTimeout(() => {
      found.scrollIntoView({ behavior: 'smooth', block: 'center' });
      found.classList.add('found-flash');
      setTimeout(() => found.classList.remove('found-flash'), 3200);
    }, 250);
  }
}

// ---------- sketch lightbox (start page) ----------
const sketchStrip = document.querySelector('.sketch-strip');
if (sketchStrip) {
  const likes = JSON.parse(localStorage.getItem('comSketchLikes') || '{}');

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.hidden = true;
  overlay.innerHTML =
    '<button class="lightbox-close" aria-label="Schließen">✕</button>' +
    '<img alt="">' +
    '<button class="lightbox-like" aria-label="Gefällt mir"><span class="heart">♥</span><span class="like-label">Gefällt mir!</span></button>';
  document.body.appendChild(overlay);

  const overlayImg = overlay.querySelector('img');
  const likeBtn = overlay.querySelector('.lightbox-like');
  const likeLabel = overlay.querySelector('.like-label');
  let currentSrc = null;

  const updateLikeBtn = () => {
    const liked = !!likes[currentSrc];
    likeBtn.classList.toggle('liked', liked);
    likeLabel.textContent = liked ? 'Gefällt dir! ★' : 'Gefällt mir!';
  };

  const open = (img) => {
    currentSrc = img.getAttribute('src');
    overlayImg.src = currentSrc;
    overlayImg.alt = img.alt;
    updateLikeBtn();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
  };

  sketchStrip.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', () => open(img));
  });

  overlay.querySelector('.lightbox-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });

  likeBtn.addEventListener('click', () => {
    likes[currentSrc] = !likes[currentSrc];
    localStorage.setItem('comSketchLikes', JSON.stringify(likes));
    updateLikeBtn();
    if (likes[currentSrc]) {
      likeBtn.classList.remove('pop');
      void likeBtn.offsetWidth;
      likeBtn.classList.add('pop');
    }
  });
}

// ---------- danger cards read-aloud ----------
document.querySelectorAll('.danger-card').forEach((card) => {
  const btn = document.createElement('button');
  btn.className = 'say-btn card-say';
  btn.textContent = '🔊';
  btn.setAttribute('aria-label', 'Text vorlesen');
  btn.setAttribute('title', 'Vorlesen');
  btn.addEventListener('click', () => {
    speakDE(card.querySelector('.name').textContent + '. ' + card.querySelector('p').textContent);
  });
  card.appendChild(btn);
});

// ---------- quiz (danger page) ----------
const quiz = document.querySelector('.quiz');
if (quiz) {
  const questions = [
    { q: 'Du siehst eine Qualle am Strand. Was machst du?', options: ['Anfassen!', 'Nur angucken', 'Mit nach Hause nehmen'], right: 1 },
    { q: 'Der Kaktus hat Stacheln. Was machst du?', options: ['Fest drücken', 'Mich drauf setzen', 'Nur gucken'], right: 2 },
    { q: 'Eine Spinne sitzt in der Ecke. Was machst du?', options: ['In Ruhe lassen', 'Sie ärgern', 'Anfassen'], right: 0 },
    { q: 'Du bist im Meer und siehst einen Hai. Was machst du?', options: ['Hinschwimmen', 'Ruhig rausgehen und Bescheid sagen', 'Ihn füttern'], right: 1 },
    { q: 'Wo darfst du einen Löwen angucken?', options: ['Im Zoo', 'Im Garten', 'Im Kinderzimmer'], right: 0 },
    { q: 'Was ist ein Tiger?', options: ['Ein Kuscheltier', 'Ein wildes Tier', 'Ein Haustier'], right: 1 },
    { q: 'Du findest einen Oktopus im Wasser. Was machst du?', options: ['Anfassen', 'Hochheben', 'Nur beobachten'], right: 2 },
    { q: 'Was machst du mit der Steckdose?', options: ['Finger reinstecken', 'Finger weg!', 'Mit Wasser putzen'], right: 1 },
    { q: 'Du findest Streichhölzer. Was machst du?', options: ['Damit spielen', 'Eins anzünden', 'Einem Erwachsenen geben'], right: 2 },
    { q: 'Draußen ist dicker Smog. Was ist schlau?', options: ['Tief einatmen', 'Drinnen spielen', 'Schneller rennen'], right: 1 },
  ];
  const progress = quiz.querySelector('.quiz-progress');
  const question = quiz.querySelector('.question');
  const questionSay = quiz.querySelector('.quiz-say');
  const optionsEl = quiz.querySelector('.quiz-options');
  const feedback = quiz.querySelector('.quiz-feedback');
  const nextBtn = quiz.querySelector('.quiz-next');
  const colors = ['orange', 'green', 'blue'];
  let qi = 0;
  let answered = false;

  questionSay.addEventListener('click', () => speakDE(questions[qi].q));

  const showQuestion = () => {
    const item = questions[qi];
    answered = false;
    progress.textContent = 'Frage ' + (qi + 1) + ' von ' + questions.length;
    question.textContent = item.q;
    feedback.hidden = true;
    nextBtn.hidden = true;
    optionsEl.innerHTML = '';
    item.options.forEach((text, i) => {
      const col = document.createElement('div');
      col.className = 'quiz-option';
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.className = colors[i % 3];
      btn.addEventListener('click', () => {
        if (answered) return;
        const right = i === item.right;
        btn.classList.add(right ? 'picked-right' : 'picked-wrong');
        feedback.textContent = right ? 'Richtig! Super aufgepasst! ★' : 'Hmm, lieber nicht — probier nochmal!';
        feedback.className = 'quiz-feedback ' + (right ? 'right' : 'wrong');
        feedback.hidden = false;
        if (right) {
          answered = true;
          nextBtn.textContent = qi === questions.length - 1 ? 'Nochmal von vorne ↺' : 'Weiter →';
          nextBtn.hidden = false;
        }
      });
      const say = document.createElement('button');
      say.className = 'say-btn say-mini';
      say.textContent = '🔊';
      say.setAttribute('aria-label', 'Antwort vorlesen');
      say.setAttribute('title', 'Vorlesen');
      say.addEventListener('click', () => speakDE(text));
      col.appendChild(btn);
      col.appendChild(say);
      optionsEl.appendChild(col);
    });
  };

  nextBtn.addEventListener('click', () => {
    qi = (qi + 1) % questions.length;
    showQuestion();
  });
  showQuestion();
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
      speakDE(ch);
    });
    abcGrid.appendChild(btn);
  });
}

// ---------- letter game (abc page) ----------
const letterGame = document.querySelector('.letter-game');
if (letterGame) {
  const animals = [
    { name: 'Hund', emoji: '🐶' },
    { name: 'Katze', emoji: '🐱' },
    { name: 'Maus', emoji: '🐭' },
    { name: 'Löwe', emoji: '🦁' },
    { name: 'Affe', emoji: '🐵' },
    { name: 'Fisch', emoji: '🐟' },
    { name: 'Vogel', emoji: '🐦' },
    { name: 'Frosch', emoji: '🐸' },
    { name: 'Bär', emoji: '🐻' },
    { name: 'Elefant', emoji: '🐘' },
    { name: 'Ente', emoji: '🦆' },
    { name: 'Schwein', emoji: '🐷' },
    { name: 'Pferd', emoji: '🐴' },
    { name: 'Kuh', emoji: '🐮' },
    { name: 'Hase', emoji: '🐰' },
    { name: 'Pinguin', emoji: '🐧' },
  ];
  const artEl = letterGame.querySelector('.letter-animal');
  const wordEl = letterGame.querySelector('.letter-word');
  const optionsEl = letterGame.querySelector('.letter-options');
  const feedbackEl = letterGame.querySelector('.letter-feedback');
  const nextBtn = letterGame.querySelector('.next-animal');
  const sayBtn = letterGame.querySelector('.say-btn');
  const optionColors = ['orange', 'blue', 'green'];
  let current = null;
  let gapIndex = 0;
  let solved = false;
  let lastAnimal = -1;

  sayBtn.addEventListener('click', () => speakDE(current.name));

  const renderWord = () => {
    wordEl.innerHTML = '';
    current.name.toUpperCase().split('').forEach((ch, i) => {
      const tile = document.createElement('span');
      tile.className = 'letter-tile' + (i === gapIndex && !solved ? ' gap' : '');
      tile.textContent = i === gapIndex && !solved ? '' : ch;
      if (i === gapIndex && solved) tile.classList.add('found');
      wordEl.appendChild(tile);
    });
  };

  const newRound = () => {
    let idx;
    do { idx = Math.floor(Math.random() * animals.length); } while (idx === lastAnimal);
    lastAnimal = idx;
    current = animals[idx];
    gapIndex = Math.floor(Math.random() * current.name.length);
    solved = false;

    artEl.textContent = current.emoji;
    feedbackEl.hidden = true;
    nextBtn.hidden = true;
    renderWord();

    const correct = current.name[gapIndex].toUpperCase();
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWZÄÖÜ'.split('').filter((ch) => ch !== correct);
    const options = [correct];
    while (options.length < 3) {
      const ch = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      options.push(ch);
    }
    options.sort(() => Math.random() - 0.5);

    optionsEl.innerHTML = '';
    options.forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.textContent = ch;
      btn.className = optionColors[i % 3];
      btn.style.transform = 'rotate(' + ((i % 2 === 0 ? -1 : 1) * 2) + 'deg)';
      btn.addEventListener('click', () => {
        if (solved) return;
        if (ch === correct) {
          solved = true;
          btn.classList.add('picked-right');
          renderWord();
          feedbackEl.textContent = 'Super! ' + current.name.toUpperCase() + '! ★';
          feedbackEl.className = 'letter-feedback right';
          feedbackEl.hidden = false;
          nextBtn.hidden = false;
          speakDE(current.name);
        } else {
          btn.classList.add('picked-wrong');
          feedbackEl.textContent = 'Hmm, das passt nicht — probier nochmal!';
          feedbackEl.className = 'letter-feedback wrong';
          feedbackEl.hidden = false;
        }
      });
      optionsEl.appendChild(btn);
    });
  };

  nextBtn.addEventListener('click', newRound);
  newRound();
}

// ---------- math page (1 2 3) ----------
const traceCard = document.querySelector('.trace-card');
if (traceCard) {
  const numberWords = ['Null', 'Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun', 'Zehn'];

  // renders a number as a fat stencil glyph; used as trace hint and for the pixel check
  const stencilFor = (w, h, text, color) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    x.font = 'bold ' + Math.round(h * 0.72) + 'px "Patrick Hand", "Comic Sans MS", sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = color;
    x.fillText(text, w / 2, h / 2 + h * 0.03);
    return c;
  };

  // finger/stylus/mouse drawing surface; strokes stay on a separate ink layer
  const makePad = (canvas, inkColor) => {
    const ctx = canvas.getContext('2d');
    const ink = document.createElement('canvas');
    ink.width = canvas.width;
    ink.height = canvas.height;
    const ictx = ink.getContext('2d');
    ictx.lineWidth = canvas.width * 0.06;
    ictx.lineCap = 'round';
    ictx.lineJoin = 'round';
    ictx.strokeStyle = inkColor;
    ictx.fillStyle = inkColor;
    let hint = null;
    let drawing = false;
    let last = null;

    const redraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (hint) ctx.drawImage(hint, 0, 0);
      ctx.drawImage(ink, 0, 0);
    };
    const pos = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * canvas.width) / r.width, y: ((e.clientY - r.top) * canvas.height) / r.height };
    };
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing = true;
      last = pos(e);
      ictx.beginPath();
      ictx.arc(last.x, last.y, ictx.lineWidth / 2, 0, 7);
      ictx.fill();
      redraw();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = pos(e);
      ictx.beginPath();
      ictx.moveTo(last.x, last.y);
      ictx.lineTo(p.x, p.y);
      ictx.stroke();
      last = p;
      redraw();
    });
    canvas.addEventListener('pointerup', () => { drawing = false; });
    canvas.addEventListener('pointercancel', () => { drawing = false; });

    return {
      ink,
      clear() {
        ictx.clearRect(0, 0, ink.width, ink.height);
        redraw();
      },
      setHint(c) {
        hint = c;
        redraw();
      },
    };
  };

  // stencil-overlap check: normalize the drawing onto the stencil's bounding
  // box (so position and size don't matter), then compare pixels both ways
  const digitCheck = (inkCanvas, text) => {
    const w = inkCanvas.width;
    const h = inkCanvas.height;
    const stencil = stencilFor(w, h, text, '#000');
    const alphaBox = (data) => {
      let minX = w, minY = h, maxX = -1, maxY = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (data[(y * w + x) * 4 + 3] > 40) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    };
    const sData = stencil.getContext('2d').getImageData(0, 0, w, h).data;
    const iData = inkCanvas.getContext('2d').getImageData(0, 0, w, h).data;
    const ib = alphaBox(iData);
    const sb = alphaBox(sData);
    if (!ib || !sb) return false;

    const fitted = document.createElement('canvas');
    fitted.width = w;
    fitted.height = h;
    const fctx = fitted.getContext('2d');
    fctx.drawImage(inkCanvas, ib.x, ib.y, ib.w, ib.h, sb.x, sb.y, sb.w, sb.h);
    const fData = fctx.getImageData(0, 0, w, h).data;

    let inkPx = 0, inkInside = 0, stencilPx = 0, stencilHit = 0;
    for (let i = 3; i < fData.length; i += 4) {
      const hasInk = fData[i] > 40;
      const hasStencil = sData[i] > 40;
      if (hasInk) {
        inkPx++;
        if (hasStencil) inkInside++;
      }
      if (hasStencil) {
        stencilPx++;
        if (hasInk) stencilHit++;
      }
    }
    if (!inkPx) return false;
    return inkInside / inkPx >= 0.5 && stencilHit / stencilPx >= 0.3;
  };

  // --- number tracing ---
  const traceCanvas = traceCard.querySelector('.trace-canvas');
  const tracePad = makePad(traceCanvas, '#5B9BD5');
  const traceTarget = traceCard.querySelector('.trace-target');
  const traceFeedback = traceCard.querySelector('.trace-feedback');
  const traceNext = traceCard.querySelector('.trace-next');
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  let di = 0;

  const setDigit = () => {
    const d = digits[di % digits.length];
    traceTarget.textContent = d;
    tracePad.clear();
    tracePad.setHint(stencilFor(traceCanvas.width, traceCanvas.height, d, '#E9E0CE'));
    traceFeedback.hidden = true;
    traceNext.hidden = true;
  };

  traceCard.querySelector('.trace-say').addEventListener('click', () => {
    speakDE(numberWords[Number(digits[di % digits.length])]);
  });
  traceCard.querySelector('.trace-clear').addEventListener('click', () => {
    tracePad.clear();
    traceFeedback.hidden = true;
  });
  traceCard.querySelector('.trace-check').addEventListener('click', () => {
    const d = digits[di % digits.length];
    const right = digitCheck(tracePad.ink, d);
    traceFeedback.textContent = right ? 'Super geschrieben! Die ' + numberWords[Number(d)] + '! ★' : 'Fast! Fahr die graue Zahl nochmal nach.';
    traceFeedback.className = 'math-feedback ' + (right ? 'right' : 'wrong');
    traceFeedback.hidden = false;
    if (right) {
      traceNext.hidden = false;
      speakDE(numberWords[Number(d)]);
    }
  });
  traceNext.addEventListener('click', () => {
    di++;
    setDigit();
    speakDE('Schreib die ' + numberWords[Number(digits[di % digits.length])] + '!');
  });
  setDigit();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      tracePad.setHint(stencilFor(traceCanvas.width, traceCanvas.height, digits[di % digits.length], '#E9E0CE'));
    });
  }

  // --- plus/minus game ---
  const game = document.querySelector('.math-game');
  const taskEmoji = game.querySelector('.task-emoji');
  const taskText = game.querySelector('.task-text');
  const answerTap = game.querySelector('.answer-tap');
  const answerDraw = game.querySelector('.answer-draw');
  const answerBalloon = game.querySelector('.answer-balloon');
  const gameFeedback = game.querySelector('.game-feedback');
  const gameNext = game.querySelector('.game-next');
  const starsEl = game.querySelector('.math-stars');
  const drawCanvas = game.querySelector('.draw-canvas');
  const drawPad = makePad(drawCanvas, '#8CBF3F');
  const taskEmojis = ['🍎', '🍓', '⭐', '🐠', '🎈', '🍪'];
  const answerColors = ['orange', 'blue', 'green'];
  let mode = 'tap';
  let opChoice = 'both';
  let task = null;
  let stars = 0;
  let taskSolved = false;

  const makeTask = () => {
    const plus = opChoice === '+' ? true : opChoice === '-' ? false : Math.random() < 0.5;
    let a, b;
    if (plus) {
      a = 1 + Math.floor(Math.random() * 5);
      b = 1 + Math.floor(Math.random() * 5);
    } else {
      a = 2 + Math.floor(Math.random() * 9);
      b = 1 + Math.floor(Math.random() * (a - 1));
    }
    return { a, b, op: plus ? '+' : '−', result: plus ? a + b : a - b, emoji: taskEmojis[Math.floor(Math.random() * taskEmojis.length)] };
  };

  const speakTask = () => speakDE(task.a + (task.op === '+' ? ' plus ' : ' minus ') + task.b);

  const win = () => {
    taskSolved = true;
    stars++;
    starsEl.textContent = '★'.repeat(Math.min(stars, 15)) + (stars > 15 ? ' +' + (stars - 15) : '');
    gameFeedback.textContent = 'Richtig! ' + task.a + ' ' + task.op + ' ' + task.b + ' = ' + task.result + ' ★';
    gameFeedback.className = 'math-feedback right';
    gameFeedback.hidden = false;
    gameNext.hidden = false;
    speakDE(task.a + (task.op === '+' ? ' plus ' : ' minus ') + task.b + ' ist ' + numberWords[task.result]);
  };
  const miss = () => {
    gameFeedback.textContent = 'Hmm, zähl nochmal nach!';
    gameFeedback.className = 'math-feedback wrong';
    gameFeedback.hidden = false;
  };

  const answerOptions = () => {
    const opts = [task.result];
    while (opts.length < 3) {
      const n = Math.max(0, Math.min(10, task.result + (Math.floor(Math.random() * 5) - 2)));
      if (!opts.includes(n)) opts.push(n);
    }
    return opts.sort(() => Math.random() - 0.5);
  };

  const renderAnswers = () => {
    answerTap.hidden = mode !== 'tap';
    answerDraw.hidden = mode !== 'draw';
    answerBalloon.hidden = mode !== 'balloon';

    if (mode === 'tap') {
      answerTap.innerHTML = '';
      answerOptions().forEach((n, i) => {
        const btn = document.createElement('button');
        btn.textContent = n;
        btn.className = answerColors[i % 3];
        btn.addEventListener('click', () => {
          if (taskSolved) return;
          if (n === task.result) {
            btn.classList.add('picked-right');
            win();
          } else {
            btn.classList.add('picked-wrong');
            miss();
          }
        });
        answerTap.appendChild(btn);
      });
    } else if (mode === 'draw') {
      drawPad.clear();
    } else {
      answerBalloon.innerHTML = '';
      answerOptions().forEach((n, i) => {
        const b = document.createElement('button');
        b.className = 'balloon b' + (i + 1);
        b.textContent = n;
        b.addEventListener('click', () => {
          if (taskSolved) return;
          if (n === task.result) {
            b.classList.add('popped');
            win();
          } else {
            b.classList.remove('nope');
            void b.offsetWidth;
            b.classList.add('nope');
            miss();
          }
        });
        answerBalloon.appendChild(b);
      });
    }
  };

  const renderTask = () => {
    taskSolved = false;
    task = makeTask();
    const item = (gone) => '<span' + (gone ? ' class="gone"' : '') + '>' + task.emoji + '</span>';
    if (task.op === '+') {
      taskEmoji.innerHTML = item(false).repeat(task.a) + '<span class="op">+</span>' + item(false).repeat(task.b);
    } else {
      taskEmoji.innerHTML = item(false).repeat(task.a - task.b) + item(true).repeat(task.b);
    }
    taskText.textContent = task.a + ' ' + task.op + ' ' + task.b + ' = ?';
    gameFeedback.hidden = true;
    gameNext.hidden = true;
    renderAnswers();
  };

  game.querySelector('.task-say').addEventListener('click', speakTask);
  game.querySelector('.draw-clear').addEventListener('click', () => {
    drawPad.clear();
    gameFeedback.hidden = true;
  });
  game.querySelector('.draw-check').addEventListener('click', () => {
    if (taskSolved) return;
    if (digitCheck(drawPad.ink, String(task.result))) win();
    else miss();
  });
  game.querySelectorAll('.op-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      game.querySelectorAll('.op-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      opChoice = btn.dataset.op;
      renderTask();
    });
  });
  game.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      game.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      if (!taskSolved) gameFeedback.hidden = true;
      renderAnswers();
    });
  });
  gameNext.addEventListener('click', renderTask);
  renderTask();
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
