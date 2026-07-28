// ============================================================
//  Specialized Women's Care — Version 2
//  Placeholder artwork generator (square/circular crops + icons)
//  Run via build.mjs — writes into ../assets/
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = resolve(ROOT, "assets");

const P = {
  cream: "#fbfbfc",
  sand: "#eeeef1",
  mist: "#e4e4e9",
  blush: "#f5e1e4",
  rose: "#d8a8ad",
  mauve: "#c0868f",
  plum: "#9b6673",
  wine: "#874f5e",
  ink: "#3a3a3d",
};

const write = (name, svg) => {
  mkdirSync(ASSETS, { recursive: true });
  writeFileSync(resolve(ASSETS, name), svg.trim() + "\n");
};

// SVG is XML: an unescaped & in a label makes the whole file unparseable
const x = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ---- square portrait placeholder (rendered as a circle by CSS) -------
function portrait(name, label, from, to, figure) {
  write(
    name,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900" role="img" aria-label="${x(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="900" height="900" fill="url(#bg)"/>
  <g fill="${figure}">
    <circle cx="450" cy="380" r="132"/>
    <path d="M232 900 C232 664 336 570 450 570 C564 570 668 664 668 900 Z"/>
  </g>
</svg>`
  );
}

// ---- abstract composition circle (hero / feature imagery) -----------
function abstractTile(name, label, base, accent, seedShapes) {
  write(
    name,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900" role="img" aria-label="${x(label)}">
  <rect width="900" height="900" fill="${base}"/>
  ${seedShapes(accent)}
</svg>`
  );
}

// ---- line icon on the coloured band --------------------------------
function bandIcon(name, label, glyph) {
  write(
    name,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${x(label)}">
  <g fill="none" stroke="${P.blush}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="60" cy="60" r="52" opacity="0.45"/>
    ${glyph}
  </g>
</svg>`
  );
}

// ---- 4:3 article thumbnail -----------------------------------------
function thumb(name, label, tint) {
  write(
    name,
    `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900" role="img" aria-label="${x(label)}">
  <defs>
    <linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.sand}"/>
      <stop offset="1" stop-color="${tint}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#t)"/>
  <circle cx="880" cy="250" r="210" fill="${P.white || "#ffffff"}" opacity="0.4"/>
  <circle cx="320" cy="700" r="150" fill="${P.wine}" opacity="0.12"/>
  <path d="M0 700 C260 560 420 780 700 640 C900 545 1050 640 1200 590 L1200 900 L0 900 Z" fill="${P.wine}" opacity="0.08"/>
</svg>`
  );
}

export function generateAssets() {
  // Hero composition — three circular photos
  portrait("hero-1.svg", "Φροντίδα στο ιατρείο", P.blush, P.rose, "#ffffff");
  abstractTile("hero-2.svg", "Σύγχρονος διαγνωστικός εξοπλισμός", P.sand, P.mauve, (a) => `
  <circle cx="450" cy="450" r="250" fill="${a}" opacity="0.35"/>
  <circle cx="450" cy="450" r="150" fill="#ffffff" opacity="0.65"/>
  <path d="M450 300 L450 600 M300 450 L600 450" stroke="${P.wine}" stroke-width="10" stroke-linecap="round" opacity="0.4"/>`);
  abstractTile("hero-3.svg", "Υποδοχή ιατρείου", P.mist, P.plum, (a) => `
  <path d="M0 620 C220 470 400 700 640 560 C760 490 830 560 900 520 L900 900 L0 900 Z" fill="${a}" opacity="0.35"/>
  <circle cx="620" cy="280" r="130" fill="#ffffff" opacity="0.6"/>`);

  // Doctors — square crops for the circular cards
  portrait("doc-vasilis.svg", "Δρ. Βασίλης Θεοδουλίδης", P.sand, P.mist, "#cbbfc2");
  portrait("doc-iakovos.svg", "Δρ. Ιάκωβος Θεοδουλίδης", P.mist, P.sand, "#c9bec4");

  // home-A feature side panels
  abstractTile("feature-1.svg", "Χειρουργείο — ενδοσκοπική χειρουργική", P.sand, P.wine, (a) => `
  <circle cx="450" cy="450" r="300" fill="${a}" opacity="0.18"/>
  <circle cx="450" cy="450" r="180" fill="${a}" opacity="0.22"/>`);
  abstractTile("feature-2.svg", "Εξατομικευμένη φροντίδα", P.blush, P.plum, (a) => `
  <circle cx="450" cy="450" r="290" fill="${a}" opacity="0.2"/>
  <path d="M240 560 C340 400 560 400 660 560" stroke="${a}" stroke-width="16" fill="none" opacity="0.5" stroke-linecap="round"/>`);

  // home-B — two large circular cards
  portrait("card-gynaikologia.svg", "Γυναικολογία & πρόληψη", P.rose, P.plum, "#ffffff");
  portrait("card-maieutiki.svg", "Μαιευτική φροντίδα", P.mauve, P.wine, "#ffffff");

  // Coloured band icons
  bandIcon("icon-prolipsi.svg", "Πρόληψη", `<path d="M60 34 L60 86 M34 60 L86 60"/>`);
  bandIcon("icon-ogkologia.svg", "Γυναικολογική ογκολογία", `<path d="M60 88 C34 70 34 46 48 40 C56 36 60 44 60 44 C60 44 64 36 72 40 C86 46 86 70 60 88 Z"/>`);
  bandIcon("icon-ourogynaikologia.svg", "Ουρογυναικολογία", `<path d="M60 32 C74 48 84 60 84 72 A24 24 0 0 1 36 72 C36 60 46 48 60 32 Z"/>`);
  bandIcon("icon-maieutiki.svg", "Μαιευτική", `<circle cx="60" cy="46" r="12"/><path d="M38 88 C38 70 48 62 60 62 C72 62 82 70 82 88"/>`);

  // Article thumbnails
  thumb("post-1.svg", "Άρθρο", P.blush);
  thumb("post-2.svg", "Άρθρο", P.mist);
  thumb("post-3.svg", "Άρθρο", P.sand);
  thumb("post-4.svg", "Άρθρο", P.blush);
  thumb("post-5.svg", "Άρθρο", P.mist);
  thumb("post-6.svg", "Άρθρο", P.sand);
}
