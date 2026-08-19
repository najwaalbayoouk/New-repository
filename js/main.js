document.addEventListener('DOMContentLoaded', () => {

  /* ============ شريط التنقل ============ */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  });

  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
    });
  });

  /* ============ ظهور العناصر عند التمرير ============ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ عدّاد الأرقام (الإحصائيات) ============ */
  const counters = document.querySelectorAll('.stat__num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ============ تأثير الإمالة ثلاثي الأبعاد (Tilt) ============ */
  const tiltEls = document.querySelectorAll('.tilt, #heroCard .hero__card-face');
  const isTouch = matchMedia('(hover: none)').matches;

  if (!isTouch) {
    tiltEls.forEach(el => {
      const parent = el.classList.contains('hero__card-face') ? document.getElementById('heroCard') : el;

      parent.addEventListener('mousemove', (e) => {
        const rect = parent.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (-y * 14).toFixed(2);
        const rotateY = (x * 14).toFixed(2);
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
      });

      parent.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  }

  /* ============ فلترة الأعمال ============ */
  const filters = document.querySelectorAll('.filter');
  const workCards = document.querySelectorAll('.w-card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      workCards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ============ تكبير صور المشاريع (Lightbox) ============ */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const mediaBtns = document.querySelectorAll('.w-card__media-btn');

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  mediaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      openLightbox(btn.dataset.img, img ? img.alt : '');
    });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ============ نموذج التواصل ============ */
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // === تنبيه للمطوّرة ===
    // هذا نموذج واجهة أمامية فقط. لتفعيل الإرسال الفعلي للبريد اختاري إحدى الطريقتين:
    // 1) Formspree: أنشئي حساب على https://formspree.io واستبدلي هذا الكود بـ fetch إلى endpoint الخاص بك.
    // 2) EmailJS: أضيفي مكتبة https://www.emailjs.com وأرسلي البيانات مباشرة من المتصفح.
    // حالياً الفورم يفتح تطبيق البريد الافتراضي كحل مؤقت وسريع.

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value.trim() || 'رسالة جديدة من الموقع';
    const message = form.message.value.trim();

    const mailto = `mailto:n421345646@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `الاسم: ${name}\nالبريد: ${email}\n\n${message}`
    )}`;

    window.location.href = mailto;

    note.textContent = 'جاري فتح تطبيق البريد لديك لإتمام الإرسال...';
    note.classList.add('success');

    setTimeout(() => {
      note.textContent = '';
      note.classList.remove('success');
    }, 5000);
  });

});
