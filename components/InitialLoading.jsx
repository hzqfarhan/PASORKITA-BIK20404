'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import BrandedLoader from './BrandedLoader';

export default function InitialLoading() {
  const [phase, setPhase] = useState('loading');
  const cleanupRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/') return;
    setPhase('loading');
    let disposed = false;
    let fontsReady = !document.fonts;
    let runtimeReady = Boolean(window.PasorPreview);
    let exitTimer;
    const marketplace = document.getElementById('pasor-marketplace-root');
    marketplace?.setAttribute('inert', '');
    const finish = () => {
      if (disposed || !fontsReady || !runtimeReady) return;
      window.clearTimeout(timeout);
      window.clearInterval(poll);
      marketplace?.removeAttribute('inert');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPhase('done');
      else { setPhase('leaving'); exitTimer = window.setTimeout(() => setPhase('done'), 320); }
    };
    const onReady = () => { runtimeReady = true; finish(); };
    const poll = window.setInterval(() => { if (window.PasorPreview) onReady(); }, 100);
    const timeout = window.setTimeout(() => { if (!disposed) { window.clearInterval(poll); marketplace?.removeAttribute('inert'); setPhase('slow'); } }, 8000);
    window.addEventListener('pasor:ready', onReady);
    Promise.resolve(document.fonts?.ready).then(() => { fontsReady = true; finish(); });
    const cleanup = () => { disposed = true; marketplace?.removeAttribute('inert'); window.clearInterval(poll); window.clearTimeout(timeout); window.clearTimeout(exitTimer); window.removeEventListener('pasor:ready', onReady); };
    cleanupRef.current = cleanup;
    return cleanup;
  }, [pathname]);

  if (pathname !== '/' || phase === 'done') return null;
  return <div className={`ph-boot-overlay ${phase === 'leaving' ? 'ph-boot-leaving' : ''}`}><BrandedLoader idPrefix="ph-boot" title={phase === 'slow' ? 'Taking a little longer than usual.' : undefined} label={phase === 'slow' ? 'The marketplace has not finished loading.' : undefined}>{phase === 'slow' && <div className="ph-loading-recovery"><p>You can retry, or continue to the page while it finishes.</p><div><button type="button" className="ph-system-primary" onClick={() => window.location.reload()}>Try again</button><button type="button" className="ph-system-secondary" onClick={() => { cleanupRef.current?.(); setPhase('done'); }}>Continue to page</button></div></div>}</BrandedLoader></div>;
}
