/* ============================================================
   TAKSHASHILA UNCONFERENCE – APP LOGIC  v3
   Storage: JSONBin.io (shared across all users/devices)
     bin 1: topics  → { topics: [{id,label,title,speaker?,addedBy?,addedEmail?}] }
     bin 2: votes   → { votes:  {topicId: [{name,email,ts}]} }
   Rules:
     • Each email can upvote each topic at most once
     • No overall cap — upvote as many topics as you like
     • Adding your own topic does NOT block upvoting others
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────────────────────
   JSONBIN CONFIG
   Create two free bins at https://jsonbin.io and paste IDs below.
   Also paste your JSONBin API key (X-Master-Key).
   ───────────────────────────────────────────────────────── */
const JSONBIN_KEY      = '$2a$10$NL2i1JiSUo1xr.l1gtrzO.BjYfBRIcju6ni4Imcnqj1yGSOCRZSmC';
const TOPICS_BIN_ID    = '6997f041d0ea881f40c8b08a';
const VOTES_BIN_ID     = '6997f08443b1c97be98d4e65';
const JSONBIN_BASE     = 'https://api.jsonbin.io/v3/b';

/* ── SPEAKER BIOS ──────────────────────────────────────── */
const SPEAKER_BIOS = {
  "Prof. Douglas Fuller":      "Associate Professor at City University of Hong Kong, expert on China's technology.",
  "Lt. Gen. S.L. Narasimhan": "Retired Indian Army Lieutenant General and China expert at Gateway House.",
  "Dr. Manpreet Sethi":        "Distinguished Fellow at Centre for Air Power Studies specialising in nuclear security.",
  "Dr. Atul Mishra":           "Associate Professor at Shiv Nadar University specialising in Indian foreign policy.",
  "Dr. Jabin Jacob":           "Associate Professor at Shiv Nadar University, expert on China-India relations.",
  "Prof. Pradeep Taneja":      "Senior Lecturer at University of Melbourne specialising in China and India.",
  "Dr. Sanjaya Baru":          "Distinguished Fellow at IDSA, former Media Adviser to Prime Minister Singh.",
  "Dr. Happymon Jacob":        "Associate Professor of Diplomacy and Disarmament Studies at Jawaharlal Nehru University.",
  "Dr. Aparna Pande":          "Director, Initiative on the Future of India and South Asia, Hudson Institute.",
  "Dr. Shanthie D'Souza":      "Founder and President of Mantraya Institute, expert on South Asia and Afghanistan.",
  "Prof. Sumit Ganguly":       "Tagore Professor Emeritus at Indiana University and Senior Fellow, Hoover Institution.",
  "Amb. Vivek Katju":          "Retired IFS officer, former Ambassador to Afghanistan, Myanmar, and Thailand.",
  "Dr. Anirudh Suri":          "Non-resident scholar at Carnegie India, author and technology-geopolitics venture capitalist.",
  "Mr. Karthik Nachiappan":    "Research Fellow at the Institute of South Asian Studies, National University of Singapore.",
  "Mr. Santosh Pai":           "Partner at Dentons Link Legal, India's leading expert on India-China business law.",
  "Ms. Katja Drinhausen":      "Head of Politics and Society at MERICS, expert on China's governance and law.",
  "Dr. Anton Harder":          "Historian at the London School of Economics specialising in Sino-Indian Cold War relations.",
  "Dr. Devendra Kumar":        "Associate Fellow at Centre of Excellence for Himalayan Studies, Shiv Nadar University.",
  "Dr. Amrita Jash":           "Assistant Professor at Manipal Academy, expert on China's military and foreign policy.",
  "Nitin Pai":                 "Co-founder and Director of Takshashila Institution, focused on Indo-Pacific and public policy.",
};

/* ── PRESET TOPICS (always shown, seeded into bin on first load) ── */
const PRESET_TOPICS = [
  { id: 1, label: 'Topic 1', title: "How does AI impact jobs in the near future?" },
  { id: 2, label: 'Topic 2', title: "AMA with Prof. Douglas Fuller",      speaker: "Prof. Douglas Fuller" },
  { id: 3, label: 'Topic 3', title: "Can Middle Powers cooperate to mitigate shockwaves of great power politics?" },
  { id: 4, label: 'Topic 4', title: "AMA with Lt. Gen. S.L. Narasimhan", speaker: "Lt. Gen. S.L. Narasimhan" },
  { id: 5, label: 'Topic 5', title: "Should Nuclear Proliferation be Free & Open?" },
  { id: 6, label: 'Topic 6', title: "Should Indian Police Officers be both investigators and enforcers of law & order?" },
];

/* ── COLOUR PALETTE ────────────────────────────────────── */
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

/* ── LOCAL CACHE (avoid hammering API on every render) ─── */
let cachedTopics = null;  // array of topic objects
let cachedVotes  = null;  // { topicId: [{name,email,ts}] }
let nextCustomId = 1000;

/* ── JSONBIN API HELPERS ───────────────────────────────── */
const HEADERS = {
  'Content-Type':  'application/json',
  'X-Master-Key':  JSONBIN_KEY,
  'X-Bin-Versioning': 'false',   // always overwrite latest
};

async function fetchTopics() {
  try {
    const r = await fetch(`${JSONBIN_BASE}/${TOPICS_BIN_ID}/latest`, { headers: HEADERS });
    const j = await r.json();
    let topics = j.record?.topics || [];
    // If bin is empty, seed it with the preset topics
    if (topics.length === 0) {
      topics = [...PRESET_TOPICS];
      await saveTopics(topics);
    }
    // Compute nextCustomId
    const customIds = topics.filter(t => t.id >= 1000).map(t => t.id);
    nextCustomId = customIds.length ? Math.max(...customIds) + 1 : 1000;
    cachedTopics = topics;
    return topics;
  } catch (err) {
    console.warn('fetchTopics failed, using presets', err);
    cachedTopics = [...PRESET_TOPICS];
    return cachedTopics;
  }
}

async function fetchVotes() {
  try {
    const r = await fetch(`${JSONBIN_BASE}/${VOTES_BIN_ID}/latest`, { headers: HEADERS });
    const j = await r.json();
    cachedVotes = j.record?.votes || {};
    return cachedVotes;
  } catch (err) {
    console.warn('fetchVotes failed', err);
    cachedVotes = {};
    return cachedVotes;
  }
}

async function saveTopics(topics) {
  cachedTopics = topics;
  try {
    await fetch(`${JSONBIN_BASE}/${TOPICS_BIN_ID}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ topics }),
    });
  } catch (err) { console.warn('saveTopics failed', err); }
}

async function saveVotes(votes) {
  cachedVotes = votes;
  try {
    await fetch(`${JSONBIN_BASE}/${VOTES_BIN_ID}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ votes }),
    });
  } catch (err) { console.warn('saveVotes failed', err); }
}

/* ── VOTE HELPERS ──────────────────────────────────────── */
function getVoteCount(topicId) {
  return ((cachedVotes || {})[topicId] || []).length;
}

function hasVotedFor(email, topicId) {
  const list = ((cachedVotes || {})[topicId] || []);
  return list.some(v => v.email === email.toLowerCase().trim());
}

/* ── FORMSPREE ─────────────────────────────────────────── */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgolzydb';
async function sendToFormspree(payload) {
  try {
    await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (_) { /* silent */ }
}

/* ── STATE ─────────────────────────────────────────────── */
let pendingTopicId = null;

/* ── DOM REFS ──────────────────────────────────────────── */
const grid             = document.getElementById('topics-grid');
const overlay          = document.getElementById('modal-overlay');
const modalSessionEl   = document.getElementById('modal-session-name');
const form             = document.getElementById('interest-form');
const nameInput        = document.getElementById('voter-name');
const emailInput       = document.getElementById('voter-email');
const nameError        = document.getElementById('name-error');
const emailError       = document.getElementById('email-error');
const closeBtn         = document.getElementById('modal-close-btn');
const cancelBtn        = document.getElementById('modal-cancel-btn');
const toast            = document.getElementById('toast');
const quotaBadge       = document.getElementById('upvote-quota-badge');
const quotaText        = document.getElementById('upvote-quota-text');
const addTopicBtn      = document.getElementById('add-topic-btn');
const addTopicOverlay  = document.getElementById('add-topic-overlay');
const addTopicForm     = document.getElementById('add-topic-form');
const topicInput       = document.getElementById('new-topic-title');
const topicNameInput   = document.getElementById('new-topic-name');
const topicEmailInput  = document.getElementById('new-topic-email');
const topicTitleError  = document.getElementById('topic-title-error');
const topicNameError   = document.getElementById('topic-name-error');
const topicEmailError  = document.getElementById('topic-email-error');
const addTopicCloseBtn = document.getElementById('add-topic-close-btn');
const addTopicCancelBtn= document.getElementById('add-topic-cancel-btn');

/* ── RENDER ────────────────────────────────────────────── */
function renderTopics() {
  const topics = cachedTopics || PRESET_TOPICS;
  grid.innerHTML = '';

  topics.forEach((topic, idx) => {
    const palette  = PALETTES[idx % PALETTES.length];
    const count    = getVoteCount(topic.id);
    const isCustom = topic.id >= 1000;
    const bio      = topic.speaker ? (SPEAKER_BIOS[topic.speaker] || '') : '';
    const label    = isCustom ? '💬 Community Topic' : (topic.label || `Topic ${topic.id}`);

    const card = document.createElement('div');
    card.className  = 'topic-card';
    card.dataset.id = topic.id;
    card.style.setProperty('--card-accent',    palette.accent);
    card.style.setProperty('--card-accent-dk', palette.accentDk);

    card.innerHTML = `
      <div class="topic-card-accent"></div>
      <div class="topic-card-body">
        <div class="topic-card-label">${escHtml(label)}</div>
        <div class="topic-card-title">${escHtml(topic.title)}</div>
        ${bio ? `<div class="topic-card-bio">${escHtml(bio)}</div>` : ''}
        ${isCustom && topic.addedBy ? `<div class="topic-card-bio">Added by ${escHtml(topic.addedBy)}</div>` : ''}
      </div>
      <div class="topic-card-footer">
        <div class="upvote-wrap">
          <button class="btn-upvote"
                  data-id="${topic.id}"
                  aria-label="Upvote this topic">
            &#9650;
          </button>
          <span class="upvote-count${count > 0 ? ' has-votes' : ''}" data-id="${topic.id}">
            ${count} ${count === 1 ? 'vote' : 'votes'}
          </span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          ${isCustom ? `<span class="community-badge">&#128172; Community</span>` : ''}
        </div>
      </div>`;

    grid.appendChild(card);
  });

  updateQuotaUI();
  attachUpvoteListeners();
}

/* ── QUOTA BADGE — now shows total upvotes across all topics ── */
function updateQuotaUI() {
  const total = Object.values(cachedVotes || {}).reduce((s, arr) => s + arr.length, 0);
  quotaText.textContent = `${total} upvote${total !== 1 ? 's' : ''} cast`;
  // turn green if anything voted
  quotaBadge.classList.toggle('complete', total > 0);
}

/* ── UPVOTE LISTENERS ──────────────────────────────────── */
function attachUpvoteListeners() {
  grid.querySelectorAll('.btn-upvote').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openUpvoteModal(Number(btn.dataset.id));
    });
  });
}

/* ── UPVOTE MODAL ──────────────────────────────────────── */
function openUpvoteModal(topicId) {
  const topic = (cachedTopics || PRESET_TOPICS).find(t => t.id === topicId);
  if (!topic) return;
  pendingTopicId = topicId;
  modalSessionEl.textContent = topic.title;
  clearVoteForm();
  overlay.classList.remove('hidden');
  nameInput.focus();
  document.body.style.overflow = 'hidden';
}

function closeUpvoteModal() {
  overlay.classList.add('hidden');
  pendingTopicId = null;
  clearVoteForm();
  document.body.style.overflow = '';
}

function clearVoteForm() {
  form.reset();
  nameError.textContent = emailError.textContent = '';
  nameInput.classList.remove('invalid');
  emailInput.classList.remove('invalid');
}

closeBtn.addEventListener('click', closeUpvoteModal);
cancelBtn.addEventListener('click', closeUpvoteModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeUpvoteModal(); });

/* ── UPVOTE SUBMIT ─────────────────────────────────────── */
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

  /* Block duplicate vote on the SAME topic only */
  if (hasVotedFor(email, pendingTopicId)) {
    showToast(`You've already upvoted this topic.`, 'error');
    closeUpvoteModal(); return;
  }

  /* Record vote in cache then push to JSONBin */
  const votes = cachedVotes || {};
  if (!votes[pendingTopicId]) votes[pendingTopicId] = [];
  votes[pendingTopicId].push({ name: name.trim(), email: email.trim().toLowerCase(), ts: new Date().toISOString() });

  const topic = (cachedTopics || PRESET_TOPICS).find(t => t.id === pendingTopicId);

  /* Optimistic UI update before awaiting saves */
  closeUpvoteModal();
  showToast(`&#9650; Upvoted! Thanks, ${name}.`, 'success');
  renderTopics();

  await Promise.all([
    saveVotes(votes),
    sendToFormspree({ name, email, topic: topic?.title || '', topicId: pendingTopicId, timestamp: new Date().toISOString(), type: 'upvote' }),
  ]);

  renderAdminTable();
});

/* ── ADD TOPIC MODAL ───────────────────────────────────── */
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
addTopicOverlay  && addTopicOverlay.addEventListener('click', e => {
  if (e.target === addTopicOverlay) closeAddTopicModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeUpvoteModal(); closeAddTopicModal(); }
});

/* ── ADD TOPIC SUBMIT ──────────────────────────────────── */
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

  /* Build new topic object */
  const newId    = nextCustomId++;
  const newTopic = {
    id:         newId,
    label:      '💬 Community Topic',
    title:      topicTitle,
    addedBy:    name.trim(),
    addedEmail: email.trim().toLowerCase(),
  };

  /* Add to cached topics and push to JSONBin */
  const updatedTopics = [...(cachedTopics || PRESET_TOPICS), newTopic];

  /* Also auto-upvote this person for their own topic */
  const votes = cachedVotes || {};
  if (!votes[newId]) votes[newId] = [];
  votes[newId].push({ name: name.trim(), email: email.trim().toLowerCase(), ts: new Date().toISOString() });

  /* Optimistic UI */
  cachedTopics = updatedTopics;
  cachedVotes  = votes;
  closeAddTopicModal();
  showToast(`&#127775; Topic added, ${name}! You've also upvoted it.`, 'success');
  renderTopics();

  /* Persist to JSONBin + email */
  await Promise.all([
    saveTopics(updatedTopics),
    saveVotes(votes),
    sendToFormspree({
      name, email, topic: topicTitle, topicId: newId,
      timestamp: new Date().toISOString(),
      type: 'community_topic_submitted',
      note: 'User submitted this topic and auto-upvoted it. They can still upvote others.',
    }),
  ]);

  renderAdminTable();
});

/* ── TOAST ─────────────────────────────────────────────── */
let toastTimer = null;
function showToast(msg, type = '') {
  toast.innerHTML = msg;
  toast.className = `toast${type ? ' ' + type : ''}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3400);
}

/* ── UTIL ──────────────────────────────────────────────── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── ADMIN PANEL ───────────────────────────────────────── */
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
  const wrap = document.getElementById('admin-table-wrap');
  if (!wrap) return;
  const topics = cachedTopics || PRESET_TOPICS;
  const votes  = cachedVotes  || {};
  const rows   = [];

  topics.forEach(topic => {
    (votes[topic.id] || []).forEach(vote => {
      rows.push({
        type:  topic.id >= 1000 ? 'Community' : 'Preset',
        label: topic.label || `Topic ${topic.id}`,
        title: topic.title,
        name:  vote.name,
        email: vote.email,
        ts:    new Date(vote.ts).toLocaleString(),
      });
    });
  });

  if (rows.length === 0) {
    wrap.innerHTML = '<p style="color:var(--gray-500);font-size:.85rem;margin-top:12px;">No upvotes yet.</p>';
    return;
  }

  let html = `<table><thead><tr>
    <th>Type</th><th>Label</th><th>Topic</th><th>Name</th><th>Email</th><th>Timestamp</th>
  </tr></thead><tbody>`;
  rows.forEach(r => {
    html += `<tr>
      <td>${escHtml(r.type)}</td><td>${escHtml(r.label)}</td>
      <td>${escHtml(r.title)}</td><td>${escHtml(r.name)}</td>
      <td>${escHtml(r.email)}</td><td>${escHtml(r.ts)}</td>
    </tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

exportBtn && exportBtn.addEventListener('click', () => {
  const topics = cachedTopics || PRESET_TOPICS;
  const votes  = cachedVotes  || {};
  let csv = 'Type,Label,Topic,Name,Email,Timestamp\n';
  topics.forEach(topic => {
    (votes[topic.id] || []).forEach(vote => {
      csv += [
        `"${topic.id >= 1000 ? 'Community' : 'Preset'}"`,
        `"${(topic.label||'').replace(/"/g,'""')}"`,
        `"${topic.title.replace(/"/g,'""')}"`,
        `"${vote.name.replace(/"/g,'""')}"`,
        `"${vote.email}"`,
        `"${new Date(vote.ts).toLocaleString()}"`,
      ].join(',') + '\n';
    });
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url;
  a.download = 'unconference_upvotes.csv'; a.click();
  URL.revokeObjectURL(url);
});

clearDataBtn && clearDataBtn.addEventListener('click', async () => {
  if (confirm('Reset to preset topics and clear all upvotes? This cannot be undone.')) {
    cachedTopics = [...PRESET_TOPICS];
    cachedVotes  = {};
    nextCustomId = 1000;
    await Promise.all([ saveTopics(cachedTopics), saveVotes({}) ]);
    renderTopics();
    renderAdminTable();
    showToast('All data cleared.', 'error');
  }
});

/* ── FOOTER YEAR ───────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ── INIT — fetch from JSONBin then render ─────────────── */
(async () => {
  showToast('Loading topics…', '');
  await Promise.all([ fetchTopics(), fetchVotes() ]);
  renderTopics();
  initAdmin();
})();
