/* GNG Corporation - Services Config & Dropdown Builder (js/services.js)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH
 * All selectable services live here. To add, remove, or rename a service,
 * edit this array only — the contact form dropdown updates automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const GNG_SERVICES = [
  // ── AI Agents ──────────────────────────────────────────────────────────────
  {
    group: 'AI Agents',
    value: 'whatsapp-agent',
    label: 'WhatsApp AI Agent',
    hint: 'Starting $499/mo'
  },
  {
    group: 'AI Agents',
    value: 'gmail-agent',
    label: 'Gmail AI Agent',
    hint: 'Starting $399/mo'
  },
  {
    group: 'AI Agents',
    value: 'youtube-agent',
    label: 'YouTube Automation Agent',
    hint: 'Starting $599/mo'
  },
  {
    group: 'AI Agents',
    value: 'sheets-agent',
    label: 'Google Sheets Automation Agent',
    hint: 'Starting $349/mo'
  },
  {
    group: 'AI Agents',
    value: 'chatbot-agent',
    label: 'Custom General Chatbot',
    hint: 'Starting $599/mo'
  },

  // ── Website Packages ────────────────────────────────────────────────────────
  {
    group: 'Website Packages',
    value: 'standard-web-basic',
    label: 'Standard Website – Normal',
    hint: 'Starting $1,499'
  },
  {
    group: 'Website Packages',
    value: 'standard-web-db',
    label: 'Standard Website – Normal + Database',
    hint: 'Starting $2,499'
  },
  {
    group: 'Website Packages',
    value: 'standard-web-admin',
    label: 'Standard Website – Normal + Database + Admin Panel',
    hint: 'Starting $3,499'
  },
  {
    group: 'Website Packages',
    value: 'immersive-web-basic',
    label: '3D/Immersive Website – 3D',
    hint: 'Starting $4,499'
  },
  {
    group: 'Website Packages',
    value: 'immersive-web-db',
    label: '3D/Immersive Website – 3D + Database',
    hint: 'Starting $5,999'
  },
  {
    group: 'Website Packages',
    value: 'immersive-web-admin',
    label: '3D/Immersive Website – 3D + Database + Admin Panel',
    hint: 'Starting $7,499'
  },

  // ── Catch-all ───────────────────────────────────────────────────────────────
  {
    group: null,                   // no optgroup — renders at top-level
    value: 'other',
    label: 'Other / Not sure yet',
    hint: null
  }
];

/**
 * Builds <optgroup> / <option> elements from GNG_SERVICES and injects them
 * into the <select id="service"> element.
 *
 * Groups are rendered as <optgroup label="…"> containing their options.
 * Items with group: null are appended directly to the <select>.
 */
function buildServiceDropdown() {
  const select = document.getElementById('service');
  if (!select) return;

  // Keep only the first child (the disabled placeholder option)
  const placeholder = select.querySelector('option[disabled]');
  select.innerHTML = '';
  if (placeholder) select.appendChild(placeholder);

  // Track which optgroup elements we've already created
  const groups = {};

  GNG_SERVICES.forEach(service => {
    const optionText = service.hint
      ? `${service.label}  (${service.hint})`
      : service.label;

    const option = document.createElement('option');
    option.value = service.value;
    option.textContent = optionText;

    if (service.group) {
      // Create the <optgroup> if it doesn't exist yet
      if (!groups[service.group]) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = service.group;
        groups[service.group] = optgroup;
        select.appendChild(optgroup);
      }
      groups[service.group].appendChild(option);
    } else {
      // No group — append directly to <select>
      select.appendChild(option);
    }
  });
}

/**
 * Reads the `?service=` URL query parameter and pre-selects the matching
 * option. Falls back silently if the value isn't in GNG_SERVICES.
 */
function prefillServiceFromUrl() {
  const select = document.getElementById('service');
  if (!select) return;

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (!serviceParam) return;

  // Check against the canonical values list
  const validValues = GNG_SERVICES.map(s => s.value);

  // Also support legacy broad slugs that previously mapped to two umbrella values.
  // Map them to the most basic tier so old links still work.
  const legacyMap = {
    'standard-web': 'standard-web-basic',
    'immersive-web': 'immersive-web-basic'
  };

  const resolved = legacyMap[serviceParam] ?? serviceParam;

  if (validValues.includes(resolved)) {
    select.value = resolved;
  }
}

// ── Entry point — runs as soon as the DOM is ready ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildServiceDropdown();
  prefillServiceFromUrl();
});
