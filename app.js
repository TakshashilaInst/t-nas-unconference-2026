/* ============================================================
   TAKSHASHILA UNCONFERENCE – APP LOGIC
   Rules:
     • Section A (ids 1–9 + user-added): exactly 1 vote required
       → If user submits their own topic, that counts as their vote
     • Section B (ids 10–29): exactly 2 votes required
   User-added topics: stored in localStorage, get ids 1000+
   ============================================================ */

'use strict';

/* ── SESSION DATA ─────────────────────────────────────── */
const SESSIONS_GENERAL = [
  { id: 1, title: "What should India learn from China's economy and military?" },
  { id: 2, title: "How does AI impact jobs in the near future?" },
  { id: 3, title: "Should commercial drones be used for policing?" },
  { id: 4, title: "Can Islamabad and New Delhi be friends through diplomatic conversation?" },
  { id: 5, title: "Should India Advocate for Globalisation or Protectionism?" },
  { id: 6, title: "How is Talent Geopolitics Likely to play out in 10 years?" },
  { id: 7, title: "Can Middle Powers cooperate to mitigate shockwaves of great power politics?" },
  { id: 8, title: "Should Indian Police Officers be both investigators and enforcers of law & order?" },
  { id: 9, title: "Should Nuclear Proliferation be Free & Open?" },
];

/* Speaker bios — 10-15 words each */
const SPEAKER_BIOS = {
  "Dr. Manpreet Sethi":      "Distinguished Fellow at Centre for Air Power Studies specialising in nuclear security.",
  "Dr. Atul Mishra":         "Associate Professor at Shiv Nadar University specialising in Indian foreign policy.",
  "Dr. Jabin Jacob":         "Associate Professor at Shiv Nadar University, expert on China-India relations.",
  "Prof. Pradeep Taneja":    "Senior Lecturer at University of Melbourne specialising in China and India.",
  "Lt. Gen. S.L. Narasimhan":"Retired Indian Army Lieutenant General and China expert at Gateway House.",
  "Dr. Sanjaya Baru":        "Distinguished Fellow at IDSA, former Media Adviser to Prime Minister Singh.",
  "Dr. Happymon Jacob":      "Associate Professor of Diplomacy and Disarmament Studies at Jawaharlal Nehru University.",
  "Dr. Aparna Pande":        "Director, Initiative on the Future of India and South Asia, Hudson Institute.",
  "Dr. Shanthie D'Souza":    "Founder and President of Mantraya Institute, expert on South Asia and Afghanistan.",
  "Prof. Sumit Ganguly":     "Tagore Professor Emeritus at Indiana University and Senior Fellow, Hoover Institution.",
  "Amb. Vivek Katju":        "Retired IFS officer, former Ambassador to Afghanistan, Myanmar, and Thailand.",
  "Dr. Anirudh Suri":        "Non-resident scholar at Carnegie India, author, and technology-geopolitics venture capitalist.",
  "Prof. Douglas Fuller":    "Associate Professor at City University of Hong Kong, expert on China's technology.",
  "Mr. Karthik Nachiappan":  "Research Fellow at the Institute of South Asian Studies, National University of Singapore.",
  "Mr. Santosh Pai":         "Partner at Dentons Link Legal, India's leading expert on India-China business law.",
  "Ms. Katja Drinhausen":    "Head of Politics and Society at MERICS, expert on China's governance and law.",
  "Dr. Anton Harder":        "Historian at the London School of Economics specialising in Sino-Indian Cold War relations.",
  "Dr. Devendra Kumar":      "Associate Fellow at Centre of Excellence for Himalayan Studies, Shiv Nadar University.",
  "Dr. Amrita Jash":         "Assistant Professor at Manipal Academy, expert on China's military and foreign policy.",
  "Nitin Pai":               "Co-founder and Director of Takshashila Institution, focused on Indo-Pacific and public policy.",
};

const SESSIONS_AMA = [
  { id: 10, title: "AMA with Dr. Manpreet Sethi",      speaker: "Dr. Manpreet Sethi" },
  { id: 11, title: "AMA with Dr. Atul Mishra",         speaker: "Dr. Atul Mishra" },
  { id: 12, title: "AMA with Dr. Jabin Jacob",         speaker: "Dr. Jabin Jacob" },
  { id: 13, title: "AMA with Prof. Pradeep Taneja",    speaker: "Prof. Pradeep Taneja" },
  { id: 14, title: "AMA with Lt. Gen. S.L. Narasimhan",speaker: "Lt. Gen. S.L. Narasimhan" },
  { id: 15, title: "AMA with Dr. Sanjaya Baru",        speaker: "Dr. Sanjaya Baru" },
  { id: 16, title: "AMA with Dr. Happymon Jacob",      speaker: "Dr. Happymon Jacob" },
  { id: 17, title: "AMA with Dr. Aparna Pande",        speaker: "Dr. Aparna Pande" },
  { id: 18, title: "AMA with Dr. Shanthie D'Souza",    speaker: "Dr. Shanthie D'Souza" },
  { id: 19, title: "AMA with Prof. Sumit Ganguly",     speaker: "Prof. Sumit Ganguly" },
  { id: 20, title: "AMA with Amb. Vivek Katju",        speaker: "Amb. Vivek Katju" },
  { id: 21, title: "AMA with Dr. Anirudh Suri",        speaker: "Dr. Anirudh Suri" },
  { id: 22, title: "AMA with Prof. Douglas Fuller",    speaker: "Prof. Douglas Fuller" },
  { id: 23, title: "AMA with Mr. Karthik Nachiappan",  speaker: "Mr. Karthik Nachiappan" },
  { id: 24, title: "AMA with Mr. Santosh Pai",         speaker: "Mr. Santosh Pai" },
  { id: 25, title: "AMA with Ms. Katja Drinhausen",    speaker: "Ms. Katja Drinhausen" },
  { id: 26, title: "AMA with Dr. Anton Harder",        speaker: "Dr. Anton Harder" },
  { id: 27, title: "AMA with Dr. Devendra Kumar",      speaker: "Dr. Devendra Kumar" },
  { id: 28, title: "AMA with Dr. Amrita Jash",         speaker: "Dr. Amrita Jash" },
  { id: 29, title: "AMA with Nitin Pai",               speaker: "Nitin Pai" },
];

/* ── STORAGE KEYS ─────────────────────────────────────── */
const VOTES_KEY        = 'ti_uncof_votes';
const VOTER_KEY        = 'ti_voter_sessions';
const USER_TOPICS_KEY  = 'ti_user_topics';    // user-submitted general topics
const NEXT_ID_KEY      = 'ti_next_custom_id'; // next id for custom topics (starts 1000)

/* ── COLOUR PALETTE ───────────────────────────────────── */
const PALETTES = [
  { accent: '#f19914', accentDk: '#c97e0a' },
  { accent: '#610d3e', accentDk: '#3d0827' },
  { accent: '#1a6e8a', accentDk: '#124d62' },
  { accent: '#6d4c9e', accentDk: '#4a3370' },
  { accent: '#c0392b', accentDk: '#922b21' },
  { accent: '#1e7e45', accentDk: '#145e31' },
  { accent: '#d35400', accentDk: '#a04000' },
  { accent: '#2471a3', accentDk: '#1a527a' },
];

/* ── STORAGE HELPERS ──────────────────────────────────── */
function loadVotes()         { try { return JSON.parse(localStorage.getItem(VOTES_KEY))       || {}; } catch { return {}; } }
function saveVotes(d)        { localStorage.setItem(VOTES_KEY,       JSON.stringify(d)); }
function loadVoterSessions() { try { return JSON.parse(localStorage.getItem(VOTER_KEY))       || {}; } catch { return {}; } }
function saveVoterSessions(d){ localStorage.setItem(VOTER_KEY,       JSON.stringify(d)); }
function loadUserTopics()    { try { return JSON.parse(localStorage.getItem(USER_TOPICS_KEY)) || []; } catch { return []; } }
function saveUserTopics(d)   { localStorage.setItem(USER_TOPICS_KEY, JSON.stringify(d)); }

function nextCustomId() {
  const current = parseInt(localStorage.getItem(NEXT_ID_KEY) || '1000', 10);
  localStorage.setItem(NEXT_ID_KEY, current + 1);
  return current;
}

function getVoteCount(sessionId)    { return (loadVotes()[sessionId] || []).length; }
function hasVoted(email, sessionId) { return (loadVoterSessions()[email.toLowerCase()] || []).includes(sessionId); }

function recordVote(sessionId, name, email) {
  const votes = loadVotes();
  if (!votes[sessionId]) votes[sessionId] = [];
  votes[sessionId].push({ name: name.trim(), email: email.trim().toLowerCase(), ts: new Date().toISOString() });
  saveVotes(votes);
  const vs  = loadVoterSessions();
  const key = email.trim().toLowerCase();
  if (!vs[key]) vs[key] = [];
  if (!vs[key].includes(sessionId)) vs[key].push(sessionId);
  saveVoterSessions(vs);
}

function checkDeviceVoted(sessionId) {
  return Object.values(loadVoterSessions()).some(arr => arr.includes(sessionId));
}

/* All general sessions = built-in + user-added */
function allGeneralSessions() {
  return [...SESSIONS_GENERAL, ...loadUserTopics()];
}

function sectionFor(sessionId) {
  return sessionId < 10 || sessionId >= 1000 ? 'general' : 'ama';
}

function deviceVoteCountForSection(sectionKey) {
  const sessions = sectionKey === 'general' ? allGeneralSessions() : SESSIONS_AMA;
  return sessions.filter(s => checkDeviceVoted(s.id)).length;
}

/* ── SECTION CONFIG ───────────────────────────────────── */
// quota for general is 1; user-added topic submission also counts as the 1 vote
const SECTION_CONFIG = {
  general: { quota: 1, gridId: 'sessions-grid-general', quotaTextId: 'quota-general-text', quotaWrapperId: 'quota-general' },
  ama:     { quota: 2, gridId: 'sessions-grid-ama',     quotaTextId: 'quota-ama-text',     quotaWrapperId: 'quota-ama'     },
};

/* ── STATE ────────────────────────────────────────────── */
let pendingSessionId = null;

/* ── DOM REFS ─────────────────────────────────────────── */
const overlay       = document.getElementById('modal-overlay');
const modalSession  = document.getElementById('modal-session-name');
const form          = document.getElementById('interest-form');
const nameInput     = document.getElementById('voter-name');
const emailInput    = document.getElementById('voter-email');
const nameError     = document.getElementById('name-error');
const emailError    = document.getElementById('email-error');
const closeBtn      = document.getElementById('modal-close-btn');
const cancelBtn     = document.getElementById('modal-cancel-btn');
const toast         = document.getElementById('toast');

/* Add-topic modal refs */
const addTopicBtn     = document.getElementById('add-topic-btn');
const addTopicOverlay = document.getElementById('add-topic-overlay');
const addTopicForm    = document.getElementById('add-topic-form');
const topicInput      = document.getElementById('new-topic-title');
const topicNameInput  = document.getElementById('new-topic-name');
const topicEmailInput = document.getElementById('new-topic-email');
const topicTitleError = document.getElementById('topic-title-error');
const topicNameError  = document.getElementById('topic-name-error');
const topicEmailError = document.getElementById('topic-email-error');
const addTopicCloseBtn= document.getElementById('add-topic-close-btn');
const addTopicCancelBtn=document.getElementById('add-topic-cancel-btn');

/* ── RENDER ───────────────────────────────────────────── */
function renderSection(sectionKey) {
  const cfg         = SECTION_CONFIG[sectionKey];
  const grid        = document.getElementById(cfg.gridId);
  grid.innerHTML    = '';
  const sessions    = sectionKey === 'general' ? allGeneralSessions() : SESSIONS_AMA;
  const deviceCount = deviceVoteCountForSection(sectionKey);
  const quotaFull   = deviceCount >= cfg.quota;

  sessions.forEach((session, idx) => {
    const palette  = PALETTES[idx % PALETTES.length];
    const count    = getVoteCount(session.id);
    const voted    = checkDeviceVoted(session.id);
    const locked   = !voted && quotaFull;
    const isCustom = session.id >= 1000;
    const bio      = session.speaker ? (SPEAKER_BIOS[session.speaker] || '') : '';

    const card = document.createElement('div');
    card.className  = `flip-card${voted ? ' voted' : ''}${locked ? ' locked' : ''}`;
    card.dataset.id = session.id;
    card.setAttribute('tabindex', locked ? '-1' : '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Session ${session.id}: ${session.title}`);
    card.style.setProperty('--card-accent',    palette.accent);
    card.style.setProperty('--card-accent-dk', palette.accentDk);

    /* Label: built-in sessions keep "Unconference N", custom ones say "Community Topic" */
    const frontLabel  = isCustom ? '💬 Community Topic' : `Unconference ${session.id}`;
    const backLabel   = isCustom ? 'COMMUNITY TOPIC'    : `UNCONFERENCE ${session.id}`;

    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <div>
            <div class="card-number">${frontLabel}</div>
            <div class="voted-badge">&#10003; Interested</div>
          </div>
          <div class="card-title">${escHtml(session.title)}</div>
          ${bio ? `<div class="card-bio">${escHtml(bio)}</div>` : ''}
          <div class="card-footer">
            <div class="card-vote-count">
              <span class="thumb">&#128077;</span>
              <span class="count-num" data-id="${session.id}">${count}</span>&nbsp;interested
            </div>
            <div class="card-hint">${locked ? '&#128274; Quota full' : 'Hover to vote &#8594;'}</div>
          </div>
        </div>
        <div class="flip-card-back">
          <div class="back-label">${backLabel}</div>
          <div class="back-title">${escHtml(session.title)}</div>
          ${bio ? `<div class="back-bio">${escHtml(bio)}</div>` : ''}
          <div class="back-vote-info">${count} ${count === 1 ? 'person' : 'people'} interested</div>
          <button class="btn-vote${voted ? ' voted' : ''}"
                  data-id="${session.id}"
                  ${locked ? 'disabled' : ''}
                  aria-label="${voted ? 'Already interested' : 'Express interest'}">
            ${voted ? '&#10003; You&apos;re Interested!' : '&#128077; I&apos;m Interested!'}
          </button>
        </div>
      </div>`;

    grid.appendChild(card);
  });

  updateQuotaUI(sectionKey);
  attachCardListeners(sectionKey);
}

function renderAll() {
  renderSection('general');
  renderSection('ama');
}

/* ── QUOTA UI ─────────────────────────────────────────── */
function updateQuotaUI(sectionKey) {
  const cfg     = SECTION_CONFIG[sectionKey];
  const count   = deviceVoteCountForSection(sectionKey);
  const wrapper = document.getElementById(cfg.quotaWrapperId);
  const textEl  = document.getElementById(cfg.quotaTextId);
  textEl.textContent = `${count} / ${cfg.quota} selected`;
  wrapper.classList.remove('complete', 'over');
  if (count === cfg.quota)      wrapper.classList.add('complete');
  else if (count > cfg.quota)   wrapper.classList.add('over');
}

/* ── CARD LISTENERS ───────────────────────────────────── */
function attachCardListeners(sectionKey) {
  const cfg  = SECTION_CONFIG[sectionKey];
  const grid = document.getElementById(cfg.gridId);
  grid.querySelectorAll('.btn-vote:not(.voted):not([disabled])').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(Number(btn.dataset.id));
    });
  });
  grid.querySelectorAll('.flip-card:not(.locked)').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!card.classList.contains('voted')) openModal(Number(card.dataset.id));
      }
    });
  });
}

/* ── VOTE MODAL ───────────────────────────────────────── */
function openModal(sessionId) {
  const sessions = [...allGeneralSessions(), ...SESSIONS_AMA];
  const session  = sessions.find(s => s.id === sessionId);
  if (!session) return;
  pendingSessionId = sessionId;
  const isCustom = sessionId >= 1000;
  modalSession.textContent = isCustom
    ? `Community Topic: ${session.title}`
    : `Unconference ${sessionId}: ${session.title}`;
  clearForm();
  overlay.classList.remove('hidden');
  nameInput.focus();
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  overlay.classList.add('hidden');
  pendingSessionId = null;
  clearForm();
  document.body.style.overflow = '';
}

function clearForm() {
  form.reset();
  nameError.textContent = emailError.textContent = '';
  nameInput.classList.remove('invalid');
  emailInput.classList.remove('invalid');
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

/* ── FORMSPREE ────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgolzydb';

async function sendToFormspree(payload) {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (_) { /* silently fail */ }
}

/* ── VOTE FORM SUBMIT ─────────────────────────────────── */
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  let valid   = true;

  if (!name) {
    nameError.textContent = 'Please enter your name.';
    nameInput.classList.add('invalid'); valid = false;
  } else { nameError.textContent = ''; nameInput.classList.remove('invalid'); }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.classList.add('invalid'); valid = false;
  } else { emailError.textContent = ''; emailInput.classList.remove('invalid'); }

  if (!valid) return;

  if (hasVoted(email, pendingSessionId)) {
    showToast(`${email} has already voted for this session.`, 'error');
    closeModal(); return;
  }

  const sectionKey = sectionFor(pendingSessionId);
  const cfg        = SECTION_CONFIG[sectionKey];
  const voterIds   = loadVoterSessions()[email.toLowerCase()] || [];
  const sectionSessions = sectionKey === 'general' ? allGeneralSessions() : SESSIONS_AMA;
  const sectionIds = sectionSessions.map(s => s.id);
  const usedQuota  = voterIds.filter(id => sectionIds.includes(id)).length;

  if (usedQuota >= cfg.quota) {
    const label = sectionKey === 'general' ? 'General Topics' : 'AMAs';
    showToast(`You've already chosen ${cfg.quota} session${cfg.quota > 1 ? 's' : ''} in "${label}".`, 'error');
    closeModal(); return;
  }

  const allSess  = [...allGeneralSessions(), ...SESSIONS_AMA];
  const session  = allSess.find(s => s.id === pendingSessionId);
  recordVote(pendingSessionId, name, email);

  await sendToFormspree({
    name, email,
    session:   session?.id >= 1000 ? `Community Topic` : `Unconference ${pendingSessionId}`,
    section:   sectionKey === 'general' ? 'General Topics' : 'AMAs with Mentors & Invitees',
    topic:     session ? session.title : '',
    timestamp: new Date().toISOString(),
  });

  closeModal();
  showToast(`&#128077; Thanks, ${name}! Your interest has been recorded.`, 'success');
  renderSection(sectionKey);
  renderAdminTable();
});

/* ── ADD TOPIC MODAL ──────────────────────────────────── */
function openAddTopicModal() {
  addTopicOverlay.classList.remove('hidden');
  topicInput.focus();
  document.body.style.overflow = 'hidden';
}

function closeAddTopicModal() {
  addTopicOverlay.classList.add('hidden');
  addTopicForm.reset();
  topicTitleError.textContent = topicNameError.textContent = topicEmailError.textContent = '';
  topicInput.classList.remove('invalid');
  topicNameInput.classList.remove('invalid');
  topicEmailInput.classList.remove('invalid');
  document.body.style.overflow = '';
}

addTopicBtn      && addTopicBtn.addEventListener('click', openAddTopicModal);
addTopicCloseBtn && addTopicCloseBtn.addEventListener('click', closeAddTopicModal);
addTopicCancelBtn&& addTopicCancelBtn.addEventListener('click', closeAddTopicModal);
addTopicOverlay  && addTopicOverlay.addEventListener('click', e => { if (e.target === addTopicOverlay) closeAddTopicModal(); });

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeAddTopicModal(); }
});

addTopicForm && addTopicForm.addEventListener('submit', async e => {
  e.preventDefault();
  const topicTitle = topicInput.value.trim();
  const name       = topicNameInput.value.trim();
  const email      = topicEmailInput.value.trim();
  let valid        = true;

  if (!topicTitle || topicTitle.length < 10) {
    topicTitleError.textContent = 'Please enter a topic of at least 10 characters.';
    topicInput.classList.add('invalid'); valid = false;
  } else { topicTitleError.textContent = ''; topicInput.classList.remove('invalid'); }

  if (!name) {
    topicNameError.textContent = 'Please enter your name.';
    topicNameInput.classList.add('invalid'); valid = false;
  } else { topicNameError.textContent = ''; topicNameInput.classList.remove('invalid'); }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    topicEmailError.textContent = 'Please enter a valid email address.';
    topicEmailInput.classList.add('invalid'); valid = false;
  } else { topicEmailError.textContent = ''; topicEmailInput.classList.remove('invalid'); }

  if (!valid) return;

  /* Check if this email has already used their General Topics quota */
  const voterIds    = loadVoterSessions()[email.toLowerCase()] || [];
  const genSessions = allGeneralSessions();
  const genIds      = genSessions.map(s => s.id);
  const usedGenQuota= voterIds.filter(id => genIds.includes(id)).length;

  if (usedGenQuota >= SECTION_CONFIG.general.quota) {
    showToast(`You've already selected a General Topic.`, 'error');
    closeAddTopicModal(); return;
  }

  /* Create the new topic */
  const newId    = nextCustomId();
  const newTopic = { id: newId, title: topicTitle, addedBy: name, addedEmail: email.toLowerCase() };
  const topics   = loadUserTopics();
  topics.push(newTopic);
  saveUserTopics(topics);

  /* Auto-vote this person for their own topic */
  recordVote(newId, name, email);

  /* Send to Formspree */
  await sendToFormspree({
    name, email,
    session:   'Community Topic (New)',
    section:   'General Topics',
    topic:     topicTitle,
    timestamp: new Date().toISOString(),
    note:      'User submitted this topic and auto-voted for it.',
  });

  closeAddTopicModal();
  showToast(`&#127775; Your topic has been added and your vote recorded, ${name}!`, 'success');
  renderSection('general');
  renderAdminTable();
});

/* ── TOAST ────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = '') {
  toast.innerHTML = msg;
  toast.className = `toast${type ? ' ' + type : ''}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3400);
}

/* ── UTIL ─────────────────────────────────────────────── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── ADMIN PANEL ──────────────────────────────────────── */
const adminPanel   = document.getElementById('admin-panel');
const exportBtn    = document.getElementById('export-csv-btn');
const clearDataBtn = document.getElementById('clear-data-btn');

function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1') {
    adminPanel.classList.remove('hidden');
    renderAdminTable();
  }
}

function renderAdminTable() {
  const wrap  = document.getElementById('admin-table-wrap');
  if (!wrap) return;
  const votes = loadVotes();
  const rows  = [];
  const allSessions = [...allGeneralSessions(), ...SESSIONS_AMA];

  allSessions.forEach(session => {
    (votes[session.id] || []).forEach(vote => {
      rows.push({
        section: sectionFor(session.id) === 'general' ? 'General Topics' : 'AMAs with Mentors & Invitees',
        session: session.id >= 1000 ? 'Community Topic' : `Unconference ${session.id}`,
        title:   session.title,
        name:    vote.name,
        email:   vote.email,
        ts:      new Date(vote.ts).toLocaleString(),
      });
    });
  });

  if (rows.length === 0) {
    wrap.innerHTML = '<p style="color:var(--gray-500);font-size:.85rem;margin-top:12px;">No votes recorded yet.</p>';
    return;
  }

  let html = `<table><thead><tr>
    <th>Section</th><th>Session</th><th>Topic</th><th>Name</th><th>Email</th><th>Timestamp</th>
  </tr></thead><tbody>`;
  rows.forEach(r => {
    html += `<tr>
      <td>${escHtml(r.section)}</td><td>${escHtml(r.session)}</td>
      <td>${escHtml(r.title)}</td><td>${escHtml(r.name)}</td>
      <td>${escHtml(r.email)}</td><td>${escHtml(r.ts)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

exportBtn && exportBtn.addEventListener('click', () => {
  const votes      = loadVotes();
  const allSessions= [...allGeneralSessions(), ...SESSIONS_AMA];
  let csv = 'Section,Session,Topic,Name,Email,Timestamp\n';
  allSessions.forEach(session => {
    const section = sectionFor(session.id) === 'general' ? 'General Topics' : 'AMAs with Mentors & Invitees';
    const sessLabel = session.id >= 1000 ? 'Community Topic' : `Unconference ${session.id}`;
    (votes[session.id] || []).forEach(vote => {
      csv += [`"${section}"`,`"${sessLabel}"`,`"${session.title.replace(/"/g,'""')}"`,
              `"${vote.name.replace(/"/g,'""')}"`,`"${vote.email}"`,
              `"${new Date(vote.ts).toLocaleString()}"`].join(',') + '\n';
    });
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'unconference_votes.csv'; a.click();
  URL.revokeObjectURL(url);
});

clearDataBtn && clearDataBtn.addEventListener('click', () => {
  if (confirm('Clear ALL vote data? This cannot be undone.')) {
    localStorage.removeItem(VOTES_KEY);
    localStorage.removeItem(VOTER_KEY);
    localStorage.removeItem(USER_TOPICS_KEY);
    localStorage.removeItem(NEXT_ID_KEY);
    renderAll();
    renderAdminTable();
    showToast('All data cleared.', 'error');
  }
});

/* ── FOOTER YEAR ──────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── INIT ─────────────────────────────────────────────── */
renderAll();
initAdmin();
