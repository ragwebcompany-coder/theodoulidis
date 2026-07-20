# Specialized Women's Care — Ιστοσελίδα

Στατική ιστοσελίδα (HTML/CSS/JS, χωρίς framework) για τους **Δρ. Βασίλη Θεοδουλίδη**
(Μαιευτήρας — Γυναικολόγος · Γυναικολόγος Ογκολόγος) & **Δρ. Ιάκωβο Θεοδουλίδη**
(Μαιευτήρας — Γυναικολόγος · Ουρογυναικολόγος), στο κέντρο της Θεσσαλονίκης.
Παλέτα λευκό / απαλό γκρι / dusty rose (pastel). Ίδιος τύπος format, layout & SEO
με την ιστοσελίδα του Dental Harmony Clinic.

## Δομή (25 σελίδες)

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
assets/                        logo.svg, dr-vasilis.svg, dr-iakovos.svg (placeholders)
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

Όλο το κείμενο/δεδομένα ζουν στο `build/data.mjs`. Μετά από αλλαγή:

```bash
node build/build.mjs
```

Παράγει ξανά όλες τις σελίδες + sitemap + robots. (`styles.css` & `main.js` είναι
χειρόγραφα — δεν τα ακουμπά η γεννήτρια.)

## ⚠️ Πριν το live — επιβεβαιώστε/διορθώστε

1. **Εικόνες (placeholders)**: τα `assets/logo.svg`, `dr-vasilis.svg`, `dr-iakovos.svg`
   είναι προσωρινά. Αντικαταστήστε με το πραγματικό λογότυπο και τις φωτογραφίες των
   ιατρών (ίδια ονόματα αρχείων, ή ενημερώστε τα paths στο `data.mjs`/`build.mjs`).
   Για social sharing (og:image) προτείνεται και ένα `logo` σε PNG/JPG ~1200×630.
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
