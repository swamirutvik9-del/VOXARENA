/* ══════════════════════════════════════════
   VoxArena — Main Script
   ══════════════════════════════════════════ */

// ── 0. Backend URL ────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:3001';
let   currentAudio = null; // track the playing Murf audio

// ── 1. Navbar scroll effect ──────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ── 2. Hamburger menu ────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  })
);

// ── 3. Hero wave canvas ──────────────────────────────────────────────
(function initWave() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waves = [
      { amp: 40, freq: 0.012, speed: 0.018, color: 'rgba(168,85,247,', offset: 0 },
      { amp: 30, freq: 0.016, speed: 0.024, color: 'rgba(6,182,212,',  offset: Math.PI },
      { amp: 55, freq: 0.008, speed: 0.012, color: 'rgba(168,85,247,', offset: Math.PI/2 },
    ];
    waves.forEach((w, i) => {
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = canvas.height / 2 +
          w.amp * Math.sin(x * w.freq + t * w.speed + w.offset);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = w.color + (0.4 - i * 0.08) + ')';
      ctx.lineWidth   = 1.5;
      ctx.stroke();
    });
    t += 1;
    requestAnimationFrame(drawWave);
  }
  drawWave();
})();

// ── 4. Scroll reveal ─────────────────────────────────────────────────
function addReveal(selector, delay = 0) {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    if (delay) el.style.transitionDelay = `${i * delay}s`;
  });
}
addReveal('.step-card', 0.1);
addReveal('.feature-card', 0.08);
addReveal('.section-header');

const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── 5. Custom topic selector ─────────────────────────────────────────
const topicSelect  = document.getElementById('topic-select');
const customTopic  = document.getElementById('custom-topic');
topicSelect.addEventListener('change', () => {
  customTopic.style.display = topicSelect.value === 'custom' ? 'block' : 'none';
});

// ── 6. AI counterarguments bank ─────────────────────────────────────
const aiResponses = {
  'ai-jobs': [
    "While AI will automate repetitive tasks, history shows technology creates more jobs than it destroys. The Industrial Revolution eliminated certain roles but generated entire new industries. AI will similarly spawn roles in AI oversight, ethics, and human-AI collaboration that we cannot yet envision.",
    "The premise assumes a static job market. In reality, AI will reshape work—not eliminate it. Tasks requiring emotional intelligence, creative judgment, and complex interpersonal skills are fundamentally resistant to automation. We should focus on reskilling rather than fear.",
    "Consider: AI is a tool, not an agent. Every productivity gain AI provides makes human workers more valuable in managerial and creative roles. Companies that deployed AI have consistently reported hiring more humans, not fewer, due to expanded business capabilities.",
  ],
  'social-media': [
    "Social media has democratized information access globally. Marginalized voices that were historically silenced now have platforms. Movements like #MeToo and Arab Spring demonstrated social media's power to drive positive societal change that traditional media could never achieve.",
    "The research on social media harm is highly context-dependent. For isolated individuals, online communities provide life-saving connection. The issue is not the platform but how we design and regulate it. Banning the tool ignores this nuance entirely.",
    "Every powerful technology carries dual-use risks. Print media enabled propaganda; television created couch culture. The solution has always been media literacy and regulation—not rejection. Social media is no different.",
  ],
  'remote-work': [
    "Office environments were designed for synchronous collaboration, but most knowledge work is fundamentally asynchronous. Remote work allows for deep, uninterrupted focus time that open-plan offices systematically destroy—and focus time is where real productive output happens.",
    "The productivity data on remote work is mixed precisely because implementation matters more than location. Companies with strong remote cultures—GitLab, Automattic—consistently outperform office-bound competitors. The problem is poor management, not remote work itself.",
    "Consider the eliminated commute alone: recovering 1-2 hours daily for employees directly increases their wellbeing and job satisfaction, which are the strongest predictors of long-term productivity. Physical co-location has real costs we systematically ignore.",
  ],
  'space': [
    "Space exploration has generated technologies that touch every aspect of modern life: GPS, satellite internet, water purification, cancer detection algorithms—all emerged from space research. The ROI on space investment has consistently exceeded expectations.",
    "Earth's long-term survival depends on becoming a multi-planetary species. We have evidence of five mass extinction events in Earth's history. Space exploration is not luxury—it is species-level insurance. Framing it as optional reveals a dangerous short-term bias.",
    "The economic case is compelling: asteroid mining could unlock resources worth quintillions of dollars. Nations that lead in space will control strategic high ground for communications, surveillance, and future commerce. Not investing is geopolitically irresponsible.",
  ],
  'ubi': [
    "UBI addresses the fundamental flaw in our economic system: as automation increases, we cannot maintain a model where human dignity depends solely on employment. UBI decouples basic security from labor markets, allowing people to take entrepreneurial risks and pursue education.",
    "Pilot studies in Finland, Kenya, and Stockton, California consistently show UBI improves health outcomes, reduces crime, and increases entrepreneurship—while employment rates remain stable or improve. The data refutes the disincentive argument empirically.",
    "Consider: we already have de facto UBI for the wealthy through capital gains, inheritance, and investment returns. UBI simply extends this floor to everyone. The question is not whether to provide income security, but who deserves it.",
  ],
};

const genericResponses = [
  "Your argument has merit, but it relies on a narrow framing of the issue. When we examine the broader systemic context, counterevidence emerges that complicates your position significantly. A more nuanced approach must account for the variables you've overlooked.",
  "While I acknowledge the surface appeal of that argument, it commits a fundamental logical fallacy. Correlation is being treated as causation here, and the evidence base underlying your position is selectively curated to support a predetermined conclusion.",
  "That's an interesting perspective, but it ignores the precedent set by comparable situations throughout history. When we apply these principles consistently, the logical conclusion undermines rather than supports your stated thesis.",
];

function getAIResponse(topic) {
  const bank = aiResponses[topic] || genericResponses;
  return bank[Math.floor(Math.random() * bank.length)];
}

// ── 7. Typing animation ──────────────────────────────────────────────
function typeText(element, text, speed = 18, callback) {
  element.innerHTML = '';
  let i = 0;
  const p = document.createElement('p');
  p.className = 'transcript-text';
  element.appendChild(p);

  function type() {
    if (i < text.length) {
      p.textContent += text[i++];
      element.parentElement.scrollTop = element.parentElement.scrollHeight;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }
  type();
}

// ── 8. Demo — Mic button & speech recognition ────────────────────────
const micBtn            = document.getElementById('mic-btn');
const micStatus         = document.getElementById('mic-status');
const micHint           = document.getElementById('mic-hint');
const userTranscript    = document.getElementById('user-transcript');
const aiTranscript      = document.getElementById('ai-transcript');
const userIndicator     = document.getElementById('user-speaking-indicator');
const aiIndicator       = document.getElementById('ai-speaking-indicator');
const topicSel          = document.getElementById('topic-select');
const customTopicInput  = document.getElementById('custom-topic');

let recognition  = null;
let isRecording  = false;
let isProcessing = false;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function setMicState(state) {
  micBtn.classList.remove('recording', 'ai-speaking');
  userIndicator.classList.remove('active');
  aiIndicator.style.display = 'none';
  aiIndicator.classList.remove('active');

  switch (state) {
    case 'idle':
      micStatus.textContent = 'Click to speak your argument';
      micStatus.style.color = 'var(--text-secondary)';
      break;
    case 'recording':
      micBtn.classList.add('recording');
      micStatus.textContent = '🔴 Recording... speak your argument';
      micStatus.style.color = '#fca5a5';
      userIndicator.classList.add('active');
      break;
    case 'thinking':
      micStatus.textContent = '⚡ AI is analyzing your argument...';
      micStatus.style.color = 'var(--purple-light)';
      break;
    case 'ai-speaking':
      micBtn.classList.add('ai-speaking');
      micStatus.textContent = '🔊 VoxArena is responding...';
      micStatus.style.color = 'var(--cyan-light)';
      aiIndicator.style.display = 'flex';
      aiIndicator.classList.add('active');
      break;
  }
}

// ── Murf AI voice playback ──────────────────────────────────────────
async function playMurfAudio(text) {
  try {
    micHint.textContent = 'Generating Murf AI voice...';
    const response = await fetch(`${BACKEND_URL}/speak`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text, voiceId: 'en-US-natalie' }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    const { audioUrl } = await response.json();
    if (!audioUrl) throw new Error('No audio URL returned from backend.');

    micHint.textContent = 'Playing Murf AI voice ✓';

    // Stop any previous audio
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }

    currentAudio = new Audio(audioUrl);
    currentAudio.play();
    currentAudio.onended  = () => { setMicState('idle'); isProcessing = false; micHint.textContent = 'Powered by Murf AI voice technology'; };
    currentAudio.onerror  = () => { fallbackTTS(text); };

  } catch (err) {
    console.warn('[VoxArena] Murf backend error, falling back to browser TTS:', err.message);
    micHint.textContent = `Murf unavailable – using browser voice (${err.message})`;
    fallbackTTS(text);
  }
}

// Browser TTS fallback
function fallbackTTS(text) {
  if ('speechSynthesis' in window) {
    const utterance  = new SpeechSynthesisUtterance(text);
    utterance.rate   = 0.95;
    utterance.pitch  = 1.05;
    utterance.volume = 0.9;
    const voices     = speechSynthesis.getVoices();
    const pref       = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US');
    if (pref) utterance.voice = pref;
    utterance.onend  = () => { setMicState('idle'); isProcessing = false; };
    utterance.onerror = () => { setMicState('idle'); isProcessing = false; };
    speechSynthesis.speak(utterance);
  } else {
    setTimeout(() => { setMicState('idle'); isProcessing = false; }, 2500);
  }
}

function simulateAIResponse(userText) {
  setMicState('thinking');
  document.querySelector('.ai-panel').classList.remove('active');
  aiTranscript.innerHTML = '<p class="transcript-placeholder">AI is thinking...</p>';

  setTimeout(() => {
    const topic        = topicSel.value;
    const responseText = getAIResponse(topic);
    setMicState('ai-speaking');

    // Type the response text into the panel
    aiTranscript.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'transcript-text ai-text';
    aiTranscript.appendChild(p);
    document.querySelector('.ai-panel').classList.add('active');

    let i = 0;
    function type() {
      if (i < responseText.length) {
        p.textContent += responseText[i++];
        setTimeout(type, 14);
      } else {
        // ── Call Murf AI backend for voice ──
        playMurfAudio(responseText);
      }
    }
    type();
  }, 1200);
}

function startRecording() {
  if (!SpeechRecognition) {
    // Fallback: simulate with a sample argument
    const samples = [
      "Artificial intelligence will inevitably replace most human jobs because machines can perform tasks faster, cheaper, and more accurately than any human worker.",
      "Social media platforms have fundamentally damaged democracy by creating echo chambers and spreading misinformation at unprecedented scale.",
      "Remote work should become the default for all knowledge workers because it eliminates wasteful commutes and increases individual autonomy.",
    ];
    const topic  = topicSel.value;
    const sample = samples[Math.floor(Math.random() * samples.length)];

    setMicState('recording');
    userTranscript.innerHTML = '';
    document.querySelector('.user-panel').classList.add('active');
    isRecording  = true;
    isProcessing = true;

    setTimeout(() => {
      isRecording = false;
      typeText(userTranscript, sample, 20, () => {
        simulateAIResponse(sample);
      });
    }, 2000);

    micHint.textContent = 'Demo mode: simulating speech input';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang          = 'en-US';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setMicState('recording');
    isRecording = true;
    userTranscript.innerHTML = '<p class="transcript-placeholder">Listening...</p>';
    document.querySelector('.user-panel').classList.add('active');
  };

  recognition.onresult = (event) => {
    let interim = '';
    let final   = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }
    userTranscript.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'transcript-text';
    p.textContent = final || interim;
    userTranscript.appendChild(p);
  };

  recognition.onend = () => {
    isRecording = false;
    const textEl = userTranscript.querySelector('.transcript-text');
    const userText = textEl ? textEl.textContent.trim() : '';
    if (userText) {
      simulateAIResponse(userText);
    } else {
      setMicState('idle');
      isProcessing = false;
    }
  };

  recognition.onerror = (e) => {
    isRecording  = false;
    isProcessing = false;
    setMicState('idle');
    if (e.error === 'not-allowed') {
      micStatus.textContent = 'Microphone access denied. Please allow access.';
      micStatus.style.color = '#fca5a5';
    }
  };

  isProcessing = true;
  recognition.start();
}

micBtn.addEventListener('click', () => {
  if (isProcessing) {
    // Stop whatever is running
    if (isRecording && recognition) {
      recognition.stop();
    }
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setMicState('idle');
    isProcessing = false;
    return;
  }
  startRecording();
});

// Preload browser voice list (used as fallback)
if ('speechSynthesis' in window) speechSynthesis.getVoices();

// Ping backend on load to check availability
fetch(`${BACKEND_URL}/health`)
  .then(r => r.json())
  .then(() => { micHint.textContent = 'Murf AI backend connected ✓'; })
  .catch(() => { micHint.textContent = 'Backend offline – browser TTS fallback active'; });

// ── 9. Smooth anchor scrolling for nav CTA ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

// ── 10. Enter key for custom topic ──────────────────────────────────
customTopicInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') micBtn.click();
});
