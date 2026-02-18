/* ============================================================
   TAKSHASHILA UNCONFERENCE – APP LOGIC
   Rules:
     • Section A (ids 1–4):  exactly 1 vote required
     • Section B (ids 5–22): exactly 2 votes required
   Storage: localStorage (client-side demo)
   Data key: 'ti_uncof_votes'  → { sessionId: [{name,email,ts}, …] }
   Per-voter: 'ti_voter_sessions' → { email: [sessionId, …] }
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

const SESSIONS_AMA = [
  { id: 10, title: "AMA with Dr. Manpreet Sethi" },
  { id: 11, title: "AMA with Dr. Atul Mishra" },
  { id: 12, title: "AMA with Dr. Jabin Jacob" },
  { id: 13, title: "AMA with Prof. Pradeep Taneja" },
  { id: 14, title: "AMA with Lt. Gen. S.L. Narasimhan" },
  { id: 15, title: "AMA with Dr. Sanjaya Baru" },
  { id: 16, title: "AMA with Dr. Happymon Jacob" },
  { id: 17, title: "AMA with Dr. Aparna Pande" },
  { id: 18, title: "AMA with Dr. Shanthie D'Souza" },
  { id: 19, title: "AMA with Prof. Sumit Ganguly" },
  { id: 20, title: "AMA with Amb. Vivek Katju" },
  { id: 21, title: "AMA with Dr. Anirudh Suri" },
  { id: 22, title: "AMA with Prof. Douglas Fuller" },
  { id: 23, title: "AMA with Mr. Karthik Nachiappan" },
  { id: 24, title: "AMA with Mr. Santosh Pai" },
  { id: 25, title: "AMA with Ms. Katja Drinhausen" },
  { id: 26, title: "AMA with Dr. Anton Harder" },
  { id: 27, title: "AMA with Dr. Devendra Kumar" },
  { id: 28, title: "AMA with Dr. Amrita Jash" },
  { id: 29, title: "AMA with Nitin Pai" },
];

const ALL_SESSIONS = [...SESSIONS_GENERAL, ...SESSIONS_AMA];

const SECTION_CONFIG = {
  general: { sessions: SESSIONS_GENERAL, quota: 1, gridId: 'sessions-grid-general', quotaTextId: 'quota-general-text', quotaWrapperId: 'quota-general' },
  ama:     { sessions: SESSIONS_AMA,     quota: 2, gridId: 'sessions-grid-ama',     quotaTextId: 'quota-ama-text',     quotaWrapperId: 'quota-ama'     },
};

function sectionFor(sessionId) {
  return sessionId <= 9 ? 'general' : 'ama';
}

/* Colour palette cycling — brand-aligned */
const PALETTES = [
  { accent: '#f19914', accentDk: '#c97e0a' }, // orange
  { accent: '#610d3e', accentDk: '#3d0827' }, // maroon
  { accent: '#1a6e8a', accentDk: '#124d62' }, // teal-blue
  { accent: '#6d4c9e', accentDk: '#4a3370' }, // purple
  { accent: '#c0392b', accentDk: '#922b21' }, // red
  { accent: '#1e7e45', accentDk: '#145e31' }, // green
  { accent: '#d35400', accentDk: '#a04000' }, // burnt orange
  { accent: '#2471a3', accentDk: '#1a527a' }, // blue
];

/* ── STORAGE ──────────────────────────────────────────── */
const VOTES_KEY = 'ti_uncof_votes';
const VOTER_KEY = 'ti_voter_sessions';

function loadVotes() {
  try { return JSON.parse(localStorage.getItem(VOTES_KEY)) || {}; } catch { return {}; }
}
function saveVotes(d)  { localStorage.setItem(VOTES_KEY, JSON.stringify(d)); }
function loadVoterSessions() {
  try { return JSON.parse(localStorage.getItem(VOTER_KEY)) || {}; } catch { return {}; }
}
function saveVoterSessions(d) { localStorage.setItem(VOTER_KEY, JSON.stringify(d)); }

function getVoteCount(sessionId) {
  return (loadVotes()[sessionId] || []).length;
}
function hasVoted(email, sessionId) {
  return (loadVoterSessions()[email.toLowerCase()] || []).includes(sessionId);
}
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

/* Check if this browser device has voted for a given session */
function checkDeviceVoted(sessionId) {
  const vs = loadVoterSessions();
  return Object.values(vs).some(arr => arr.includes(sessionId));
}

/* Count device votes in a section */
function deviceVoteCountForSection(sectionKey) {
  const ids = SECTION_CONFIG[sectionKey].sessions.map(s => s.id);
  return ids.filter(id => checkDeviceVoted(id)).length;
}

/* ── STATE ────────────────────────────────────────────── */
let pendingSessionId   = null;
let pendingName        = '';
let pendingEmail       = '';

/* ── DOM REFS ─────────────────────────────────────────── */
const overlay      = document.getElementById('modal-overlay');
const modalSession = document.getElementById('modal-session-name');
const form         = document.getElementById('interest-form');
const nameInput    = document.getElementById('voter-name');
const emailInput   = document.getElementById('voter-email');
const nameError    = document.getElementById('name-error');
const emailError   = document.getElementById('email-error');
const closeBtn     = document.getElementById('modal-close-btn');
const cancelBtn    = document.getElementById('modal-cancel-btn');
const toast        = document.getElementById('toast');

/* ── RENDER ───────────────────────────────────────────── */
function renderSection(sectionKey) {
  const cfg  = SECTION_CONFIG[sectionKey];
  const grid = document.getElementById(cfg.gridId);
  grid.innerHTML = '';

  const deviceCount = deviceVoteCountForSection(sectionKey);
  const quotaFull   = deviceCount >= cfg.quota;

  cfg.sessions.forEach((session, idx) => {
    const globalIdx = ALL_SESSIONS.findIndex(s => s.id === session.id);
    const palette   = PALETTES[globalIdx % PALETTES.length];
    const count     = getVoteCount(session.id);
    const voted     = checkDeviceVoted(session.id);
    const locked    = !voted && quotaFull;

    const card = document.createElement('div');
    card.className = `flip-card${voted ? ' voted' : ''}${locked ? ' locked' : ''}`;
    card.dataset.id = session.id;
    card.setAttribute('tabindex', locked ? '-1' : '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Session ${session.id}: ${session.title}`);
    card.style.setProperty('--card-accent',    palette.accent);
    card.style.setProperty('--card-accent-dk', palette.accentDk);

    card.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <div>
            <div class="card-number">Unconference ${session.id}</div>
            <div class="voted-badge">&#10003; Interested</div>
          </div>
          <div class="card-title">${escHtml(session.title)}</div>
          <div class="card-footer">
            <div class="card-vote-count">
              <span class="thumb">&#128077;</span>
              <span class="count-num" data-id="${session.id}">${count}</span>&nbsp;interested
            </div>
            <div class="card-hint">${locked ? '&#128274; Quota full' : 'Hover to vote &#8594;'}</div>
          </div>
        </div>
        <div class="flip-card-back">
          <div class="back-label">Unconference ${session.id}</div>
          <div class="back-title">${escHtml(session.title)}</div>
          <div class="back-vote-info">${count} ${count === 1 ? 'person' : 'people'} interested</div>
          <button class="btn-vote${voted ? ' voted' : ''}"
                  data-id="${session.id}"
                  ${locked ? 'disabled' : ''}
                  aria-label="${voted ? 'Already interested' : 'Express interest in this session'}">
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
  const cfg        = SECTION_CONFIG[sectionKey];
  const count      = deviceVoteCountForSection(sectionKey);
  const wrapper    = document.getElementById(cfg.quotaWrapperId);
  const textEl     = document.getElementById(cfg.quotaTextId);

  textEl.textContent = `${count} / ${cfg.quota} selected`;
  wrapper.classList.remove('complete', 'over');
  if (count === cfg.quota) wrapper.classList.add('complete');
  else if (count > cfg.quota) wrapper.classList.add('over');
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
        const id = Number(card.dataset.id);
        if (!card.classList.contains('voted')) openModal(id);
      }
    });
  });
}

/* ── MODAL ────────────────────────────────────────────── */
function openModal(sessionId) {
  const session = ALL_SESSIONS.find(s => s.id === sessionId);
  if (!session) return;
  pendingSessionId = sessionId;
  modalSession.textContent = `Unconference ${sessionId}: ${session.title}`;
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
  nameError.textContent  = '';
  emailError.textContent = '';
  nameInput.classList.remove('invalid');
  emailInput.classList.remove('invalid');
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── FORMSPREE ENDPOINT ───────────────────────────────── */
// Sign up at https://formspree.io with anushka@takshashila.org.in,
// create a form, and replace the placeholder below with your form ID.
// It looks like: https://formspree.io/f/abcdefgh
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgolzydb';

async function sendToFormspree(payload) {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (_) {
    // Silently fail — vote is still saved locally
  }
}

/* ── FORM SUBMIT ──────────────────────────────────────── */
form.addEventListener('submit', async e => {
  e.preventDefault();
  const name  = nameInput.value.trim();
  const email = emailInput.value.trim();
  let valid   = true;

  if (!name) {
    nameError.textContent = 'Please enter your name.';
    nameInput.classList.add('invalid');
    valid = false;
  } else {
    nameError.textContent = '';
    nameInput.classList.remove('invalid');
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRe.test(email)) {
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.classList.add('invalid');
    valid = false;
  } else {
    emailError.textContent = '';
    emailInput.classList.remove('invalid');
  }

  if (!valid) return;

  if (hasVoted(email, pendingSessionId)) {
    showToast(`${email} has already voted for this session.`, 'error');
    closeModal();
    return;
  }

  // Enforce quota: check how many votes this email has already cast in this section
  const sectionKey = sectionFor(pendingSessionId);
  const cfg        = SECTION_CONFIG[sectionKey];
  const emailKey   = email.toLowerCase();
  const voterMap   = loadVoterSessions();
  const voterIds   = voterMap[emailKey] || [];
  const sectionIds = cfg.sessions.map(s => s.id);
  const usedQuota  = voterIds.filter(id => sectionIds.includes(id)).length;

  if (usedQuota >= cfg.quota) {
    const label = sectionKey === 'general' ? 'General Topics' : 'AMAs';
    showToast(`You've already chosen ${cfg.quota} session${cfg.quota > 1 ? 's' : ''} in "${label}".`, 'error');
    closeModal();
    return;
  }

  const session = ALL_SESSIONS.find(s => s.id === pendingSessionId);
  recordVote(pendingSessionId, name, email);

  // Send to Formspree (emails anushka@takshashila.org.in)
  await sendToFormspree({
    name,
    email,
    session:   `Unconference ${pendingSessionId}`,
    section:   sectionKey === 'general' ? 'General Topics' : 'AMAs with Mentors & Invitees',
    topic:     session ? session.title : '',
    timestamp: new Date().toISOString(),
  });

  closeModal();
  showToast(`&#128077; Thanks, ${name}! Your interest has been recorded.`, 'success');

  // Re-render the relevant section to apply locking / quota update
  renderSection(sectionKey);
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

  ALL_SESSIONS.forEach(session => {
    (votes[session.id] || []).forEach(vote => {
      rows.push({
        section: session.id <= 9 ? 'General Topics' : 'AMAs with Mentors & Invitees',
        session: `Unconference ${session.id}`,
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
      <td>${escHtml(r.section)}</td>
      <td>${escHtml(r.session)}</td>
      <td>${escHtml(r.title)}</td>
      <td>${escHtml(r.name)}</td>
      <td>${escHtml(r.email)}</td>
      <td>${escHtml(r.ts)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

exportBtn && exportBtn.addEventListener('click', () => {
  const votes = loadVotes();
  let csv = 'Section,Session,Topic,Name,Email,Timestamp\n';
  ALL_SESSIONS.forEach(session => {
    const section = session.id <= 9 ? 'General Topics' : 'AMAs with Mentors & Invitees';
    (votes[session.id] || []).forEach(vote => {
      csv += [
        `"${section}"`,
        `"Unconference ${session.id}"`,
        `"${session.title.replace(/"/g,'""')}"`,
        `"${vote.name.replace(/"/g,'""')}"`,
        `"${vote.email}"`,
        `"${new Date(vote.ts).toLocaleString()}"`,
      ].join(',') + '\n';
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
