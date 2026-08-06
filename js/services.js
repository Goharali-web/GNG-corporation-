/* GNG Corporation - Services Dropdown Builder (js/services.js)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC – fetches live services from Supabase via the public /api/services
 * endpoint (Vercel) or direct Supabase REST (local dev). Uses the anon key
 * only — read-only, same security model as the public pages.
 *
 * When the admin adds, edits, archives, or deletes a service in the admin
 * panel, this dropdown reflects the change on the next page load — no
 * redeploy needed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Hardcoded fallback (used ONLY if the fetch fails) ─────────────────────────
const GNG_SERVICES_FALLBACK = [
  { group: 'AI Agents',        value: 'whatsapp-agent',      label: 'WhatsApp AI Agent',                                  hint: 'Starting $499/mo'  },
  { group: 'AI Agents',        value: 'gmail-agent',          label: 'Gmail AI Agent',                                     hint: 'Starting $399/mo'  },
  { group: 'AI Agents',        value: 'youtube-agent',        label: 'YouTube Automation Agent',                           hint: 'Starting $599/mo'  },
  { group: 'AI Agents',        value: 'sheets-agent',         label: 'Google Sheets Automation Agent',                     hint: 'Starting $349/mo'  },
  { group: 'AI Agents',        value: 'chatbot-agent',        label: 'Custom General Chatbot',                             hint: 'Starting $599/mo'  },
  { group: 'Website Packages', value: 'standard-web-basic',   label: 'Standard Website – Normal',                          hint: 'Starting $1,499'   },
  { group: 'Website Packages', value: 'standard-web-db',      label: 'Standard Website – Normal + Database',               hint: 'Starting $2,499'   },
  { group: 'Website Packages', value: 'standard-web-admin',   label: 'Standard Website – Normal + Database + Admin Panel',  hint: 'Starting $3,499'   },
  { group: 'Website Packages', value: 'immersive-web-basic',  label: '3D/Immersive Website – 3D',                          hint: 'Starting $4,499'   },
  { group: 'Website Packages', value: 'immersive-web-db',     label: '3D/Immersive Website – 3D + Database',               hint: 'Starting $5,999'   },
  { group: 'Website Packages', value: 'immersive-web-admin',  label: '3D/Immersive Website – 3D + Database + Admin Panel',  hint: 'Starting $7,499'   }
];

// ── Category → human-readable optgroup label ──────────────────────────────────
const CATEGORY_LABELS = {
  ai_agent:    'AI Agents',
  web_package: 'Website Packages'
};

// ── Fetch live services from Supabase ─────────────────────────────────────────
async function fetchServicesFromDB() {
  const IS_LOCAL = location.protocol === 'file:'
    || location.hostname === 'localhost'
    || location.hostname === '127.0.0.1';
  const LOCAL_CFG = window.GNG_CONFIG || {};

  let response;

  if (IS_LOCAL) {
    // Direct Supabase REST with the public anon key (read-only)
    response = await fetch(
      `${LOCAL_CFG.SUPABASE_URL}/rest/v1/services?is_archived=eq.false&order=display_order.asc`,
      {
        method: 'GET',
        headers: {
          'apikey': LOCAL_CFG.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${LOCAL_CFG.SUPABASE_ANON_KEY}`
        }
      }
    );
  } else {
    // Vercel serverless endpoint (also uses anon key internally for GET)
    response = await fetch('/api/services');
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const rows = await response.json();

  // Filter out archived (safety net — query already excludes them)
  return rows.filter(r => !r.is_archived);
}

/**
 * Convert a Supabase service row into the lightweight shape used by the
 * dropdown renderer: { group, value, label, hint }
 */
function rowToDropdownItem(row) {
  const group = CATEGORY_LABELS[row.category] || row.category;
  // Build a slug from the name if detail_url isn't set
  const value = row.detail_url
    ? row.detail_url.replace('.html', '')
    : row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const label = row.name;
  const hint  = row.price ? `Starting ${row.price}` : null;
  return { group, value, label, hint };
}

/**
 * Builds <optgroup> / <option> elements from a service list and injects them
 * into the <select id="service"> element.
 *
 * Groups are rendered as <optgroup label="…"> containing their options.
 * Items with group: null are appended directly to the <select>.
 */
function renderDropdown(serviceItems) {
  const select = document.getElementById('service');
  if (!select) return;

  // Keep only the first child (the disabled placeholder option)
  const placeholder = select.querySelector('option[disabled]');
  select.innerHTML = '';
  if (placeholder) select.appendChild(placeholder);

  // Track optgroup elements we've already created
  const groups = {};

  serviceItems.forEach(service => {
    const optionText = service.hint
      ? `${service.label}  (${service.hint})`
      : service.label;

    const option = document.createElement('option');
    option.value = service.value;
    option.textContent = optionText;

    if (service.group) {
      if (!groups[service.group]) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = service.group;
        groups[service.group] = optgroup;
        select.appendChild(optgroup);
      }
      groups[service.group].appendChild(option);
    } else {
      select.appendChild(option);
    }
  });

  // ── Always append the hardcoded catch-all ──────────────────────────────────
  const otherOption = document.createElement('option');
  otherOption.value = 'other';
  otherOption.textContent = 'Other / Not sure yet';
  select.appendChild(otherOption);
}

/**
 * Main entry: tries to fetch services from Supabase, falls back to the
 * hardcoded list if the network request fails.
 */
async function buildServiceDropdown() {
  try {
    const rows = await fetchServicesFromDB();
    const items = rows.map(rowToDropdownItem);
    renderDropdown(items);
  } catch (err) {
    console.warn('[GNG] Could not fetch services from database, using fallback list:', err);
    renderDropdown(GNG_SERVICES_FALLBACK);
  }
}

/**
 * Reads the `?service=` URL query parameter and pre-selects the matching
 * option. Falls back silently if the value isn't found.
 */
function prefillServiceFromUrl() {
  const select = document.getElementById('service');
  if (!select) return;

  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (!serviceParam) return;

  // Collect all current option values from the <select>
  const validValues = Array.from(select.options).map(o => o.value);

  // Legacy broad slugs → map to the most basic tier so old links still work
  const legacyMap = {
    'standard-web':  'standard-web-basic',
    'immersive-web': 'immersive-web-basic'
  };

  const resolved = legacyMap[serviceParam] ?? serviceParam;

  if (validValues.includes(resolved)) {
    select.value = resolved;
  }
}

// ── Entry point — runs as soon as the DOM is ready ────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await buildServiceDropdown();
  prefillServiceFromUrl();
});
