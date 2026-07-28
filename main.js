/* Specialized Women's Care — Version 2
   nav toggle · scroll reveals · hero animation · article carousel */
(function () {
  "use strict";

  /* ---- mobile menu ------------------------------------------------ */
  var nav = document.querySelector("header nav");
  var toggle = nav && nav.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Κλείσιμο μενού" : "Άνοιγμα μενού");
    });
  }

  /* ---- reveal on scroll ------------------------------------------ */
  var reveals = document.querySelectorAll(".A-reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("revealed"); });
  }

  /* ---- hero composition animates in on load ---------------------- */
  var cover = document.querySelector(".home-cover");
  if (cover) {
    requestAnimationFrame(function () {
      setTimeout(function () { cover.classList.add("open"); }, 120);
    });
  }

  /* ---- article carousel ------------------------------------------ */
  var carousel = document.querySelector(".Aposts");
  if (carousel) {
    var track = carousel.querySelector(".Aitems");
    var prev = carousel.querySelector(".Anavi-prev");
    var next = carousel.querySelector(".Anavi-next");
    var step = function () {
      var item = track.querySelector(".Aitem");
      return item ? item.getBoundingClientRect().width + 32 : track.clientWidth;
    };
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  }

  /* ---- footer year ------------------------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- contact form: confirmation after redirect ----------------- */
  var msg = document.getElementById("formMsg");
  if (msg && /[?&]sent=1/.test(location.search)) {
    msg.textContent = "Το μήνυμά σας στάλθηκε. Θα επικοινωνήσουμε μαζί σας σύντομα.";
  }
})();
