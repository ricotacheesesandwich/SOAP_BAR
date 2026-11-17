import { useEffect, type CSSProperties } from 'react';
import { chapters } from './chapters.js';
import { initExperience } from './experience.js';
import './styles.css';

const arrow = (left: boolean) => left
  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m14 5-7 7 7 7" /></svg>
  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m10 5 7 7-7 7" /></svg>;

export default function App() {
  useEffect(() => initExperience(), []);
  return (
    <main className="site" data-experience aria-label="SOAP BAR 공간 둘러보기">
      <div className="stage" aria-label="스크롤 한 번에 다음 장면으로 자동 전환되는 공간 체험">
        {chapters.map((ch, i) => (
          <section
            className={`scene${i === 0 ? ' is-active' : ''}`}
            data-scene={ch.id}
            data-title={ch.title}
            data-section={ch.section}
            data-base-scale={ch.baseScale}
            data-zoom={ch.zoom}
            data-copy-eyebrow={ch.story?.eyebrow}
            data-copy-title={ch.story?.title}
            data-copy-description={ch.story?.description}
            data-copy-position={ch.story?.position}
            key={ch.id}
            style={{
              '--image-position': ch.position,
              '--base-scale': ch.baseScale,
              '--mobile-position': ch.mobilePosition ?? '50% center',
              '--transform-origin': ch.origin,
              '--portal-position': ch.portal,
            } as CSSProperties}
            aria-label={`${i + 1}. ${ch.title}`}
          >
            <img className="scene__image" src={ch.image} alt={ch.title} decoding="async" fetchPriority={i < 2 ? 'high' : 'auto'} />
          </section>
        ))}
        <video
          data-door-video className="door-video"
          src={`${import.meta.env.BASE_URL}assets/door-opening.mp4`} poster={`${import.meta.env.BASE_URL}assets/door-neutral.webp`}
          muted playsInline preload="auto" aria-hidden="true"
        />
        <div data-transition-halo className="transition-halo" aria-hidden="true" />
      </div>

      <header className="site-header">
        <button type="button" className="brand" data-go-to={0} aria-label="처음 장면으로 이동">
          <span className="brand__ball" aria-hidden="true" />
          <span className="brand__text">soap <em>bar.</em></span>
        </button>
        <div className="header-right">
          <span data-count className="chapter-count">01  /  {String(chapters.length).padStart(2, '0')}</span>
          <button type="button" className="index-button" data-index-toggle aria-controls="soapbar-index" aria-expanded="false">INDEX +</button>
        </div>
      </header>

      <div className="scene-story" data-story hidden>
        <span className="scene-story__eyebrow" data-story-eyebrow />
        <h1 className="scene-story__title" data-story-title />
        <p className="scene-story__description" data-story-description />
      </div>

      <div className="scene-id" aria-hidden="true">
        <span className="scene-id__section" data-chapter-type>{chapters[0].section}</span>
        <span className="scene-id__name" data-chapter-name>{chapters[0].title}</span>
      </div>
      <nav className="scene-rail" aria-label="장면 바로가기">
        {chapters.map((ch, i) => (
          <button data-rail={i} className={`rail-dot${i === 0 ? ' is-active' : ''}`} type="button" key={ch.id} aria-label={`${ch.title} 장면으로 이동`} aria-current={i === 0 ? 'step' : undefined} />
        ))}
      </nav>
      <button className="go-arrow go-arrow--prev" data-previous type="button" aria-label="이전 장면" disabled>{arrow(true)}</button>
      <button className="go-arrow go-arrow--next" data-next type="button" aria-label="다음 장면">{arrow(false)}</button>
      <div className="sr-only" data-live aria-live="polite" aria-atomic="true" />

      <aside id="soapbar-index" className="index-panel" data-index-panel aria-hidden="true" aria-label="전체 장면 목록" inert>
        <div className="index-panel__head"><span>THE SPACE INDEX</span><button className="index-panel__close" data-index-close aria-label="목차 닫기" type="button">×</button></div>
        <h1 className="index-panel__title">Room<br />by room.</h1>
        <nav className="index-panel__list" aria-label="장면 목록">
          {chapters.map((ch,i) => <button key={ch.id} className={`index-panel__item${i === 0 ? ' is-current' : ''}`} type="button" data-go-to={i}><span>{String(i + 1).padStart(2, '0')}</span>{ch.title}</button>)}
        </nav>
        <p className="index-panel__note">Designed to be explored, one moment at a time.<br />SOAP BAR — SPATIAL PORTFOLIO, 2026</p>
      </aside>
    </main>
  );
}
