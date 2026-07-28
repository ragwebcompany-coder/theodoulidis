# Specialized Women's Care — Ιστοσελίδα

Στατική ιστοσελίδα (HTML/CSS/JS, χωρίς framework) για τους **Δρ. Βασίλη Θεοδουλίδη**
(Μαιευτήρας — Γυναικολόγος · Γυναικολόγος Ογκολόγος) & **Δρ. Ιάκωβο Θεοδουλίδη**
(Μαιευτήρας — Γυναικολόγος · Ουρογυναικολόγος), στο κέντρο της Θεσσαλονίκης.
Παλέτα λευκό / απαλό γκρι / dusty rose (pastel).

## Δύο εκδόσεις

| Φάκελος | Layout | Σημειώσεις |
|---|---|---|
| `version-1/` | Το αρχικό layout (τύπου Dental Harmony Clinic) | Η έκδοση που υπήρχε ήδη — αμετάβλητη |
| `version-2/` | Layout αντιγραμμένο από **drvenetis.com** | Ίδιο περιεχόμενο, νέα δομή & στυλ |

Και οι δύο εκδόσεις έχουν **ακριβώς το ίδιο περιεχόμενο**: μοιράζονται πανομοιότυπο
`build/data.mjs` (κείμενα, ιατροί, υπηρεσίες, περιοχές, άρθρα, στοιχεία επικοινωνίας).
Διαφέρουν μόνο σε `build/build.mjs`, `styles.css` και `main.js`.

Κάθε φάκελος είναι αυτόνομος — ανεβάζετε τα περιεχόμενα του ενός στο root του domain.

### Τι αλλάζει στο version 2 (δομή drvenetis.com)

- **Header**: κεντραρισμένο λογότυπο, μενού από κάτω, τηλέφωνο πάνω δεξιά, dropdown υπομενού.
- **Αρχική** με τη σειρά ενοτήτων του reference: cover με τρεις κυκλικές φωτογραφίες &
  διακοσμητικές γραμμές → μπλοκ ιατρών → έγχρωμη μπάρα με 4 εικονίδια → κεντρική ενότητα
  ειδίκευσης με κυκλικές εικόνες στα πλάγια → δύο μεγάλες κυκλικές κάρτες → carousel άρθρων.
- **Στρογγυλό κουμπί «+»** ως βασικό call-to-action, όπως στο reference.
- **Footer** σε 4 στήλες με έγχρωμο φόντο και κάτω μπάρα credit.
- Οι εικόνες είναι **placeholders** (`build/assets.mjs`) — αντικαταστήστε τα SVG στο
  `assets/` με πραγματικές φωτογραφίες (τετράγωνες 1:1 για τους κύκλους, 4:3 για τα άρθρα).

## Δομή κάθε έκδοσης (25 σελίδες)

```
index.html                     Αρχική
oi-giatroi.html                Βιογραφικά & των δύο ιατρών
epikoinonia.html               Επικοινωνία + φόρμα + χάρτης + επείγοντα
ypiresies/index.html           Όλες οι υπηρεσίες (hub)
ypiresies/<υπηρεσία>.html       7 σελίδες υπηρεσιών
perioches/index.html           Περιοχές εξυπηρέτησης (hub)
perioches/<περιοχή>.html        6 τοπικές σελίδες SEO (Θεσσαλονίκη, Καλαμαριά, κ.λπ.)
blog/index.html                Blog (hub)
blog/<άρθρο>.html               6 άρθρα (long-tail keywords)
sitemap.xml, robots.txt        Τεχνικό SEO
assets/                        λογότυπο (logo-emblem/-wordmark, ±-light), favicons,
                               og-image.png · dr-vasilis.svg, dr-iakovos.svg (placeholders)
styles.css, main.js            Κοινό στυλ & συμπεριφορά
build/                         Γεννήτρια (data.mjs + build.mjs)
```

## SEO που υλοποιήθηκε

- **Στοχευμένες σελίδες**: 7 υπηρεσίες + 6 τοπικές + 6 άρθρα, με μοναδικά keywords,
  μοναδικό `<title>` & `meta description` ανά σελίδα.
- **Structured data (JSON-LD)**: MedicalClinic/LocalBusiness (διεύθυνση, geo, social,
  δύο ιατροί ως `employee` Physician), BreadcrumbList παντού, MedicalProcedure στις
  υπηρεσίες, FAQPage, BlogPosting, ItemList, WebSite.
- **Open Graph & Twitter cards**, canonical URLs, `lang="el"`, semantic HTML,
  εσωτερική διασύνδεση, alt σε εικόνες, breadcrumbs.
- **sitemap.xml** + **robots.txt** έτοιμα για Google Search Console.
- Mobile-first responsive, γρήγορο, accessible (skip link, aria labels, focus states).

## Αναγέννηση σελίδων

Όλο το κείμενο/δεδομένα ζουν στο `build/data.mjs` **κάθε έκδοσης**. Μετά από αλλαγή:

```bash
cd version-1 && node build/build.mjs     # ή
cd version-2 && node build/build.mjs
```

Παράγει ξανά όλες τις σελίδες + sitemap + robots. (`styles.css` & `main.js` είναι
χειρόγραφα — δεν τα ακουμπά η γεννήτρια. Στο version 2, το `build/assets.mjs`
ξαναφτιάχνει και τα placeholder SVG του `assets/` — σβήστε το από το build αν βάλετε
πραγματικές φωτογραφίες με τα ίδια ονόματα.)

> Αν αλλάξετε κείμενο, ενημερώστε το `data.mjs` **και στις δύο** εκδόσεις για να
> παραμείνουν συγχρονισμένες (τα δύο αρχεία είναι σκόπιμα πανομοιότυπα).

## ⚠️ Πριν το live — επιβεβαιώστε/διορθώστε

1. **Εικόνες**: το λογότυπο είναι πλέον το πραγματικό (από τα BMP του πελάτη) — έμβλημα
   + wordmark, σε δύο χρωματικές εκδοχές: `logo-emblem/-wordmark.png` (wine `#874f5e`,
   για το header) και `-light.png` (cream, για το σκούρο footer). Από το έμβλημα
   παράγονται και τα `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`,
   `favicon.ico`, καθώς και το og:image 1200×630 (`assets/og-image.png`).
   Τα `dr-vasilis.svg`, `dr-iakovos.svg` παραμένουν **placeholders** — αντικαταστήστε
   τα με τις φωτογραφίες των ιατρών (ίδια ονόματα αρχείων, ή ενημερώστε τα paths).
2. **Φόρμα επικοινωνίας**: χρησιμοποιεί το [FormSubmit](https://formsubmit.co)
   (δωρεάν, χωρίς backend), με στόχο το `dr.theodoulidis@gmail.com`. Στην **πρώτη**
   υποβολή, το FormSubmit στέλνει email ενεργοποίησης — πατήστε το link μία φορά για
   να αρχίσει να λαμβάνει μηνύματα. Για να αλλάξετε email, αλλάξτε το `email` στο
   `data.mjs` και ξανακάντε build.
3. **Domain**: όλα τα canonical/OG/sitemap URLs χρησιμοποιούν `https://drtheodoulidis.gr`.
   Αλλάξτε το `BASE` στο `build/data.mjs` αν διαφέρει.
4. **Συντεταγμένες χάρτη** (`lat`/`lng` στο `data.mjs`): προσεγγιστικές για Τσιμισκή 34.
   Βάλτε τις ακριβείς για σωστό pin (ο χάρτης iframe δουλεύει ήδη με τη διεύθυνση).
5. **Social**: το Facebook link προέρχεται από τα στοιχεία πελάτη. Προσθέστε Instagram/
   TikTok αν υπάρχουν (πεδία στο `BIZ` του `data.mjs`).
6. **Testimonials**: δεν προστέθηκαν (δεν υπάρχουν πραγματικές αξιολογήσεις ακόμη —
   αποφεύγουμε πλαστές). Μπορούν να προστεθούν αργότερα όταν υπάρξουν αληθινές.
7. Μετά το live: υποβολή `sitemap.xml` στο Google Search Console + Google Business Profile.

## Σημειώσεις σχεδιασμού (βάσει στοιχείων πελάτη)

- **Χωρίς ωράριο λειτουργίας** & **χωρίς online κλείσιμο ραντεβού** — μόνο στοιχεία
  επικοινωνίας, φόρμα, χάρτης και μήνυμα επειγόντων (6979972412 · 6955034677).
- Δύο ιατροί, ξεχωριστά βιογραφικά στη σελίδα «Οι Ιατροί».

## Τοπική προεπισκόπηση

```bash
python3 -m http.server 8777
# http://localhost:8777
```

Made by CLINICBRAIN — https://clinicbrain.gr/
