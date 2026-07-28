// ============================================================
//  Specialized Women's Care — static site generator
//  Run:  node build/build.mjs
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, BIZ, DOCTORS, SERVICES, AREAS, POSTS } from "./data.mjs";

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

// ---- structured data: the clinic (MedicalClinic / LocalBusiness) -----
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

const breadcrumbLD = (depth, trail) => ({
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
function head({ depth, title, desc, canonical, keywords, ld = [], image = "assets/og-image.png", type = "website" }) {
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
  <meta name="theme-color" content="#eeeef1" />
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
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${r("styles.css")}" />
  ${ldTags ? "\n  " + ldTags : ""}
</head>
<body>`;
}

// ---- header ---------------------------------------------------------
function header(depth, active = "") {
  const r = (p) => rel(depth, p);
  const on = (k) => (active === k ? ' aria-current="page"' : "");
  const svcLinks = SERVICES.map(
    (s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a></li>`
  ).join("\n            ");
  return `
  <a class="skip-link" href="#main">Μετάβαση στο περιεχόμενο</a>
  <header class="site-header" id="top">
    <nav class="nav container" aria-label="Κύρια πλοήγηση">
      <a href="${r("index.html")}" class="brand" aria-label="${attr(BIZ.name)} — Αρχική">
        <img src="${r("assets/logo-emblem.png")}" alt="" class="brand-emblem" width="481" height="461" />
        <span class="brand-lockup">
          <img src="${r("assets/logo-wordmark.png")}" alt="${attr(BIZ.name)}" class="brand-wordmark" width="489" height="66" />
          <span class="brand-sub">Μαιευτική · Γυναικολογία</span>
        </span>
      </a>
      <button class="nav-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="${r("index.html")}"${on("home")}>Αρχική</a></li>
        <li><a href="${r("oi-giatroi.html")}"${on("about")}>Οι Ιατροί</a></li>
        <li class="has-sub">
          <a href="${r("ypiresies/index.html")}"${on("services")}>Υπηρεσίες</a>
          <ul class="sub">
            ${svcLinks}
          </ul>
        </li>
        <li><a href="${r("perioches/index.html")}"${on("areas")}>Περιοχές</a></li>
        <li><a href="${r("blog/index.html")}"${on("blog")}>Blog</a></li>
        <li><a href="${r("epikoinonia.html")}"${on("contact")}>Επικοινωνία</a></li>
        <li><a href="${r("epikoinonia.html")}" class="btn btn-nav">Ραντεβού</a></li>
      </ul>
    </nav>
  </header>`;
}

// ---- breadcrumb visual ---------------------------------------------
function crumbs(depth, trail) {
  const r = (p) => rel(depth, p);
  const items = trail
    .map((t, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(t.name)}</span>`
        : `<a href="${r(t.rel)}">${esc(t.name)}</a><span class="sep">/</span>`
    )
    .join(" ");
  return `<nav class="crumbs container" aria-label="Breadcrumb">${items}</nav>`;
}

// ---- CTA band -------------------------------------------------------
function ctaBand(depth) {
  const r = (p) => rel(depth, p);
  return `
  <section class="cta-band">
    <div class="container cta-inner">
      <div>
        <p class="eyebrow">Κλείστε το ραντεβού σας</p>
        <h2 class="cta-title">Είμαστε δίπλα σας, σε κάθε βήμα.</h2>
        <p class="cta-sub">Λειτουργούμε κατόπιν ραντεβού — επικοινωνήστε μαζί μας σήμερα.</p>
      </div>
      <div class="cta-actions">
        <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
        <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία</a>
      </div>
    </div>
  </section>`;
}

// ---- footer ---------------------------------------------------------
function footer(depth) {
  const r = (p) => rel(depth, p);
  const svcCols = SERVICES.map(
    (s) => `<a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a>`
  ).join("\n          ");
  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">
          <img src="${r("assets/logo-emblem-light.png")}" alt="" class="footer-emblem" width="481" height="461" />
          <img src="${r("assets/logo-wordmark-light.png")}" alt="${attr(BIZ.name)}" class="footer-wordmark" width="489" height="66" />
        </span>
        <p class="footer-tag">${esc(BIZ.tagline)}</p>
        <p class="footer-addr">
          ${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />
          ${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}
        </p>
        <div class="footer-social">
          <a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
          <a href="${BIZ.googleBusiness}" target="_blank" rel="noopener noreferrer" aria-label="Google">Google</a>
        </div>
      </div>

      <div class="footer-col">
        <h3>Υπηρεσίες</h3>
        <nav aria-label="Υπηρεσίες" class="footer-links">
          ${svcCols}
        </nav>
      </div>

      <div class="footer-col">
        <h3>Εξερεύνηση</h3>
        <nav aria-label="Πλοήγηση" class="footer-links">
          <a href="${r("index.html")}">Αρχική</a>
          <a href="${r("oi-giatroi.html")}">Οι Ιατροί</a>
          <a href="${r("ypiresies/index.html")}">Όλες οι Υπηρεσίες</a>
          <a href="${r("perioches/index.html")}">Περιοχές που Εξυπηρετούμε</a>
          <a href="${r("blog/index.html")}">Blog</a>
          <a href="${r("epikoinonia.html")}">Επικοινωνία</a>
        </nav>
      </div>

      <div class="footer-col">
        <h3>Επικοινωνία</h3>
        <nav aria-label="Επικοινωνία" class="footer-links">
          <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>
          <a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a>
        </nav>
        <p class="footer-hours"><strong>Επείγοντα:</strong><br />${BIZ.emergency.map((e) => `<a href="tel:${e.intl}">${esc(e.display)}</a>`).join(" · ")}</p>
        <p class="footer-hours">${esc(BIZ.note)}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">© <span id="year">2026</span> ${esc(BIZ.legalName)}. Με επιφύλαξη παντός δικαιώματος.</p>
      <p class="cb-credit">Made by <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">CLINICBRAIN</a></p>
    </div>
  </footer>
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ---- doctors block (shared) ----------------------------------------
function doctorsCards(depth) {
  const r = (p) => rel(depth, p);
  return DOCTORS.map(
    (d) => `
        <article class="doc-card reveal">
          <div class="doc-media">
            <img src="${r(d.photo)}" alt="${attr(d.name)}, ${attr(d.role)} — ${attr(d.subrole)}" width="900" height="1050" />
            <span class="doc-badge"><span class="doc-badge-k">${esc(d.badgeK)}</span></span>
          </div>
          <div class="doc-info">
            <h3>${esc(d.name)}</h3>
            <p class="doc-role">${esc(d.role)}</p>
            <p class="doc-sub">${esc(d.subrole)}</p>
            <p class="doc-short">${esc(d.short)}</p>
            <a href="${r("oi-giatroi.html")}#${d.slug}" class="btn btn-ghost">Βιογραφικό →</a>
          </div>
        </article>`
  ).join("");
}

// ====================================================================
//  PAGE: HOME
// ====================================================================
function pageHome() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const svcCards = SERVICES.map(
    (s, i) => `
        <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
          <span class="svc-icon" aria-hidden="true">${s.icon}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(s.h1)}</h3>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Μάθετε περισσότερα →</span>
        </a>`
  ).join("");

  const ld = [
    { "@context": "https://schema.org", ...clinicLD },
    { "@context": "https://schema.org", "@type": "WebSite", name: BIZ.name, url: BASE + "/", inLanguage: "el" },
    breadcrumbLD(depth, [{ name: "Αρχική", path: "index.html" }]),
  ];

  return head({
    depth,
    title: "Γυναικολόγος Θεσσαλονίκη | Specialized Women's Care — Δρ. Θεοδουλίδης",
    desc: "Specialized Women's Care — Δρ. Βασίλης & Δρ. Ιάκωβος Θεοδουλίδης, Μαιευτήρες Γυναικολόγοι στο κέντρο της Θεσσαλονίκης. Γυναικολογία, ουρογυναικολογία, γυναικολογική ογκολογία, ενδοσκοπική χειρουργική & μαιευτική. Κατόπιν ραντεβού.",
    canonical: "index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη, μαιευτήρας Θεσσαλονίκη, ουρογυναικολόγος, γυναικολόγος ογκολόγος, γυναικολογική ογκολογία, λαπαροσκόπηση, κολποσκόπηση, Θεοδουλίδης",
    ld,
  }) +
    header(depth, "home") +
    `
  <main id="main">
    <section class="hero" id="hero">
      <div class="hero-inner container">
        <p class="eyebrow reveal">Μαιευτήρες — Γυναικολόγοι · Θεσσαλονίκη</p>
        <h1 class="hero-title reveal">Είσαι μοναδική.<br />Το ίδιο και οι <em>ανάγκες σου.</em></h1>
        <p class="hero-lead reveal">${esc(BIZ.intro)}</p>
        <div class="hero-actions reveal">
          <a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a>
          <a href="${r("ypiresies/index.html")}" class="btn btn-ghost">Οι Υπηρεσίες μας</a>
        </div>
      </div>
      <div class="hero-scroll" aria-hidden="true"><span></span></div>
    </section>

    <div class="strip" aria-hidden="true">
      <div class="strip-track">
        <span>Γυναικολογία</span><span class="dot">•</span>
        <span>Ουρογυναικολογία</span><span class="dot">•</span>
        <span>Γυναικολογική Ογκολογία</span><span class="dot">•</span>
        <span>Ενδοσκοπική Χειρουργική</span><span class="dot">•</span>
        <span>Μαιευτική Φροντίδα</span><span class="dot">•</span>
        <span>Γυναικολογία</span><span class="dot">•</span>
        <span>Ουρογυναικολογία</span><span class="dot">•</span>
        <span>Γυναικολογική Ογκολογία</span><span class="dot">•</span>
        <span>Ενδοσκοπική Χειρουργική</span><span class="dot">•</span>
        <span>Μαιευτική Φροντίδα</span><span class="dot">•</span>
      </div>
    </div>

    <section class="doctors" id="doctors">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Οι Ιατροί</p>
          <h2 class="section-title">Δύο εξειδικευμένοι ιατροί,<br />μία ολοκληρωμένη φροντίδα</h2>
        </div>
        <div class="doctors-grid">${doctorsCards(depth)}
        </div>
      </div>
    </section>

    <section class="services" id="services">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Υπηρεσίες</p>
          <h2 class="section-title">Ολοκληρωμένη γυναικολογική<br />&amp; μαιευτική φροντίδα</h2>
        </div>
        <div class="services-grid">${svcCards}
        </div>
      </div>
    </section>

    <section class="philosophy" id="philosophy">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow">Η Φιλοσοφία μας</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Στεκόμαστε δίπλα σε κάθε γυναίκα με <em>επιστημονική αρτιότητα</em>, ανθρώπινη ζεστασιά και απόλυτο σεβασμό — για ασφάλεια, αποτελεσματικότητα και ποιότητα ζωής.</blockquote>
        <cite class="philosophy-cite">Specialized Women's Care · Θεσσαλονίκη</cite>
      </div>
    </section>

    <section class="areas-teaser">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Περιοχές</p>
          <h2 class="section-title">Εξυπηρετούμε όλη τη Θεσσαλονίκη</h2>
        </div>
        <div class="chips reveal">
          ${AREAS.map((a) => `<a href="${r("perioches/" + a.slug + ".html")}" class="chip">${esc(a.name)}</a>`).join("\n          ")}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: ABOUT (two doctors)
// ====================================================================
function pageAbout() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Οι Ιατροί", rel: "oi-giatroi.html", path: "oi-giatroi.html" },
  ];
  const ld = [
    breadcrumbLD(depth, trail),
    ...DOCTORS.map((d) => ({
      "@context": "https://schema.org",
      "@type": "Physician",
      name: d.name,
      jobTitle: `${d.role} — ${d.subrole}`,
      image: abs(d.photo),
      url: abs("oi-giatroi.html") + "#" + d.slug,
      worksFor: { "@id": `${BASE}/#clinic` },
      sameAs: [BIZ.facebook],
    })),
  ];
  const docSections = DOCTORS.map(
    (d, i) => `
    <section class="about about-page${i % 2 ? " about-alt" : ""}" id="${d.slug}">
      <div class="container about-grid${i % 2 ? " about-grid--rev" : ""}">
        <div class="about-media reveal">
          <img src="${r(d.photo)}" alt="${attr(d.name)}, ${attr(d.role)} — ${attr(d.subrole)}" width="900" height="1050" />
          <div class="about-badge"><span class="about-badge-num">${esc(d.badgeK)}</span><span class="about-badge-label">${d.badgeV}</span></div>
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">${i === 0 ? "Ο Ιατρός" : "Ο Ιατρός"}</p>
          <h2 class="section-title reveal">${esc(d.name)}</h2>
          <p class="about-role reveal">${esc(d.role)} · ${esc(d.subrole)}</p>
          ${d.bio.map((p) => `<p class="reveal">${esc(p)}</p>`).join("\n          ")}
          <div class="creds-grid reveal">
            ${d.creds.map(([k, v]) => `<div class="cred"><span class="cred-k">${esc(k)}</span><span class="cred-v">${esc(v)}</span></div>`).join("\n            ")}
          </div>
        </div>
      </div>
    </section>`
  ).join("\n");

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
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Οι Ιατροί</p>
        <h1 class="page-title reveal">Εξειδίκευση, εμπειρία &amp; ανθρώπινη φροντίδα</h1>
        <p class="page-lead reveal">Δύο Μαιευτήρες — Γυναικολόγοι με ακαδημαϊκή κατάρτιση, διεθνείς εξειδικεύσεις και κοινή φιλοσοφία: την εξατομικευμένη φροντίδα κάθε γυναίκας.</p>
      </div>
    </section>
${docSections}
    <section class="philosophy">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow">Η Φιλοσοφία μας</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Επιστημονική εξειδίκευση, καινοτόμες μέθοδοι και απόλυτος σεβασμός στην κάθε γυναίκα — <em>μαζί σε όλο το ταξίδι.</em></blockquote>
        <cite class="philosophy-cite">Specialized Women's Care · Θεσσαλονίκη</cite>
      </div>
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
    (s, i) => `
        <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
          <span class="svc-icon" aria-hidden="true">${s.icon}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h2>${esc(s.h1)}</h2>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Μάθετε περισσότερα →</span>
        </a>`
  ).join("");
  const ld = [
    breadcrumbLD(depth, trail),
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
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Υπηρεσίες</p>
        <h1 class="page-title reveal">Ολοκληρωμένη γυναικολογική &amp; μαιευτική φροντίδα</h1>
        <p class="page-lead reveal">Από την πρόληψη και τη διάγνωση μέχρι την εξειδικευμένη χειρουργική και τη μαιευτική παρακολούθηση — ολόκληρο το φάσμα της γυναικείας υγείας, με εξατομικευμένη προσέγγιση.</p>
      </div>
    </section>
    <section class="services services--hub">
      <div class="container">
        <div class="services-grid">${cards}
        </div>
      </div>
    </section>
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
    breadcrumbLD(depth, trail),
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
  <main id="main">
    <section class="page-hero page-hero--svc">
      <div class="container">
        <span class="svc-hero-icon" aria-hidden="true">${s.icon}</span>
        <p class="eyebrow reveal">Υπηρεσία ${String(idx + 1).padStart(2, "0")}</p>
        <h1 class="page-title reveal">${esc(s.h1)}</h1>
        <p class="page-lead reveal">${esc(s.lead)}</p>
        <div class="hero-actions reveal"><a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a></div>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          ${s.body.map((p) => `<p class="reveal">${esc(p)}</p>`).join("\n          ")}

          <h2 class="reveal">Τι περιλαμβάνει</h2>
          <ul class="ticks">
            ${s.includes.map((i) => `<li class="reveal">${esc(i)}</li>`).join("\n            ")}
          </ul>

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${s.faq
              .map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`)
              .join("\n            ")}
          </div>
        </article>

        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Κλείστε ραντεβού</h3>
            <p>Λειτουργούμε κατόπιν ραντεβού. Επικοινωνήστε για να σας εξυπηρετήσουμε.</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">Email</a>
            <p class="aside-meta">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
          </div>
          <div class="aside-card reveal">
            <h3>Άλλες υπηρεσίες</h3>
            <nav class="aside-links">
              ${related.map((x) => `<a href="${r("ypiresies/" + x.slug + ".html")}">${esc(x.nav)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </section>
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
        <a class="area-card reveal" href="${r("perioches/" + a.slug + ".html")}">
          <h2>${esc(a.name)}</h2>
          <p>${esc(a.blurb)}</p>
          <span class="svc-more">Δείτε περισσότερα →</span>
        </a>`
  ).join("");
  const ld = [breadcrumbLD(depth, trail)];
  return head({
    depth,
    title: "Περιοχές που Εξυπηρετούμε — Θεσσαλονίκη | Specialized Women's Care",
    desc: "Με έδρα την Τσιμισκή 34, εξυπηρετούμε γυναίκες από όλη τη Θεσσαλονίκη: κέντρο, Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Πανόραμα & Εύοσμο. Γυναικολογική & μαιευτική φροντίδα κοντά σας.",
    canonical: "perioches/index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη περιοχές, γυναικολόγος Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Εύοσμος",
    ld,
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχές</p>
        <h1 class="page-title reveal">Κοντά σας, σε όλη τη Θεσσαλονίκη</h1>
        <p class="page-lead reveal">Με έδρα το κέντρο της Θεσσαλονίκης (Τσιμισκή 34), εξυπηρετούμε γυναίκες από όλη την πόλη και την ευρύτερη περιοχή.</p>
      </div>
    </section>
    <section class="areas">
      <div class="container">
        <div class="areas-grid">${cards}
        </div>
      </div>
    </section>
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
    breadcrumbLD(depth, trail),
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
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχή εξυπηρέτησης</p>
        <h1 class="page-title reveal">${esc(a.h1)}</h1>
        <p class="page-lead reveal">${esc(a.blurb)}</p>
        <div class="hero-actions reveal">
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
          <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία &amp; Χάρτης</a>
        </div>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          <h2 class="reveal">Οι υπηρεσίες μας για γυναίκες από ${esc(a.name)}</h2>
          <ul class="ticks two-col">
            ${SERVICES.map((s) => `<li class="reveal"><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.h1)}</a></li>`).join("\n            ")}
          </ul>
          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${localFaq.map(([q, ans]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join("\n            ")}
          </div>
        </article>
        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Στοιχεία επικοινωνίας</h3>
            <p class="aside-meta">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost btn-block">Email</a>
            <p class="aside-meta">${esc(BIZ.note)}</p>
          </div>
        </aside>
      </div>
    </section>
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
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
  ];
  const posts = [...POSTS].sort((x, y) => (x.date < y.date ? 1 : -1));
  const cards = posts.map(
    (p) => `
        <a class="post-card reveal" href="${r("blog/" + p.slug + ".html")}">
          <span class="post-cat">${esc(p.cat)}</span>
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.excerpt)}</p>
          <time datetime="${p.date}">${fmtDate(p.date)}</time>
        </a>`
  ).join("");
  const ld = [
    breadcrumbLD(depth, trail),
    { "@context": "https://schema.org", "@type": "Blog", name: BIZ.name + " — Blog", url: abs("blog/index.html"), inLanguage: "el" },
  ];
  return head({
    depth,
    title: "Blog — Γυναικολογική Ενημέρωση | Specialized Women's Care",
    desc: "Άρθρα & οδηγοί για τη γυναικεία υγεία: προληπτικός έλεγχος, τεστ Παπ & HPV, ουρογυναικολογία, ενδομητρίωση, εγκυμοσύνη και εμμηνόπαυση.",
    canonical: "blog/index.html",
    keywords: "blog γυναικολογίας, γυναικεία υγεία, πρόληψη, εγκυμοσύνη, εμμηνόπαυση",
    ld,
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Blog</p>
        <h1 class="page-title reveal">Ενημέρωση για τη γυναικεία υγεία</h1>
        <p class="page-lead reveal">Χρήσιμοι οδηγοί και απαντήσεις σε συχνές ερωτήσεις, από τους ιατρούς μας.</p>
      </div>
    </section>
    <section class="posts">
      <div class="container">
        <div class="posts-grid">${cards}
        </div>
      </div>
    </section>
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
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
    { name: p.title, rel: "blog/" + p.slug + ".html", path: "blog/" + p.slug + ".html" },
  ];
  const relatedSvc = SERVICES.find((s) => s.slug === p.related);
  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const ld = [
    breadcrumbLD(depth, trail),
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
    .map(([h, t]) => (h ? `<h2 class="reveal">${esc(h)}</h2>\n          <p class="reveal">${esc(t)}</p>` : `<p class="reveal lead-p">${esc(t)}</p>`))
    .join("\n          ");
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
  <main id="main">
    <article class="article">
      <header class="article-head">
        <div class="container article-head-inner">
          <span class="post-cat reveal">${esc(p.cat)}</span>
          <h1 class="page-title reveal">${esc(p.title)}</h1>
          <p class="article-meta reveal"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(BIZ.name)}</p>
        </div>
      </header>
      <div class="container article-body">
        <div class="article-copy">
          ${bodyHtml}

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${p.faq.map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n            ")}
          </div>

          ${relatedSvc ? `<div class="article-cta reveal">
            <p>Σχετική υπηρεσία: <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}"><strong>${esc(relatedSvc.h1)}</strong></a>. Κλείστε ραντεβού στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>.</p>
          </div>` : ""}

          <p class="article-disclaimer">Το παρόν άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη ιατρική συμβουλή. Για την περίπτωσή σας, συμβουλευτείτε τον ιατρό σας.</p>
        </div>
        <aside class="article-aside">
          <div class="aside-card reveal">
            <h3>Διαβάστε επίσης</h3>
            <nav class="aside-links">
              ${others.map((o) => `<a href="${r("blog/" + o.slug + ".html")}">${esc(o.title)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </article>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: CONTACT (info + form + map + emergency)
// ====================================================================
function pageContact() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Επικοινωνία", rel: "epikoinonia.html", path: "epikoinonia.html" },
  ];
  const ld = [breadcrumbLD(depth, trail), { "@context": "https://schema.org", ...clinicLD }];
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
  <main id="main">
    <section class="contact" id="contact">
      <div class="container">
        <div class="section-head section-head--left reveal">
          <p class="eyebrow">Επικοινωνία</p>
          <h1 class="section-title">Κλείστε το ραντεβού σας</h1>
        </div>

        <div class="emergency-band reveal">
          <span class="emergency-icon" aria-hidden="true">✚</span>
          <p>Για <strong>επείγοντα περιστατικά</strong> καλέστε μας στο: ${emergencyLinks}</p>
        </div>

        <div class="contact-grid">
          <div class="contact-copy">
            <p class="contact-note reveal">Η λειτουργία του ιατρείου είναι <strong>κατόπιν ραντεβού</strong>. Συμπληρώστε τη φόρμα ή επικοινωνήστε μαζί μας — θα σας απαντήσουμε το συντομότερο.</p>
            <ul class="contact-list">
              <li class="reveal"><span class="contact-label">Διεύθυνση</span><span class="contact-value">${esc(BIZ.street)}, ${esc(BIZ.floor)}<br />${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}</span></li>
              <li class="reveal"><span class="contact-label">Τηλέφωνο</span><span class="contact-value"><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></span></li>
              <li class="reveal"><span class="contact-label">Επείγοντα</span><span class="contact-value">${emergencyLinks}</span></li>
              <li class="reveal"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></span></li>
              <li class="reveal"><span class="contact-label">Social</span><span class="contact-value"><a href="${BIZ.facebook}" target="_blank" rel="noopener noreferrer">Facebook</a> · <a href="${BIZ.googleBusiness}" target="_blank" rel="noopener noreferrer">Google</a></span></li>
            </ul>
          </div>

          <div class="contact-form-wrap reveal">
            <form class="contact-form" action="https://formsubmit.co/${BIZ.email}" method="POST">
              <input type="hidden" name="_subject" value="Νέο μήνυμα από την ιστοσελίδα — Specialized Women's Care" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value="${abs("epikoinonia.html")}?sent=1" />
              <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" />
              <p class="form-msg" id="formMsg" role="status"></p>
              <div class="form-row">
                <label>Ονοματεπώνυμο
                  <input type="text" name="Ονοματεπώνυμο" required autocomplete="name" />
                </label>
              </div>
              <div class="form-grid">
                <label>Τηλέφωνο
                  <input type="tel" name="Τηλέφωνο" autocomplete="tel" />
                </label>
                <label>Email
                  <input type="email" name="Email" required autocomplete="email" />
                </label>
              </div>
              <div class="form-row">
                <label>Θέμα
                  <input type="text" name="Θέμα" />
                </label>
              </div>
              <div class="form-row">
                <label>Μήνυμα
                  <textarea name="Μήνυμα" rows="5" required></textarea>
                </label>
              </div>
              <label class="form-consent">
                <input type="checkbox" required />
                <span>Συναινώ στην επεξεργασία των στοιχείων μου για την επικοινωνία μαζί μου.</span>
              </label>
              <button type="submit" class="btn btn-primary btn-block">Αποστολή Μηνύματος</button>
              <p class="form-fallback">ή καλέστε στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></p>
            </form>
          </div>
        </div>

        <div class="contact-map reveal">
          <iframe title="Χάρτης — ${attr(BIZ.street + ", " + BIZ.city)}" src="${mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
      </div>
    </section>
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
  const ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${ns}">\n${body}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;
}

// ====================================================================
//  RUN
// ====================================================================
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

console.log(`✓ Generated ${n} HTML pages + sitemap.xml + robots.txt`);
