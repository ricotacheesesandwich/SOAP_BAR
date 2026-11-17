/**
 * Scroll-triggered *stepper*, not a scroll-scrubbed timeline.
 * Each wheel/touch/key press triggers exactly one entire transition.
 * Only outgoing pictures scale, and the scale is always monotonically increasing.
 * Incoming pictures are never shrunk or enlarged during ordinary scene transitions.
 */
export function initExperience() {
  const root = document.querySelector('[data-experience]');
  if (!root) return () => {};

  const scenes = [...root.querySelectorAll('[data-scene]')];
  const video = root.querySelector('[data-door-video]');
  const halo = root.querySelector('[data-transition-halo]');
  const count = root.querySelector('[data-count]');
  const chapterName = root.querySelector('[data-chapter-name]');
  const chapterType = root.querySelector('[data-chapter-type]');
  const live = root.querySelector('[data-live]');
  const story = root.querySelector('[data-story]');
  const storyEyebrow = root.querySelector('[data-story-eyebrow]');
  const storyTitle = root.querySelector('[data-story-title]');
  const storyDescription = root.querySelector('[data-story-description]');
  const jumpButtons = [...root.querySelectorAll('[data-go-to]')];
  const indexPanel = root.querySelector('[data-index-panel]');
  const indexToggle = root.querySelector('[data-index-toggle]');
  const indexClose = root.querySelector('[data-index-close]');
  const railButtons = [...root.querySelectorAll('[data-rail]')];
  const previous = root.querySelector('[data-previous]');
  const next = root.querySelector('[data-next]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const sceneInfo = scenes.map((node) => ({
    node, image: node.querySelector('img'),
    title: node.dataset.title,
    section: node.dataset.section,
    base: Number(node.dataset.baseScale || 1),
    zoom: Number(node.dataset.zoom || 0.14),
    portal: getComputedStyle(node).getPropertyValue('--portal-position').trim() || '50% 52%',
  }));

  let active = 0;
  let busy = false;
  let deadUntil = 0;
  let wheelSum = 0;
  let wheelLast = 0;
  let wheelSign = 0;
  let touchY = null;
  let destroyed = false;
  let videoRunning = false;
  const timers = new Set();
  const animations = new Set();
  const pad = (n) => String(n).padStart(2, '0');

  function animate(el, frames, options) {
    const animation = el.animate(frames, { fill: 'forwards', ...options });
    animations.add(animation);
    return animation.finished.catch(() => {}).then(() => {
      try { animation.commitStyles(); } catch (_) { /* unsupported browser: the scene settle will set styles */ }
      animation.cancel();
      animations.delete(animation);
      return animation;
    });
  }

  function delay(ms) {
    return new Promise((resolve) => {
      const id = window.setTimeout(() => { timers.delete(id); resolve(); }, ms);
      timers.add(id);
    });
  }

  function setIndexOpen(open) {
    if (!indexPanel) return;
    indexPanel.classList.toggle('is-open', open);
    indexPanel.setAttribute('aria-hidden', String(!open));
    indexToggle?.setAttribute('aria-expanded', String(open));
    indexPanel.inert = !open;
  }

  function updateUI() {
    const s = sceneInfo[active];
    count.textContent = `${pad(active + 1)}  /  ${pad(sceneInfo.length)}`;
    chapterName.textContent = s.title;
    chapterType.textContent = s.section;
    live.textContent = `${active + 1}번째 장면: ${s.title}`;
    const storyData = root.querySelectorAll('[data-scene]')[active].dataset;
    const hasStory = storyData.copyTitle && storyData.copyDescription;
    root.classList.toggle('has-story', !!hasStory);
    if (story) {
      story.hidden = !hasStory;
      if (hasStory) {
        story.dataset.position = storyData.copyPosition || 'right';
        storyEyebrow.textContent = storyData.copyEyebrow || '';
        storyTitle.textContent = storyData.copyTitle;
        storyDescription.textContent = storyData.copyDescription;
      }
    }
    railButtons.forEach((b, i) => {
      const selected = i === active;
      b.classList.toggle('is-active', selected);
      b.setAttribute('aria-current', selected ? 'step' : 'false');
    });
    jumpButtons.forEach((b) => b.classList.toggle('is-current', Number(b.dataset.goTo) === active));
    if (previous) previous.disabled = active === 0;
    if (next) next.disabled = active === sceneInfo.length - 1;
  }

  function settle(target) {
    sceneInfo.forEach(({ node, image, base }, i) => {
      const selected = i === target;
      node.classList.toggle('is-active', selected);
      node.style.visibility = selected ? 'visible' : 'hidden';
      node.style.opacity = selected ? '1' : '0';
      node.style.zIndex = selected ? '2' : '0';
      node.style.clipPath = 'none';
      image.style.transform = `scale(${base})`;
    });
    active = target;
    updateUI();
  }

  function bloom() {
    if (reduce.matches || !halo) return Promise.resolve();
    return animate(halo, [
      { opacity: 0, offset: 0 },
      { opacity: 0.13, offset: 0.56 },
      { opacity: 0, offset: 1 },
    ], { duration: 1040, easing: 'ease-in-out' });
  }

  async function ordinaryTransition(target) {
    const old = sceneInfo[active];
    const fresh = sceneInfo[target];
    fresh.node.style.visibility = 'visible';
    fresh.node.style.zIndex = '4';
    fresh.node.style.opacity = '1';
    fresh.node.style.clipPath = `circle(0% at ${old.portal})`;
    if (reduce.matches) { settle(target); return; }

    // Zoom only the outgoing image; keep the destination image at a fixed size.
    const zoom = animate(old.image, [
      { transform: `scale(${old.base})` },
      { transform: `scale(${old.base + old.zoom})` },
    ], { duration: 1180, easing: 'cubic-bezier(0.18, 0.76, 0.2, 1)' });
    const reveal = animate(fresh.node, [
      { clipPath: `circle(0% at ${old.portal})` },
      { clipPath: `circle(170% at ${old.portal})` },
    ], { duration: 1180, easing: 'cubic-bezier(0.22, 0.72, 0.17, 1)' });
    const glow = bloom();
    await Promise.all([zoom, reveal, glow]);
    settle(target);
  }

  async function doorOpeningTransition() {
    // Real supplied footage, not an artificial 2D rotation of the photo.
    // The original video starts with a closed door and opens into the bedroom.
    if (reduce.matches) { settle(1); return; }
    const destination = sceneInfo[1];
    const elapsedTimeout = 5500;
    video.style.display = 'block';
    video.style.visibility = 'visible';
    video.style.opacity = '0';
    try { video.currentTime = 0; } catch (_) { /* media not seekable yet */ }
    videoRunning = true;

    let finish;
    const ended = new Promise((resolve) => { finish = resolve; });
    const onEnd = () => finish();
    video.addEventListener('ended', onEnd, { once: true });
    const safetyTimer = window.setTimeout(onEnd, elapsedTimeout);
    timers.add(safetyTimer);

    try {
      // Make the actual first frame visible before playback, avoiding a black flash.
      await Promise.race([new Promise((resolve) => {
        if (video.readyState >= 2) return resolve();
        video.addEventListener('loadeddata', resolve, { once: true });
      }), delay(1200)]);
      if (destroyed) return;
      const fade = animate(video, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease-out' });
      const playPromise = video.play();
      if (playPromise) await playPromise;
      await fade;
      await Promise.race([ended, delay(elapsedTimeout)]);
    } catch (_) {
      // Autoplay denied/unsupported codec: keep the experience usable via a still transition.
      await delay(380);
    } finally {
      video.removeEventListener('ended', onEnd);
      window.clearTimeout(safetyTimer);
      timers.delete(safetyTimer);
    }
    if (destroyed) return;

    destination.node.style.visibility = 'visible';
    destination.node.style.opacity = '1';
    destination.node.style.zIndex = '3';
    destination.node.style.clipPath = 'none';
    destination.image.style.transform = 'scale(1)';
    // Video dissolves while the camera continues *forward* into the open doorway.
    // The arrival photo stays at 100% size: no shrink/expand rebound.
    const push = Promise.resolve();
    const dissolve = animate(video, [
      { opacity: 1, offset: 0 },
      { opacity: 0.95, offset: 0.17 },
      { opacity: 0, offset: 1 },
    ], { duration: 880, easing: 'ease-in-out' });
    await Promise.all([push, dissolve]);
    video.pause();
    video.style.opacity = '0';
    video.style.visibility = 'hidden';
    videoRunning = false;
    settle(1);
  }

  async function transition(target) {
    if (busy || destroyed || target < 0 || target >= sceneInfo.length || target === active) return;
    busy = true;
    setIndexOpen(false);
    root.classList.add('is-transitioning');
    try {
      if (active === 0 && target === 1) await doorOpeningTransition();
      else await ordinaryTransition(target);
    } finally {
      if (!destroyed) {
        root.classList.remove('is-transitioning');
        busy = false;
        wheelSum = 0;
        wheelLast = 0;
        // Prevent high-inertia trackpads from accidentally triggering another scene.
        deadUntil = performance.now() + 320;
      }
    }
  }

  function goOne(direction) { transition(active + direction); }
  function onWheel(event) {
    if (event.ctrlKey || event.metaKey) return; // don't trap browser zoom
    if (!indexPanel.classList.contains('is-open')) event.preventDefault();
    else return;
    const delta = event.deltaY;
    if (!delta || busy || performance.now() < deadUntil) return;
    const sign = Math.sign(delta);
    const now = performance.now();
    if (wheelSign !== sign || now - wheelLast > 220) wheelSum = 0;
    wheelLast = now;
    wheelSign = sign;
    // A trackpad gesture (many small deltas) or one wheel notch is one step.
    wheelSum += Math.abs(delta) * (event.deltaMode === 1 ? 15 : event.deltaMode === 2 ? 180 : 1);
    if (wheelSum >= 48) { wheelSum = 0; goOne(sign); }
  }
  function onTouchStart(event) { touchY = event.touches[0]?.clientY ?? null; }
  function onTouchEnd(event) {
    if (touchY === null || busy || performance.now() < deadUntil) return;
    const y = event.changedTouches[0]?.clientY;
    if (y === undefined) return;
    const diff = touchY - y;
    touchY = null;
    if (Math.abs(diff) > 52) goOne(Math.sign(diff));
  }
  function onKeyDown(event) {
    if (event.target?.closest?.('input, textarea, select, [contenteditable]')) return;
    if (event.key === 'Escape') { setIndexOpen(false); return; }
    if (indexPanel.classList.contains('is-open')) return;
    let delta = 0;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) delta = 1;
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) delta = -1;
    if (!delta) return;
    event.preventDefault();
    if (!busy && performance.now() >= deadUntil) goOne(delta);
  }

  const onClicks = [];
  function bind(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    onClicks.push([el, handler]);
  }
  bind(indexToggle, () => setIndexOpen(!indexPanel.classList.contains('is-open')));
  bind(indexClose, () => setIndexOpen(false));
  bind(previous, () => goOne(-1));
  bind(next, () => goOne(1));
  for (const b of jumpButtons) bind(b, () => transition(Number(b.dataset.goTo)));
  for (const b of railButtons) bind(b, () => transition(Number(b.dataset.rail)));

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  root.addEventListener('touchstart', onTouchStart, { passive: true });
  root.addEventListener('touchend', onTouchEnd, { passive: true });
  settle(0);
  video?.load();

  return () => {
    destroyed = true;
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('touchstart', onTouchStart);
    root.removeEventListener('touchend', onTouchEnd);
    for (const [el, fn] of onClicks) el.removeEventListener('click', fn);
    for (const t of timers) window.clearTimeout(t);
    for (const animation of animations) animation.cancel();
    if (videoRunning) video.pause();
  };
}
