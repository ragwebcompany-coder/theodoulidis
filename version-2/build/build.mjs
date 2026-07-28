// ============================================================
//  Specialized Women's Care — Version 2 (layout: drvenetis.com)
//  static site generator ·  Run:  node build/build.mjs
//  Content identical to Version 1 (build/data.mjs)
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, BIZ, DOCTORS, SERVICES, AREAS, POSTS } from "./data.mjs";
import { generateAssets } from "./assets.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, html) => {
  const full = resolve(ROOT, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html.trimStart() + "\n");
};

// depth-aware helpers -------------------------------------------------
const rel = (depth, p) => "../".repeat(depth) + p;
const abs = (p) => `${BASE}/${p}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(BIZ.mapQuery)}&output=embed`;
const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(BIZ.mapQuery)}`;

// article thumbnails, assigned round-robin to the generated placeholders
const postThumb = (slug) => {
  const i = POSTS.findIndex((p) => p.slug === slug);
  return `assets/post-${(i < 0 ? 0 : i % 6) + 1}.svg`;
};

// ---- structured data: the clinic ------------------------------------
const clinicLD = {
  "@type": ["MedicalClinic", "MedicalBusiness", "LocalBusiness"],
  "@id": `${BASE}/#clinic`,
  name: BIZ.name,
  alternateName: BIZ.legalName,
  slogan: BIZ.tagline,
  url: BASE + "/",
  telephone: BIZ.phoneIntl,
  email: BIZ.email,
  image: abs("assets/og-image.png"),
  logo: abs("assets/icon-512.png"),
  medicalSpecialty: ["Gynecologic", "Obstetric", "Urogynecology", "GynecologicOncology"],
  priceRange: "€€",
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: BIZ.street,
    addressLocality: BIZ.area,
    addressRegion: BIZ.city,
    postalCode: BIZ.postal,
    addressCountry: BIZ.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: BIZ.lat, longitude: BIZ.lng },
  hasMap: mapLink,
  areaServed: ["Θεσσαλονίκη", "Καλαμαριά", "Τούμπα", "Χαριλάου", "Πυλαία", "Πανόραμα", "Εύοσμος", "Κεντρική Μακεδονία"],
  availableService: SERVICES.map((s) => ({ "@type": "MedicalProcedure", name: s.h1 })),
  sameAs: [BIZ.facebook, BIZ.googleBusiness],
  employee: DOCTORS.map((d) => ({
    "@type": "Physician",
    name: d.name,
    jobTitle: `${d.role} — ${d.subrole}`,
  })),
};

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const breadcrumbLD = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: t.path ? abs(t.path) : undefined,
  })),
});

const faqLD = (faq) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

// ---- <head> ---------------------------------------------------------
function head({ depth, title, desc, canonical, keywords, ld = [], image = "assets/og-image.png", type = "website", bodyClass = "" }) {
  const r = (p) => rel(depth, p);
  const ldTags = ld.map(jsonLd).join("\n  ");
  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  ${keywords ? `<meta name="keywords" content="${attr(keywords)}" />` : ""}
  <meta name="author" content="${attr(BIZ.legalName)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#874f5e" />
  <link rel="canonical" href="${abs(canonical)}" />

  <meta property="og:site_name" content="${attr(BIZ.name)}" />
  <meta property="og:locale" content="el_GR" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:url" content="${abs(canonical)}" />
  <meta property="og:image" content="${abs(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />
  <meta name="twitter:image" content="${abs(image)}" />

  <link rel="icon" href="${r("favicon.ico")}" sizes="32x32" />
  <link rel="icon" type="image/png" href="${r("assets/favicon-32.png")}" sizes="32x32" />
  <link rel="icon" type="image/png" href="${r("assets/icon-512.png")}" sizes="512x512" />
  <link rel="apple-touch-icon" href="${r("assets/apple-touch-icon.png")}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${r("styles.css")}" />
  ${ldTags ? "\n  " + ldTags : ""}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ""}>`;
}

// ---- header (centred logo · centred nav · phone top-right) ----------
function header(depth, active = "") {
  const r = (p) => rel(depth, p);
  const on = (k) => (active === k ? ' class="current"' : "");
  const svcLinks = SERVICES.map(
    (s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a></li>`
  ).join("\n                ");
  const areaLinks = AREAS.map(
    (a) => `<li><a href="${r("perioches/" + a.slug + ".html")}">${esc(a.name)}</a></li>`
  ).join("\n                ");
  const docLinks = DOCTORS.map(
    (d) => `<li><a href="${r("oi-giatroi.html")}#${d.slug}">${esc(d.name)}</a></li>`
  ).join("\n                ");

  return `
  <a class="skip-link" href="#main">Μετάβαση στο περιεχόμενο</a>
  <header id="top">
    <div class="head-flex">
      <a href="${r("index.html")}" aria-label="${attr(BIZ.name)} — Αρχική">
        <figure class="head-logo">
          <img src="${r("assets/logo-emblem.png")}" alt="" class="logo-emblem" width="481" height="461" />
          <img src="${r("assets/logo-wordmark.png")}" alt="${attr(BIZ.name)}" class="logo-wordmark" width="489" height="66" />
        </figure>
      </a>
      <nav aria-label="Κύρια πλοήγηση">
        <button class="menu-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <line x1="10" y1="26" x2="90" y2="26" />
            <line x1="10" y1="50" x2="90" y2="50" />
            <line x1="10" y1="74" x2="90" y2="74" />
          </svg>
        </button>
        <div class="menu-container">
          <ul class="menu">
            <li class="menu-item has-children">
              <a href="${r("oi-giatroi.html")}"${on("about")}>ΟΙ ΙΑΤΡΟΙ</a>
              <ul class="sub-menu">
                ${docLinks}
                <li><a href="${r("oi-giatroi.html")}">Το Ιατρείο μας</a></li>
              </ul>
            </li>
            <li class="menu-item has-children">
              <a href="${r("ypiresies/index.html")}"${on("services")}>ΥΠΗΡΕΣΙΕΣ</a>
              <ul class="sub-menu">
                ${svcLinks}
              </ul>
            </li>
            <li class="menu-item has-children">
              <a href="${r("perioches/index.html")}"${on("areas")}>ΠΕΡΙΟΧΕΣ</a>
              <ul class="sub-menu">
                ${areaLinks}
              </ul>
            </li>
            <li class="menu-item"><a href="${r("blog/index.html")}"${on("blog")}>ΧΡΗΣΙΜΕΣ ΠΛΗΡΟΦΟΡΙΕΣ</a></li>
            <li class="menu-item"><a href="${r("epikoinonia.html")}"${on("contact")}>ΕΠΙΚΟΙΝΩΝΙΑ</a></li>
          </ul>
        </div>
      </nav>
    </div>
    <div class="head-phone">
      <span class="head-phone-icon" aria-hidden="true">✆</span>
      <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>
    </div>
  </header>`;
}

// ---- round "+" link (the reference's signature CTA) -----------------
const more = (href, label) =>
  `<p class="A-more"><a href="${href}" aria-label="${attr(label)}">+</a></p>`;

// ---- footer ---------------------------------------------------------
function footer(depth) {
  const r = (p) => rel(depth, p);
  return `
  <footer class="site-foot" id="colophon">
    <section class="foot-cols">
      <div class="foot-col">
        <a href="${r("index.html")}">
          <figure class="foot-logo">
            <img src="${r("assets/logo-emblem-light.png")}" alt="" class="logo-emblem" width="481" height="461" />
            <img src="${r("assets/logo-wordmark-light.png")}" alt="${attr(BIZ.name)}" class="logo-wordmark" width="489" height="66" />
          </figure>
        </a>
        <p class="foot-tag">${esc(BIZ.tagline)}</p>
      </div>

      <div class="foot-col">
        <h3>Επικοινωνία</h3>
        <p>${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.postal)}, ${esc(BIZ.city)}</p>
        <div><label>T:</label><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></div>
        <div><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></div>
        <p class="foot-emergency"><label>Επείγοντα:</label>${BIZ.emergency.map((e) => `<a href="tel:${e.intl}">${esc(e.display)}</a>`).join("")}</p>
        <p class="small">${esc(BIZ.note)}</p>
      </div>

      <div class="foot-col">
        <h3>Σχετικά</h3>
        <ul class="menu">
          <li><a href="${r("oi-giatroi.html")}">ΟΙ ΙΑΤΡΟΙ</a></li>
          <li><a href="${r("ypiresies/index.html")}">ΥΠΗΡΕΣΙΕΣ</a></li>
          <li><a href="${r("perioches/index.html")}">ΠΕΡΙΟΧΕΣ</a></li>
          <li><a href="${r("blog/index.html")}">ΧΡΗΣΙΜΕΣ ΠΛΗΡΟΦΟΡΙΕΣ</a></li>
          <li><a href="${r("epikoinonia.html")}">ΕΠΙΚΟΙΝΩΝΙΑ</a></li>
        </ul>
      </div>

      <div class="foot-col">
        <h3>Social Media</h3>
        <div class="foot-social">
          <a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
          <a href="${BIZ.googleBusiness}" target="_blank" rel="noopener noreferrer" aria-label="Google">Google</a>
        </div>
        <p class="small foot-copy">© <span id="year">2026</span> ${esc(BIZ.legalName)}<br />Με επιφύλαξη παντός δικαιώματος.</p>
      </div>
    </section>

    <section class="foot-created">
      <p class="cb-credit">Made by <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">CLINICBRAIN</a></p>
    </section>
  </footer>
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ---- breadcrumbs ----------------------------------------------------
function crumbs(depth, trail) {
  const r = (p) => rel(depth, p);
  const items = trail
    .map((t, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(t.name)}</span>`
        : `<a href="${r(t.rel)}">${esc(t.name)}</a><span class="sep">/</span>`
    )
    .join(" ");
  return `\n  <nav class="crumbs" aria-label="Breadcrumb">${items}</nav>`;
}

// ---- inner-page hero (title band) -----------------------------------
function pageHero(eyebrow, title, lead) {
  return `
    <section class="page-cover">
      <p class="page-eyebrow">${esc(eyebrow)}</p>
      <h1>${esc(title)}</h1>
      ${lead ? `<p class="page-lead">${esc(lead)}</p>` : ""}
    </section>`;
}

// ---- shared closing band --------------------------------------------
function ctaBand(depth) {
  const r = (p) => rel(depth, p);
  return `
  <section class="cta-band">
    <div class="cta-inner">
      <div>
        <p class="cta-eyebrow">Κλείστε το ραντεβού σας</p>
        <h2>Είμαστε δίπλα σας, σε κάθε βήμα.</h2>
        <p class="cta-sub">${esc(BIZ.note)} Επικοινωνήστε μαζί μας σήμερα.</p>
      </div>
      <div class="cta-actions">
        <a href="tel:${BIZ.phoneIntl}" class="btn">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
        <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία</a>
      </div>
    </div>
  </section>`;
}

// ---- article carousel (home-blog) -----------------------------------
function postsCarousel(depth, posts) {
  const r = (p) => rel(depth, p);
  const items = posts
    .map(
      (p) => `
            <div class="Aitem">
              <a href="${r("blog/" + p.slug + ".html")}">
                <div class="image"><img src="${r(postThumb(p.slug))}" alt="" loading="lazy" width="1200" height="900" /></div>
                <div class="text-box">
                  <h3>${esc(p.title)}</h3>
                  <div class="more" aria-hidden="true">+</div>
                </div>
              </a>
            </div>`
    )
    .join("");
  return `
      <div class="Aposts" data-navi="sides">
        <div class="Acontainer">
          <div class="Aitems">${items}
          </div>
        </div>
        <button class="Anavi Anavi-prev" type="button" aria-label="Προηγούμενα άρθρα">‹</button>
        <button class="Anavi Anavi-next" type="button" aria-label="Επόμενα άρθρα">›</button>
      </div>`;
}

// ====================================================================
//  PAGE: HOME  (section order mirrors drvenetis.com)
// ====================================================================
function pageHome() {
  const depth = 0;
  const r = (p) => rel(depth, p);

  // ---- home-icons: four highlighted specialities --------------------
  const bandItems = [
    ["gynaikologia", "icon-prolipsi.svg", "Προληπτικός γυναικολογικός έλεγχος"],
    ["gynaikologiki-ogkologia", "icon-ogkologia.svg", "Γυναικολογική Ογκολογία"],
    ["ourogynaikologia-pyeliko-edafos", "icon-ourogynaikologia.svg", "Ουρογυναικολογία & πυελικό έδαφος"],
    ["maieutiki", "icon-maieutiki.svg", "Παρακολούθηση εγκυμοσύνης"],
  ]
    .map(
      ([slug, icon, label], i) => `
      <div class="Acolumn Col${i + 1}">
        <a class="Apic" href="${r("ypiresies/" + slug + ".html")}" tabindex="-1" aria-hidden="true">
          <img src="${r("assets/" + icon)}" alt="" width="120" height="120" loading="lazy" />
        </a>
        <h3><a href="${r("ypiresies/" + slug + ".html")}">${esc(label)}</a></h3>
      </div>`
    )
    .join("");

  // ---- home-doc: one block per physician ----------------------------
  const docBlocks = DOCTORS.map((d, i) => {
    const surname = d.name.split(" ").slice(-1)[0];
    const first = d.name.replace(new RegExp(`\\s*${surname}$`), "");
    return `
    <div class="Acolumns home-doc${i ? " home-doc-rev" : ""} A-reveal">
      <div class="Acolumn Col1">
        <div class="doctor-c">
          <picture class="Apic">
            <img src="${r("assets/doc-" + d.slug.split("-")[0] + ".svg")}" alt="${attr(d.name)}, ${attr(d.role)} — ${attr(d.subrole)}" width="900" height="900" loading="lazy" />
          </picture>
          <span class="circle1" aria-hidden="true"></span>
          <span class="circle2" aria-hidden="true"></span>
        </div>
      </div>
      <div class="Acolumn Col2">
        <p class="doc-kicker">Γνωρίστε τον ιατρό</p>
        <h2>${esc(first)} <strong>${esc(surname)}</strong></h2>
        <p class="doc-role">${esc(d.role)} · ${esc(d.subrole)}</p>
        <p class="doc-short">${esc(d.short)}</p>
        ${more(r("oi-giatroi.html") + "#" + d.slug, "Βιογραφικό — " + d.name)}
      </div>
    </div>`;
  }).join("");

  const ld = [
    { "@context": "https://schema.org", ...clinicLD },
    { "@context": "https://schema.org", "@type": "WebSite", name: BIZ.name, url: BASE + "/", inLanguage: "el" },
    breadcrumbLD([{ name: "Αρχική", path: "index.html" }]),
  ];

  return head({
    depth,
    title: "Γυναικολόγος Θεσσαλονίκη | Specialized Women's Care — Δρ. Θεοδουλίδης",
    desc: "Specialized Women's Care — Δρ. Βασίλης & Δρ. Ιάκωβος Θεοδουλίδης, Μαιευτήρες Γυναικολόγοι στο κέντρο της Θεσσαλονίκης. Γυναικολογία, ουρογυναικολογία, γυναικολογική ογκολογία, ενδοσκοπική χειρουργική & μαιευτική. Κατόπιν ραντεβού.",
    canonical: "index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη, μαιευτήρας Θεσσαλονίκη, ουρογυναικολόγος, γυναικολόγος ογκολόγος, γυναικολογική ογκολογία, λαπαροσκόπηση, κολποσκόπηση, Θεοδουλίδης",
    ld,
    bodyClass: "home",
  }) +
    header(depth, "home") +
    `
  <main id="main" class="A-content A-home-content">

    <!-- ░░ cover ░░ -->
    <div class="Acolumns home-cover A-reveal">
      <div class="Acolumn Col1">
        <h1>Είσαι μοναδική. Το ίδιο και οι ανάγκες σου.</h1>
        <h2>Μαιευτήρες — Γυναικολόγοι,<br />εξειδικευμένη &amp; εξατομικευμένη φροντίδα</h2>
      </div>
      <div class="Acolumn Col2">
        <span class="line line-1" aria-hidden="true"></span>
        <span class="line line-2" aria-hidden="true"></span>
        <span class="circle-1" aria-hidden="true"></span>
        <picture class="Apic photo photo-1"><img src="${r("assets/hero-1.svg")}" alt="" width="900" height="900" /></picture>
        <picture class="Apic photo photo-2"><img src="${r("assets/hero-2.svg")}" alt="" width="900" height="900" /></picture>
        <picture class="Apic photo photo-3"><img src="${r("assets/hero-3.svg")}" alt="" width="900" height="900" /></picture>
      </div>
    </div>

    <!-- ░░ physicians ░░ -->${docBlocks}

    <!-- ░░ coloured icon band ░░ -->
    <div class="Acolumns home-icons">${bandItems}
    </div>

    <!-- ░░ speciality feature ░░ -->
    <div class="Acolumns home-A A-reveal">
      <div class="Acolumn Col1"><span class="circle" aria-hidden="true"></span></div>
      <div class="Acolumn Col2">
        <picture class="Apic"><img src="${r("assets/feature-1.svg")}" alt="" width="900" height="900" loading="lazy" /></picture>
      </div>
      <div class="Acolumn Col3">
        <h2>Εξειδικευμένη Φροντίδα</h2>
        <h3>Ολοκληρωμένη γυναικολογική &amp; μαιευτική κάλυψη</h3>
        <p>Οι <strong>Δρ. Βασίλης</strong> και <strong>Δρ. Ιάκωβος Θεοδουλίδης</strong> διαθέτουν ακαδημαϊκή κατάρτιση και διεθνείς εξειδικεύσεις στη <strong>Γυναικολογική Ογκολογία</strong>, την <strong>Ουρογυναικολογία</strong> και την <strong>ενδοσκοπική χειρουργική</strong>, δίπλα σε κάθε γυναίκα σε όλα τα στάδια της ζωής της.</p>
        ${more(r("ypiresies/index.html"), "Όλες οι υπηρεσίες")}
      </div>
      <div class="Acolumn Col4">
        <picture class="Apic"><img src="${r("assets/feature-2.svg")}" alt="" width="900" height="900" loading="lazy" /></picture>
      </div>
      <div class="Acolumn Col5"><span class="circle" aria-hidden="true"></span></div>
    </div>

    <!-- ░░ two circular entry points ░░ -->
    <h2 class="section-lead">Ενημερωθείτε για την <strong>Υγεία</strong> σας</h2>
    <div class="Acolumns home-B A-reveal">
      <div class="Acolumn Col1">
        <span class="gfx-3" aria-hidden="true"></span>
        <span class="gfx-4" aria-hidden="true"></span>
      </div>
      <div class="Acolumn Col2">
        <a class="Apic" href="${r("ypiresies/gynaikologia.html")}" tabindex="-1" aria-hidden="true">
          <img src="${r("assets/card-gynaikologia.svg")}" alt="" width="900" height="900" loading="lazy" />
        </a>
        <h3><a href="${r("ypiresies/gynaikologia.html")}">Γυναικολογία &amp; Πρόληψη</a></h3>
      </div>
      <div class="Acolumn Col3">
        <a class="Apic" href="${r("ypiresies/maieutiki.html")}" tabindex="-1" aria-hidden="true">
          <img src="${r("assets/card-maieutiki.svg")}" alt="" width="900" height="900" loading="lazy" />
        </a>
        <h3><a href="${r("ypiresies/maieutiki.html")}">Μαιευτική Φροντίδα</a></h3>
      </div>
    </div>

    <!-- ░░ articles ░░ -->
    <section class="home-blog">
      <div class="title-A">
        <h2>Άρθρα</h2>
        <div class="line" aria-hidden="true"></div>
        <p><a href="${r("blog/index.html")}">Διαβάστε όλα τα άρθρα</a></p>
      </div>${postsCarousel(depth, [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1)))}
    </section>

    <!-- ░░ areas ░░ -->
    <section class="home-areas">
      <div class="title-A">
        <h2>Περιοχές</h2>
        <div class="line" aria-hidden="true"></div>
        <p><a href="${r("perioches/index.html")}">Όλες οι περιοχές</a></p>
      </div>
      <div class="chips">
        ${AREAS.map((a) => `<a href="${r("perioches/" + a.slug + ".html")}">${esc(a.name)}</a>`).join("\n        ")}
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: THE PHYSICIANS
// ====================================================================
function pageAbout() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Οι Ιατροί", rel: "oi-giatroi.html", path: "oi-giatroi.html" },
  ];
  const ld = [
    breadcrumbLD(trail),
    ...DOCTORS.map((d) => ({
      "@context": "https://schema.org",
      "@type": "Physician",
      name: d.name,
      jobTitle: `${d.role} — ${d.subrole}`,
      image: abs(`assets/doc-${d.slug.split("-")[0]}.svg`),
      url: abs("oi-giatroi.html") + "#" + d.slug,
      worksFor: { "@id": `${BASE}/#clinic` },
      sameAs: [BIZ.facebook],
    })),
  ];

  const docSections = DOCTORS.map(
    (d, i) => `
    <div class="Acolumns home-doc doc-full${i ? " home-doc-rev" : ""} A-reveal" id="${d.slug}">
      <div class="Acolumn Col1">
        <div class="doctor-c">
          <picture class="Apic">
            <img src="${r("assets/doc-" + d.slug.split("-")[0] + ".svg")}" alt="${attr(d.name)}, ${attr(d.role)} — ${attr(d.subrole)}" width="900" height="900" loading="lazy" />
          </picture>
          <span class="circle1" aria-hidden="true"></span>
          <span class="circle2" aria-hidden="true"></span>
        </div>
      </div>
      <div class="Acolumn Col2">
        <p class="doc-kicker">${esc(d.badgeK)}</p>
        <h2>${esc(d.name)}</h2>
        <p class="doc-role">${esc(d.role)} · ${esc(d.subrole)}</p>
        ${d.bio.map((p) => `<p class="doc-bio">${esc(p)}</p>`).join("\n        ")}
        <div class="creds">
          ${d.creds.map(([k, v]) => `<div class="cred"><span class="cred-k">${esc(k)}</span><span class="cred-v">${esc(v)}</span></div>`).join("\n          ")}
        </div>
      </div>
    </div>`
  ).join("");

  return head({
    depth,
    title: "Οι Ιατροί — Δρ. Βασίλης & Δρ. Ιάκωβος Θεοδουλίδης | Specialized Women's Care",
    desc: "Γνωρίστε τους Δρ. Βασίλη Θεοδουλίδη (Γυναικολόγος Ογκολόγος) & Δρ. Ιάκωβο Θεοδουλίδη (Ουρογυναικολόγος), Μαιευτήρες — Γυναικολόγους στη Θεσσαλονίκη, με εξειδίκευση & ακαδημαϊκό έργο.",
    canonical: "oi-giatroi.html",
    keywords: "Βασίλης Θεοδουλίδης, Ιάκωβος Θεοδουλίδης, γυναικολόγος ογκολόγος Θεσσαλονίκη, ουρογυναικολόγος Θεσσαλονίκη, μαιευτήρας",
    ld,
    type: "profile",
  }) +
    header(depth, "about") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Οι Ιατροί", "Εξειδίκευση, εμπειρία & ανθρώπινη φροντίδα", "Δύο Μαιευτήρες — Γυναικολόγοι με ακαδημαϊκή κατάρτιση, διεθνείς εξειδικεύσεις και κοινή φιλοσοφία: την εξατομικευμένη φροντίδα κάθε γυναίκας.")}
${docSections}
    <section class="quote-band">
      <blockquote>Στεκόμαστε δίπλα σε κάθε γυναίκα με <em>επιστημονική αρτιότητα</em>, ανθρώπινη ζεστασιά και απόλυτο σεβασμό — για ασφάλεια, αποτελεσματικότητα και ποιότητα ζωής.</blockquote>
      <cite>${esc(BIZ.name)} · ${esc(BIZ.city)}</cite>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICES HUB
// ====================================================================
function pageServicesHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
  ];
  const cards = SERVICES.map(
    (s) => `
        <div class="Aitem">
          <a href="${r("ypiresies/" + s.slug + ".html")}">
            <div class="tile" aria-hidden="true"><span>${s.icon}</span></div>
            <div class="text-box">
              <h2>${esc(s.h1)}</h2>
              <p class="text">${esc(s.lead)}</p>
              <div class="more" aria-hidden="true">+</div>
            </div>
          </a>
        </div>`
  ).join("");
  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.h1,
        url: abs("ypiresies/" + s.slug + ".html"),
      })),
    },
  ];
  return head({
    depth,
    title: "Υπηρεσίες Γυναικολογίας & Μαιευτικής | Specialized Women's Care, Θεσσαλονίκη",
    desc: "Όλες οι υπηρεσίες: γυναικολογία, κολποσκόπηση & παθολογία τραχήλου, ουρογυναικολογία, γυναικολογική ογκολογία, λαπαροσκόπηση & υστεροσκόπηση, μαιευτική και κοσμητική γυναικολογία στη Θεσσαλονίκη.",
    canonical: "ypiresies/index.html",
    keywords: "υπηρεσίες γυναικολόγου, γυναικολογία, ουρογυναικολογία, γυναικολογική ογκολογία, λαπαροσκόπηση, μαιευτική, κοσμητική γυναικολογία Θεσσαλονίκη",
    ld,
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Υπηρεσίες", "Ολοκληρωμένη γυναικολογική & μαιευτική φροντίδα", "Από την πρόληψη και τη διάγνωση μέχρι την εξειδικευμένη χειρουργική και τη μαιευτική παρακολούθηση — ολόκληρο το φάσμα της γυναικείας υγείας.")}
    <div class="page-grid">${cards}
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICE DETAIL
// ====================================================================
function pageService(s, idx) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
    { name: s.nav, rel: "ypiresies/" + s.slug + ".html", path: "ypiresies/" + s.slug + ".html" },
  ];
  const related = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 4);
  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      name: s.h1,
      description: s.desc,
      url: abs("ypiresies/" + s.slug + ".html"),
      provider: { "@id": `${BASE}/#clinic` },
    },
    faqLD(s.faq),
  ];
  return head({
    depth,
    title: s.title,
    desc: s.desc,
    canonical: "ypiresies/" + s.slug + ".html",
    keywords: s.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    <section class="page-cover page-cover-svc">
      <span class="cover-glyph" aria-hidden="true">${s.icon}</span>
      <p class="page-eyebrow">Υπηρεσία ${String(idx + 1).padStart(2, "0")}</p>
      <h1>${esc(s.h1)}</h1>
      <p class="page-lead">${esc(s.lead)}</p>
    </section>

    <div class="detail">
      <article class="detail-body">
        ${s.body.map((p) => `<p>${esc(p)}</p>`).join("\n        ")}

        <h2>Τι περιλαμβάνει</h2>
        <ul class="ticks">
          ${s.includes.map((i) => `<li>${esc(i)}</li>`).join("\n          ")}
        </ul>

        <h2>Συχνές ερωτήσεις</h2>
        <div class="faq">
          ${s.faq.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n          ")}
        </div>
      </article>

      <aside class="detail-aside">
        <div class="aside-card">
          <h3>Κλείστε ραντεβού</h3>
          <p>${esc(BIZ.note)} Επικοινωνήστε για να σας εξυπηρετήσουμε.</p>
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-block">${esc(BIZ.phoneDisplay)}</a>
          <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">Email</a>
          <p class="aside-meta">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
        </div>
        <div class="aside-card">
          <h3>Άλλες υπηρεσίες</h3>
          <nav class="aside-links">
            ${related.map((x) => `<a href="${r("ypiresies/" + x.slug + ".html")}">${esc(x.nav)}</a>`).join("\n            ")}
          </nav>
        </div>
      </aside>
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: AREAS HUB
// ====================================================================
function pageAreasHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
  ];
  const cards = AREAS.map(
    (a) => `
        <div class="Aitem">
          <a href="${r("perioches/" + a.slug + ".html")}">
            <div class="text-box">
              <h2>${esc(a.name)}</h2>
              <p class="text">${esc(a.blurb)}</p>
              <div class="more" aria-hidden="true">+</div>
            </div>
          </a>
        </div>`
  ).join("");
  return head({
    depth,
    title: "Περιοχές που Εξυπηρετούμε — Θεσσαλονίκη | Specialized Women's Care",
    desc: "Με έδρα την Τσιμισκή 34, εξυπηρετούμε γυναίκες από όλη τη Θεσσαλονίκη: κέντρο, Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Πανόραμα & Εύοσμο. Γυναικολογική & μαιευτική φροντίδα κοντά σας.",
    canonical: "perioches/index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη περιοχές, γυναικολόγος Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Εύοσμος",
    ld: [breadcrumbLD(trail)],
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Περιοχές", "Κοντά σας, σε όλη τη Θεσσαλονίκη", "Με έδρα το κέντρο της Θεσσαλονίκης (Τσιμισκή 34), εξυπηρετούμε γυναίκες από όλη την πόλη και την ευρύτερη περιοχή.")}
    <div class="page-grid page-grid-text">${cards}
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: AREA DETAIL
// ====================================================================
function pageArea(a) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
    { name: a.name, rel: "perioches/" + a.slug + ".html", path: "perioches/" + a.slug + ".html" },
  ];
  const localFaq = [
    [`Πού βρίσκεται το ιατρείο;`, `Το ιατρείο μας βρίσκεται στη ${BIZ.street} (${BIZ.floor}), στο κέντρο της ${BIZ.city}, Τ.Κ. ${BIZ.postal}, με εύκολη πρόσβαση από ${a.name}.`],
    [`Πώς κλείνω ραντεβού;`, `Καλέστε στο ${BIZ.phoneDisplay} ή στείλτε email στο ${BIZ.email}. Λειτουργούμε κατόπιν ραντεβού.`],
    [`Ποιες υπηρεσίες προσφέρετε;`, `Προσφέρουμε πλήρες φάσμα: γυναικολογία, κολποσκόπηση & παθολογία τραχήλου, ουρογυναικολογία, γυναικολογική ογκολογία, λαπαροσκόπηση & υστεροσκόπηση, μαιευτική και κοσμητική γυναικολογία.`],
  ];
  const ld = [
    breadcrumbLD(trail),
    { "@context": "https://schema.org", ...clinicLD, areaServed: a.name },
    faqLD(localFaq),
  ];
  return head({
    depth,
    title: a.title,
    desc: a.desc,
    canonical: "perioches/" + a.slug + ".html",
    keywords: a.keywords,
    ld,
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Περιοχή εξυπηρέτησης", a.h1, a.blurb)}

    <div class="detail">
      <article class="detail-body">
        <h2>Οι υπηρεσίες μας για γυναίκες από ${esc(a.name)}</h2>
        <ul class="ticks two-col">
          ${SERVICES.map((s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.h1)}</a></li>`).join("\n          ")}
        </ul>

        <h2>Συχνές ερωτήσεις</h2>
        <div class="faq">
          ${localFaq.map(([q, ans]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join("\n          ")}
        </div>
      </article>
      <aside class="detail-aside">
        <div class="aside-card">
          <h3>Στοιχεία επικοινωνίας</h3>
          <p class="aside-meta">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-block">${esc(BIZ.phoneDisplay)}</a>
          <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">Email</a>
          <p class="aside-meta">${esc(BIZ.note)}</p>
        </div>
      </aside>
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG HUB
// ====================================================================
function pageBlogHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Χρήσιμες Πληροφορίες", rel: "blog/index.html", path: "blog/index.html" },
  ];
  const posts = [...POSTS].sort((x, y) => (x.date < y.date ? 1 : -1));
  const cards = posts.map(
    (p) => `
        <div class="Aitem">
          <a href="${r("blog/" + p.slug + ".html")}">
            <div class="image"><img src="${r(postThumb(p.slug))}" alt="" loading="lazy" width="1200" height="900" /></div>
            <div class="text-box">
              <span class="post-cat">${esc(p.cat)}</span>
              <h2>${esc(p.title)}</h2>
              <p class="text">${esc(p.excerpt)}</p>
              <time datetime="${p.date}">${fmtDate(p.date)}</time>
              <div class="more" aria-hidden="true">+</div>
            </div>
          </a>
        </div>`
  ).join("");
  const ld = [
    breadcrumbLD(trail),
    { "@context": "https://schema.org", "@type": "Blog", name: BIZ.name + " — Blog", url: abs("blog/index.html"), inLanguage: "el" },
  ];
  return head({
    depth,
    title: "Άρθρα & Χρήσιμες Πληροφορίες | Specialized Women's Care",
    desc: "Άρθρα & οδηγοί για τη γυναικεία υγεία: προληπτικός έλεγχος, τεστ Παπ & HPV, ουρογυναικολογία, ενδομητρίωση, εγκυμοσύνη και εμμηνόπαυση.",
    canonical: "blog/index.html",
    keywords: "blog γυναικολογίας, γυναικεία υγεία, πρόληψη, εγκυμοσύνη, εμμηνόπαυση",
    ld,
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Άρθρα", "Ενημέρωση για τη γυναικεία υγεία", "Χρήσιμοι οδηγοί και απαντήσεις σε συχνές ερωτήσεις, από τους ιατρούς μας.")}
    <div class="page-grid">${cards}
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG POST
// ====================================================================
function pagePost(p) {
  const depth = 1;
  const r = (pp) => rel(depth, pp);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Χρήσιμες Πληροφορίες", rel: "blog/index.html", path: "blog/index.html" },
    { name: p.title, rel: "blog/" + p.slug + ".html", path: "blog/" + p.slug + ".html" },
  ];
  const relatedSvc = SERVICES.find((s) => s.slug === p.related);
  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const ld = [
    breadcrumbLD(trail),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.desc,
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: "el",
      image: abs("assets/og-image.png"),
      mainEntityOfPage: abs("blog/" + p.slug + ".html"),
      author: { "@type": "Organization", name: BIZ.name },
      publisher: { "@id": `${BASE}/#clinic` },
    },
    faqLD(p.faq),
  ];
  const bodyHtml = p.body
    .map(([h, t]) => (h ? `<h2>${esc(h)}</h2>\n        <p>${esc(t)}</p>` : `<p class="lead-p">${esc(t)}</p>`))
    .join("\n        ");
  return head({
    depth,
    title: p.metaTitle,
    desc: p.desc,
    canonical: "blog/" + p.slug + ".html",
    keywords: p.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    <section class="page-cover page-cover-post">
      <p class="page-eyebrow">${esc(p.cat)}</p>
      <h1>${esc(p.title)}</h1>
      <p class="page-meta"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(BIZ.name)}</p>
    </section>

    <div class="detail">
      <article class="detail-body">
        ${bodyHtml}

        <h2>Συχνές ερωτήσεις</h2>
        <div class="faq">
          ${p.faq.map(([q, a]) => `<details class="faq-item"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n          ")}
        </div>

        ${relatedSvc ? `<div class="inline-cta">
          <p>Σχετική υπηρεσία: <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}"><strong>${esc(relatedSvc.h1)}</strong></a>. Κλείστε ραντεβού στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>.</p>
        </div>` : ""}

        <p class="disclaimer">Το παρόν άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη ιατρική συμβουλή. Για την περίπτωσή σας, συμβουλευτείτε τον ιατρό σας.</p>
      </article>
      <aside class="detail-aside">
        <div class="aside-card">
          <h3>Διαβάστε επίσης</h3>
          <nav class="aside-links">
            ${others.map((o) => `<a href="${r("blog/" + o.slug + ".html")}">${esc(o.title)}</a>`).join("\n            ")}
          </nav>
        </div>
      </aside>
    </div>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: CONTACT
// ====================================================================
function pageContact() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Επικοινωνία", rel: "epikoinonia.html", path: "epikoinonia.html" },
  ];
  const ld = [breadcrumbLD(trail), { "@context": "https://schema.org", ...clinicLD }];
  const emergencyLinks = BIZ.emergency.map((e) => `<a href="tel:${e.intl}">${esc(e.display)}</a>`).join(" · ");
  return head({
    depth,
    title: "Επικοινωνία & Ραντεβού | Specialized Women's Care — Θεσσαλονίκη",
    desc: `Επικοινωνήστε με το ιατρείο μας. ${BIZ.street}, ${BIZ.floor}, ${BIZ.city} ${BIZ.postal}. Τηλ. ${BIZ.phoneDisplay}, ${BIZ.email}. Φόρμα επικοινωνίας & χάρτης. Λειτουργία κατόπιν ραντεβού.`,
    canonical: "epikoinonia.html",
    keywords: "επικοινωνία γυναικολόγος Θεσσαλονίκη, ραντεβού γυναικολόγος, τηλέφωνο ιατρείου Τσιμισκή",
    ld,
  }) +
    header(depth, "contact") +
    crumbs(depth, trail) +
    `
  <main id="main" class="A-content A-page-content">
    ${pageHero("Επικοινωνία", "Κλείστε το ραντεβού σας", BIZ.note + " Συμπληρώστε τη φόρμα ή επικοινωνήστε μαζί μας — θα σας απαντήσουμε το συντομότερο.")}

    <div class="emergency-band">
      <span aria-hidden="true">✚</span>
      <p>Για <strong>επείγοντα περιστατικά</strong> καλέστε μας στο: ${emergencyLinks}</p>
    </div>

    <div class="contact-grid">
      <div class="contact-copy">
        <ul class="contact-list">
          <li><span class="k">Διεύθυνση</span><span class="v">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}</span></li>
          <li><span class="k">Τηλέφωνο</span><span class="v"><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></span></li>
          <li><span class="k">Επείγοντα</span><span class="v">${emergencyLinks}</span></li>
          <li><span class="k">Email</span><span class="v"><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></span></li>
          <li><span class="k">Social</span><span class="v"><a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="${BIZ.googleBusiness}" target="_blank" rel="noopener noreferrer">Google</a></span></li>
        </ul>
      </div>

      <div class="contact-form-wrap">
        <form class="contact-form" action="https://formsubmit.co/${BIZ.email}" method="POST">
          <input type="hidden" name="_subject" value="Νέο μήνυμα από την ιστοσελίδα — Specialized Women's Care" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_next" value="${abs("epikoinonia.html")}?sent=1" />
          <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
          <p class="form-msg" id="formMsg" role="status"></p>
          <label>Ονοματεπώνυμο
            <input type="text" name="Ονοματεπώνυμο" required autocomplete="name" />
          </label>
          <div class="form-grid">
            <label>Τηλέφωνο
              <input type="tel" name="Τηλέφωνο" autocomplete="tel" />
            </label>
            <label>Email
              <input type="email" name="Email" required autocomplete="email" />
            </label>
          </div>
          <label>Θέμα
            <input type="text" name="Θέμα" />
          </label>
          <label>Μήνυμα
            <textarea name="Μήνυμα" rows="5" required></textarea>
          </label>
          <label class="form-consent">
            <input type="checkbox" required />
            <span>Συναινώ στην επεξεργασία των στοιχείων μου για την επικοινωνία μαζί μου.</span>
          </label>
          <button type="submit" class="btn btn-block">Αποστολή Μηνύματος</button>
          <p class="form-fallback">ή καλέστε στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></p>
        </form>
      </div>
    </div>

    <div class="contact-map">
      <iframe title="Χάρτης — ${attr(BIZ.street + ", " + BIZ.city)}" src="${mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
    </div>
  </main>` +
    footer(depth);
}

// ---- utils ----------------------------------------------------------
function fmtDate(iso) {
  const months = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

// ====================================================================
//  SITEMAP + ROBOTS
// ====================================================================
function buildSitemap() {
  const urls = [
    { loc: "index.html", pr: "1.0", cf: "weekly" },
    { loc: "oi-giatroi.html", pr: "0.8", cf: "monthly" },
    { loc: "ypiresies/index.html", pr: "0.9", cf: "monthly" },
    ...SERVICES.map((s) => ({ loc: "ypiresies/" + s.slug + ".html", pr: "0.9", cf: "monthly" })),
    { loc: "perioches/index.html", pr: "0.7", cf: "monthly" },
    ...AREAS.map((a) => ({ loc: "perioches/" + a.slug + ".html", pr: "0.7", cf: "monthly" })),
    { loc: "blog/index.html", pr: "0.7", cf: "weekly" },
    ...POSTS.map((p) => ({ loc: "blog/" + p.slug + ".html", pr: "0.6", cf: "monthly", lm: p.date })),
    { loc: "epikoinonia.html", pr: "0.8", cf: "yearly" },
  ];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map((u) => `  <url><loc>${abs(u.loc)}</loc><lastmod>${u.lm || today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const buildRobots = () => `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;

// ====================================================================
//  RUN
// ====================================================================
generateAssets();

let n = 0;
const write = (p, html) => { out(p, html); n++; };

write("index.html", pageHome());
write("oi-giatroi.html", pageAbout());
write("epikoinonia.html", pageContact());
write("ypiresies/index.html", pageServicesHub());
SERVICES.forEach((s, i) => write("ypiresies/" + s.slug + ".html", pageService(s, i)));
write("perioches/index.html", pageAreasHub());
AREAS.forEach((a) => write("perioches/" + a.slug + ".html", pageArea(a)));
write("blog/index.html", pageBlogHub());
POSTS.forEach((p) => write("blog/" + p.slug + ".html", pagePost(p)));
out("sitemap.xml", buildSitemap());
out("robots.txt", buildRobots());

console.log(`✓ Version 2 — generated ${n} HTML pages + placeholder assets + sitemap.xml + robots.txt`);
