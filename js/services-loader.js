/**
 * GNG Corporation — Dynamic Services Loader
 * Fetches active services from Supabase and renders premium card grids
 * on agents.html and packages.html, replacing hardcoded content.
 */

(function () {
  'use strict';

  const IS_LOCAL = location.protocol === 'file:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1';

  const CFG = window.GNG_CONFIG || {};
  const SB_URL = IS_LOCAL ? CFG.SUPABASE_URL : 'https://xneeljogbzldbdzdccdt.supabase.co';
  const SB_KEY = IS_LOCAL ? CFG.SUPABASE_ANON_KEY : 'sb_publishable_T-kioo9_PrSyWANCJD0vHQ_wBSYo_z8';

  // ── Icon & Link Mapping for Seeded Services ──
  const ICON_MAP = {
    'WhatsApp AI Agent': {
      color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)',
      svg: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
      page: 'agent-whatsapp.html', query: 'whatsapp-agent'
    },
    'Gmail AI Agent': {
      color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)',
      svg: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
      page: 'agent-gmail.html', query: 'gmail-agent'
    },
    'YouTube Agent': {
      color: '#ff0000', bg: 'rgba(255, 0, 0, 0.1)', border: 'rgba(255, 0, 0, 0.2)',
      svg: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
      page: 'agent-youtube.html', query: 'youtube-agent'
    },
    'Google Sheets Agent': {
      color: '#107c41', bg: 'rgba(16, 124, 65, 0.1)', border: 'rgba(16, 124, 65, 0.2)',
      svg: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>',
      page: 'agent-sheets.html', query: 'sheets-agent'
    },
    'General AI Chatbot': {
      color: 'var(--accent-color)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)',
      svg: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>',
      page: 'agent-chatbot.html', query: 'chatbot-agent'
    },
    'Standard Starter': {
      color: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)',
      svg: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>',
      page: 'package-standard-basic.html', query: 'standard-web-basic'
    },
    'Standard + Database': {
      color: 'var(--accent-secondary)', bg: 'rgba(41, 151, 255, 0.1)', border: 'rgba(41, 151, 255, 0.2)',
      svg: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
      page: 'package-standard-db.html', query: 'standard-web-db'
    },
    'Standard + DB + Admin': {
      color: 'var(--accent-color)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)',
      svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="9" y1="9" x2="21" y2="9"/><line x1="9" y1="15" x2="21" y2="15"/>',
      page: 'package-standard-admin.html', query: 'standard-web-admin'
    },
    '3D Starter': {
      color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)',
      svg: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
      page: 'package-immersive-3d.html', query: 'immersive-web-basic'
    },
    '3D + Database': {
      color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)',
      svg: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
      page: 'package-immersive-db.html', query: 'immersive-web-db'
    },
    '3D + DB + Admin': {
      color: 'var(--accent-color)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)',
      svg: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>',
      page: 'package-immersive-admin.html', query: 'immersive-web-admin'
    }
  };

  // Default icons for dynamically-added services
  const DEFAULT_AGENT_ICON = {
    color: 'var(--accent-color)', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)',
    svg: '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/>'
  };
  const DEFAULT_WEB_ICON = {
    color: 'var(--text-secondary)', bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)',
    svg: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/>'
  };

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildCard(svc, delay) {
    const mapped = ICON_MAP[svc.name];
    const fallback = svc.category === 'ai-agent' ? DEFAULT_AGENT_ICON : DEFAULT_WEB_ICON;
    const icon = mapped || fallback;
    const detailPage = mapped ? mapped.page : null;
    const queryParam = mapped ? mapped.query : slugify(svc.name);

    const features = Array.isArray(svc.features) ? svc.features : [];

    const card = document.createElement('div');
    card.className = `card reveal delay-${delay}`;

    card.innerHTML = `
      <div class="card-icon-wrapper" style="background-color: ${icon.bg}; border-color: ${icon.border}; color: ${icon.color};">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${icon.svg}
        </svg>
      </div>
      <h3 class="card-title">${escapeHtml(svc.name)}</h3>
      <p class="card-description">${escapeHtml(svc.description)}</p>
      <div style="margin-bottom: 1.5rem;">
        <span style="font-size: 0.8rem; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.05em;">Pricing Starts At</span>
        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">$${escapeHtml(svc.price)} <span style="font-size: 0.9rem; font-weight: 400; color: var(--text-muted);">${escapeHtml(svc.price_period)}</span></div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
        ${detailPage ? `<a href="${detailPage}" class="btn-link">
          View Features
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>` : `<span></span>`}
        <a href="contact.html?service=${queryParam}" class="btn btn-secondary btn-sm">Get Started</a>
      </div>
    `;
    return card;
  }

  async function loadServices() {
    try {
      const resp = await fetch(`${SB_URL}/rest/v1/services?active=eq.true&select=*&order=created_at.asc`, {
        headers: {
          'apikey': SB_KEY,
          'Authorization': `Bearer ${SB_KEY}`
        }
      });

      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const services = await resp.json();

      // ── Populate Agents Grid ──
      const agentsGrid = document.getElementById('agents-grid');
      if (agentsGrid) {
        const agents = services.filter(s => s.category === 'ai-agent');
        if (agents.length > 0) {
          agentsGrid.innerHTML = '';
          const delays = [100, 200, 300];
          agents.forEach((svc, i) => {
            agentsGrid.appendChild(buildCard(svc, delays[i % delays.length]));
          });
        }
      }

      // ── Populate Standard Web Packages Grid ──
      const standardGrid = document.getElementById('standard-grid');
      if (standardGrid) {
        const standards = services.filter(s =>
          s.category === 'web-package' &&
          (s.name.toLowerCase().includes('standard') || s.name.toLowerCase().startsWith('standard'))
        );
        if (standards.length > 0) {
          standardGrid.innerHTML = '';
          const delays = [100, 200, 300];
          standards.forEach((svc, i) => {
            standardGrid.appendChild(buildCard(svc, delays[i % delays.length]));
          });
        }
      }

      // ── Populate Immersive Web Packages Grid ──
      const immersiveGrid = document.getElementById('immersive-grid');
      if (immersiveGrid) {
        const immersives = services.filter(s =>
          s.category === 'web-package' &&
          (s.name.toLowerCase().includes('3d') || s.name.toLowerCase().includes('immersive'))
        );
        if (immersives.length > 0) {
          immersiveGrid.innerHTML = '';
          const delays = [100, 200, 300];
          immersives.forEach((svc, i) => {
            immersiveGrid.appendChild(buildCard(svc, delays[i % delays.length]));
          });
        }
      }

    } catch (err) {
      // Silently fail — the hardcoded fallback cards remain visible
      console.warn('Services loader: could not fetch from database, using static fallback.', err.message);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadServices);
  } else {
    loadServices();
  }
})();
