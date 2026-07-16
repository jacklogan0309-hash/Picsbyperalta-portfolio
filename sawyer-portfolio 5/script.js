// Sawyer Peralta portfolio — nav toggle, sport filter, lightbox, and
// content rendering. The gallery, bento grid, about bio, and footer
// links are NOT hardcoded in the HTML — they're built at page-load
// time from JSON files in assets/photos/meta.json and content/*.json.
// That's what lets the /admin editor (Decap CMS) change the site:
// it edits those JSON files, and this script is what turns them into
// the actual page every time someone visits.
//
// Render functions take a plain object/array and a container and set
// container.innerHTML — they don't touch `document` directly, which
// keeps them testable from Node without a real browser/DOM.

const CATEGORY_ORDER = ['football', 'basketball', 'track', 'baseball', 'wrestling', 'volleyball', 'nature'];

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function categoryLabel(cat) {
  if (!cat) return '';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

function photoImgSrc(photo) {
  // Most entries just point at assets/photos/<slug>.jpg. If a photo
  // was uploaded through the CMS's image widget it may carry an
  // explicit "image" path instead — prefer that when present.
  return photo.image || `assets/photos/${photo.slug}.jpg`;
}

function photoIdSlug(photo) {
  // Used for the #photo-<id> anchor/DOM id. Existing photos always
  // have a slug. A brand-new photo added through the CMS might not —
  // fall back to the uploaded filename (without extension) so the
  // page still works before anyone fills in a slug by hand.
  if (photo.slug) return photo.slug;
  if (photo.image) {
    const file = photo.image.split('/').pop() || '';
    return file.replace(/\.[a-zA-Z0-9]+$/, '') || 'photo';
  }
  return 'photo';
}

function renderBento(container, photos) {
  if (!container) return;
  const bySlot = {};
  photos.forEach((p) => {
    if (p.bentoSlot) bySlot[p.bentoSlot] = p;
  });
  const html = 'abcdefgh'
    .split('')
    .filter((slot) => bySlot[slot])
    .map((slot) => {
      const p = bySlot[slot];
      const cap = escapeHtml(p.caption);
      return `<a class="bento-item item-${slot}" href="#photo-${photoIdSlug(p)}" data-sport="${escapeHtml(p.category)}">
        <img src="${photoImgSrc(p)}" alt="${cap}">
        <span class="cap">${cap}</span>
      </a>`;
    })
    .join('\n');
  container.innerHTML = html;
}

function renderFilterTabs(container, photos) {
  if (!container) return;
  const present = [...new Set(photos.map((p) => p.category).filter(Boolean))];
  const ordered = CATEGORY_ORDER.filter((c) => present.includes(c)).concat(
    present.filter((c) => !CATEGORY_ORDER.includes(c)).sort()
  );
  const tabs = [`<button type="button" class="is-active" data-filter="all">All</button>`].concat(
    ordered.map((c) => `<button type="button" data-filter="${escapeHtml(c)}">${escapeHtml(categoryLabel(c))}</button>`)
  );
  container.innerHTML = tabs.join('\n');
}

function renderGallery(container, photos) {
  if (!container) return;
  container.innerHTML = photos
    .map((p) => {
      const cap = escapeHtml(p.caption);
      return `<button type="button" class="gallery-item" id="photo-${photoIdSlug(p)}" data-sport="${escapeHtml(p.category)}">
        <img src="${photoImgSrc(p)}" alt="${cap}" loading="lazy">
        <span class="cap">${cap}</span>
      </button>`;
    })
    .join('\n');
}

function renderAbout(root, about) {
  if (!about) return;
  const portrait = root.querySelector('#about-portrait');
  if (portrait && about.portrait) {
    portrait.setAttribute('src', about.portrait);
  }
  const heading = root.querySelector('#about-heading');
  if (heading && about.heading) {
    heading.textContent = about.heading;
  }
  const bioContainer = root.querySelector('#about-bio');
  if (bioContainer && Array.isArray(about.bio)) {
    bioContainer.innerHTML = about.bio.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n');
  }
}

function renderSettings(root, settings) {
  if (!settings) return;

  const igLink = root.querySelector('#footer-instagram');
  if (igLink && settings.instagramUrl) {
    igLink.setAttribute('href', settings.instagramUrl);
  }

  const copyright = root.querySelector('#footer-copyright');
  if (copyright && settings.footerText) {
    copyright.textContent = settings.footerText;
  }

  const emailLink = root.querySelector('#contact-email-link');
  if (emailLink && settings.contactEmail) {
    emailLink.setAttribute('href', `mailto:${settings.contactEmail}`);
    emailLink.textContent = settings.contactEmail;
  }

  const phoneLink = root.querySelector('#contact-phone-link');
  if (phoneLink && settings.contactPhoneHref) {
    phoneLink.setAttribute('href', `tel:${settings.contactPhoneHref}`);
    phoneLink.textContent = settings.contactPhoneDisplay || settings.contactPhoneHref;
  }

  const form = root.querySelector('#contact-form');
  if (form && settings.contactEmail) {
    form.setAttribute('action', `mailto:${settings.contactEmail}`);
  }
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  return res.json();
}

function wireNavToggle(root) {
  const toggle = root.querySelector('.nav-toggle');
  const navLinks = root.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function wireGalleryInteractions(root) {
  const tabs = root.querySelectorAll('.filter-tabs button');
  const items = root.querySelectorAll('.gallery-item');
  if (!tabs.length || !items.length) return;

  const applyFilter = (filter) => {
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.filter === filter));
    items.forEach((item) => {
      const show = filter === 'all' || item.dataset.sport === filter;
      item.hidden = !show;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
  });

  // Bento tiles jump straight to their photo, in its category: switch
  // the filter first (so the target isn't hidden) then scroll + flash.
  root.querySelectorAll('.bento-item[data-sport]').forEach((tile) => {
    tile.addEventListener('click', (e) => {
      const targetId = tile.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      applyFilter(tile.dataset.sport);

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('is-highlighted');
      window.setTimeout(() => target.classList.remove('is-highlighted'), 1600);

      history.replaceState(null, '', `#${targetId}`);
    });
  });

  // Lightbox
  const lightbox = root.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.setAttribute('src', img.getAttribute('src'));
        lightboxImg.setAttribute('alt', img.getAttribute('alt'));
        lightbox.hidden = false;
      });
    });

    const closeLightbox = () => { lightbox.hidden = true; };
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }
}

async function initPage() {
  const root = document;
  wireNavToggle(root);

  // Settings (Instagram link, footer text, contact info) apply on
  // every page that has the matching elements.
  try {
    const settings = await fetchJson('content/settings.json');
    renderSettings(root, settings);
  } catch (err) {
    console.error('[site] settings failed to load:', err);
  }

  const bentoContainer = root.querySelector('.bento-grid');
  const filterTabsContainer = root.querySelector('.filter-tabs');
  const galleryContainer = root.querySelector('.gallery-grid');

  if (bentoContainer || filterTabsContainer || galleryContainer) {
    try {
      const photoData = await fetchJson('assets/photos/meta.json');
      const photos = Array.isArray(photoData) ? photoData : (photoData.photos || []);
      renderBento(bentoContainer, photos);
      renderFilterTabs(filterTabsContainer, photos);
      renderGallery(galleryContainer, photos);
      wireGalleryInteractions(root);

      // If the page was opened with a #photo-slug link (e.g. shared
      // directly, or from another site), scroll to it once rendered.
      if (location.hash.startsWith('#photo-')) {
        const target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'center' });
      }
    } catch (err) {
      console.error('[site] photo gallery failed to load:', err);
      if (galleryContainer) {
        galleryContainer.innerHTML = '<p style="opacity:.6">Photos failed to load. Try refreshing the page.</p>';
      }
    }
  }

  const aboutRoot = root.querySelector('#about-bio, #about-portrait, #about-heading');
  if (aboutRoot) {
    try {
      const about = await fetchJson('content/about.json');
      renderAbout(root, about);
    } catch (err) {
      console.error('[site] about content failed to load:', err);
    }
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initPage);
}

// Expose the pure render functions for local testing in Node
// (see /content/README or the test script used during setup).
// Harmless in the browser: `module` doesn't exist there, so this
// whole block is skipped.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderBento, renderFilterTabs, renderGallery, renderAbout, renderSettings, categoryLabel, escapeHtml, photoIdSlug };
}
