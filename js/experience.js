(() => {
  'use strict';
  const chapters = [
    { id: 'door', label: 'Door Handle · Original', image: 'door-handle.webp', focus: '23% 48%', portal: '24% 50%', mobile: '11% 50%' },
    { id: 'door-detail', label: 'Door Handle · Detail', image: 'door-handle.webp', portal: '35% 50%' },
    { id: 'mirror', label: 'Mirror', image: 'mirror.webp', portal: '64% 45%' },
    { id: 'bathroom', label: 'Bathroom · MOCKUP', image: 'bathroom.webp', portal: '44% 50%' },
    { id: 'towel-bar', label: 'Towel Bar · Mockup', image: 'towel-bar.webp', portal: '56% 53%' },
    { id: 'soap-dish', label: 'Soap Dish', image: 'soap-dish.webp', portal: '53% 59%' },
    { id: 'hook-logo', label: 'SOAP BAR · Final', image: 'towel-hook.webp', portal: '65% 46%' }
  ];

  const PORTAL_DURATION = 1820; // Keep the circular transition speed unchanged.
  const TEXT_START_DELAY = 470; // Begin text shortly after the next image starts to appear.
  const stage = document.getElementById('stage');
  const film = document.getElementById('door-film');
  const flash = stage.querySelector('.soft-flash');
  const indexToggle = document.getElementById('index-toggle');
  const indexDrawer = document.getElementById('index-drawer');
  const indexClose = document.getElementById('close-drawer');
  const aboutButton = document.getElementById('about-button');
  const aboutPanel = document.getElementById('about-panel');
  const aboutClose = document.getElementById('close-about');
  const shopButton = document.getElementById('shop-button');
  const indexNav = document.getElementById('scene-navigation');
  const countCurrent = document.getElementById('current-count');
  const countTotal = document.getElementById('total-count');
  const announcement = document.getElementById('live-announcement');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pad = num => String(num).padStart(2, '0');
  const safe = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sleep = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  let active = 0;
  let busy = false;
  let cooldown = 0;
  let wheelSum = 0;
  let wheelSign = 0;
  let wheelTime = 0;
  let touchStart = null;

  const scenes = [...stage.querySelectorAll('.scene')];
  scenes[0].style.setProperty('--focus', chapters[0].focus);
  scenes[0].style.setProperty('--mobile-position', chapters[0].mobile);
  scenes[0].style.zIndex = '2';

  const links = chapters.map((ch, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'drawer-item';
    button.dataset.jump = String(i);
    button.innerHTML = `<span>${pad(i + 1)}</span>${safe(ch.label)}`;
    button.addEventListener('click', () => goTo(i));
    indexNav.appendChild(button);
    return button;
  });
  countTotal.textContent = pad(chapters.length);

  function openAbout(show) {
    if (show) openIndex(false);
    aboutPanel.classList.toggle('is-open', show);
    aboutPanel.setAttribute('aria-hidden', String(!show));
    aboutPanel.inert = !show;
    aboutButton.setAttribute('aria-expanded', String(show));
  }
  function openIndex(show) {
    if (show) openAbout(false);
    indexDrawer.classList.toggle('is-open', show);
    indexDrawer.setAttribute('aria-hidden', String(!show));
    indexDrawer.inert = !show;
    indexToggle.setAttribute('aria-expanded', String(show));
  }
  indexToggle.addEventListener('click', () => openIndex(!indexDrawer.classList.contains('is-open')));
  indexClose.addEventListener('click', () => openIndex(false));
  aboutButton.addEventListener('click', () => openAbout(!aboutPanel.classList.contains('is-open')));
  aboutClose.addEventListener('click', () => openAbout(false));
  document.getElementById('about-explore').addEventListener('click', () => {openAbout(false); goTo(chapters.findIndex(ch => ch.id === 'mirror'));});
  shopButton.addEventListener('click', () => goTo(chapters.findIndex(ch => ch.id === 'mirror')));
  document.getElementById('home-button').addEventListener('click', () => goTo(0));

  function settle(target, { preserveCopy = false } = {}) {
    scenes.forEach((scene, i) => {
      const isCurrent = i === target;
      scene.classList.toggle('is-visible', isCurrent);
      scene.classList.toggle('is-current', isCurrent);
      if (!isCurrent || !preserveCopy) scene.classList.remove('is-presented');
      scene.style.opacity = isCurrent ? '1' : '0';
      scene.style.visibility = isCurrent ? 'visible' : 'hidden';
      scene.style.zIndex = isCurrent ? '2' : '0';
      scene.style.clipPath = 'none';
      scene.querySelector('.scene__frame').style.transform = 'none';
      scene.setAttribute('aria-hidden', String(!isCurrent));
      scene.querySelectorAll('button').forEach(button => { button.tabIndex = isCurrent ? 0 : -1; });
    });
    active = target;
    document.getElementById('tour').classList.toggle('is-home', target === 0);
    countCurrent.textContent = pad(active + 1);
    links.forEach((link, i) => {
      link.classList.toggle('is-selected', i === target);
      if (i === target) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
    });
    announcement.textContent = `${active + 1}번째 장면, ${chapters[active].label}`;
    if (!preserveCopy) {
      requestAnimationFrame(() => requestAnimationFrame(() => scenes[active]?.classList.add('is-presented')));
    }
  }

  async function expandTo(target) {
    const outgoing = scenes[active];
    const incoming = scenes[target];
    outgoing.classList.remove('is-presented');
    incoming.classList.add('is-visible');
    incoming.classList.remove('is-presented');
    incoming.style.visibility = 'visible';
    incoming.style.opacity = '1';
    incoming.style.zIndex = '4';
    if (reducedMotion.matches) { settle(target); return; }
    const sameImage = chapters[active].image === chapters[target].image;
    if (sameImage) {
      incoming.style.clipPath = 'none';
      await sleep(45);
      incoming.classList.add('is-presented');
      await sleep(135);
      settle(target, { preserveCopy: true });
      return;
    }
    const portal = chapters[active].portal;
    incoming.style.clipPath = `circle(0% at ${portal})`;
    const copyStart = sleep(chapters[target].id === 'bathroom' ? 120 : TEXT_START_DELAY).then(() => {
      incoming.classList.add('is-presented');
    });
    const zoom = outgoing.querySelector('.scene__frame').animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.055)' }
    ], { duration: PORTAL_DURATION, easing: 'cubic-bezier(.45,0,.20,1)', fill: 'forwards' });
    const reveal = incoming.animate([
      { clipPath: `circle(0% at ${portal})` },
      { clipPath: `circle(160% at ${portal})` }
    ], { duration: PORTAL_DURATION, easing: 'cubic-bezier(.45,0,.20,1)', fill: 'forwards' });
    const bloom = flash.animate([
      { opacity: 0, offset: 0 }, { opacity: .13, offset: .52 }, { opacity: 0, offset: 1 }
    ], { duration: PORTAL_DURATION, easing: 'ease-in-out' });
    await Promise.all([zoom.finished.catch(() => {}), reveal.finished.catch(() => {}), bloom.finished.catch(() => {}), copyStart]);
    zoom.cancel(); reveal.cancel(); bloom.cancel();
    settle(target, { preserveCopy: true });
  }

  function waitForMediaReady(timeout = 7000) {
    if (film.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve(true);
    return new Promise(resolve => {
      let done = false;
      let timer;
      const finish = ok => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        film.removeEventListener('loadeddata', onReady);
        film.removeEventListener('error', onError);
        resolve(ok);
      };
      const onReady = () => finish(true);
      const onError = () => finish(false);
      film.addEventListener('loadeddata', onReady);
      film.addEventListener('error', onError);
      timer = window.setTimeout(() => finish(film.readyState >= 2), timeout);
    });
  }
  async function seekMovieToStart() {
    film.pause();
    if (film.currentTime <= 0.025) return;
    await new Promise(resolve => {
      let done = false;
      let timer;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        film.removeEventListener('seeked', finish);
        resolve();
      };
      film.addEventListener('seeked', finish, { once: true });
      timer = window.setTimeout(finish, 1300);
      try { film.currentTime = 0; } catch (_) { finish(); }
    });
  }
  async function openDoor() {
    const mirrorIndex = chapters.findIndex(ch => ch.id === 'mirror');
    if (reducedMotion.matches) { settle(mirrorIndex); return; }
    const outgoing = scenes[active];
    const incoming = scenes[mirrorIndex];
    outgoing.classList.remove('is-presented');
    film.pause();
    film.style.display = 'block';
    film.style.visibility = 'hidden';
    film.style.opacity = '0';

    const ready = await waitForMediaReady();
    if (!ready) { film.style.display = 'none'; await expandTo(mirrorIndex); return; }
    await seekMovieToStart();
    film.style.visibility = 'visible';

    const fadeIn = film.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 230, easing: 'ease-in-out', fill: 'forwards' });
    await fadeIn.finished.catch(() => {});
    film.style.opacity = '1';
    fadeIn.cancel();

    let playbackStarted = false;
    try {
      const promise = film.play();
      if (promise) await promise;
      playbackStarted = true;
    } catch (error) {
      console.warn('Video playback unavailable; showing next room instead.', error);
    }
    if (playbackStarted) {
      await Promise.race([
        new Promise(resolve => {
          if (film.ended || (film.duration && film.currentTime >= film.duration - 0.06)) {
            resolve(); return;
          }
          film.addEventListener('ended', resolve, { once: true });
        }),
        sleep(Math.max(5200, Number.isFinite(film.duration) ? film.duration * 1000 + 1200 : 5200))
      ]);
    } else {
      await sleep(400);
    }
    film.pause();
    incoming.classList.add('is-visible');
    incoming.classList.remove('is-presented');
    incoming.style.visibility = 'visible';
    incoming.style.opacity = '1';
    incoming.style.zIndex = '21'; // The movie is at 20.
    const center = '67% 48%';
    incoming.style.clipPath = `circle(0% at ${center})`;
    const textStart = sleep(TEXT_START_DELAY).then(() => {
      incoming.classList.add('is-presented');
    });
    const reveal = incoming.animate([
      { clipPath: `circle(0% at ${center})` },
      { clipPath: `circle(160% at ${center})` }
    ], { duration: PORTAL_DURATION, easing: 'cubic-bezier(.45,0,.20,1)', fill: 'forwards' });
    await Promise.all([reveal.finished.catch(() => {}), textStart]);
    reveal.cancel();
    film.style.display = 'none';
    film.style.opacity = '0';
    settle(mirrorIndex, { preserveCopy: true });
  }

  async function goTo(target) {
    if (busy || target === active || target < 0 || target >= scenes.length) return;
    busy = true;
    openIndex(false);
    openAbout(false);
    try {
      if (chapters[target]?.id === 'mirror' && chapters[active]?.id === 'door-detail') await openDoor();
      else await expandTo(target);
    } catch (err) {
      console.warn('Transition fallback:', err);
      film.pause();
      film.style.display = 'none';
      settle(target);
    } finally {
      busy = false;
      wheelSum = 0;
      wheelTime = 0;
      cooldown = performance.now() + 420;
    }
  }
  function oneStep(direction) { void goTo(active + direction); }
  function onWheel(event) {
    if (event.ctrlKey || event.metaKey || (indexDrawer.classList.contains('is-open') || aboutPanel.classList.contains('is-open'))) return;
    event.preventDefault();
    if (busy || performance.now() < cooldown) return;
    const scaled = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
    if (!scaled) return;
    const now = performance.now();
    const direction = Math.sign(scaled);
    if (now - wheelTime > 220 || wheelSign !== direction) wheelSum = 0;
    wheelTime = now;
    wheelSign = direction;
    wheelSum += Math.abs(scaled);
    if (wheelSum >= 45) { wheelSum = 0; oneStep(direction); }
  }
  window.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('touchstart', event => {
    if ((indexDrawer.classList.contains('is-open') || aboutPanel.classList.contains('is-open'))) return;
    touchStart = event.touches[0]?.clientY ?? null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (touchStart == null || busy || performance.now() < cooldown || (indexDrawer.classList.contains('is-open') || aboutPanel.classList.contains('is-open'))) return;
    const finish = event.changedTouches[0]?.clientY;
    if (finish === undefined) return;
    const diff = touchStart - finish;
    touchStart = null;
    if (Math.abs(diff) >= 48) oneStep(Math.sign(diff));
  }, { passive: true });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') { openIndex(false); openAbout(false); return; }
    if ((indexDrawer.classList.contains('is-open') || aboutPanel.classList.contains('is-open'))) return;
    if (event.target.closest('button, a, input, textarea, select, [contenteditable]')) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault(); if (!busy && performance.now() >= cooldown) oneStep(1);
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault(); if (!busy && performance.now() >= cooldown) oneStep(-1);
    }
  });
  settle(0);
  if (film) { film.preload = 'auto'; film.load(); }
})();
