'use client';

import { useEffect, useRef, useState } from 'react';

export default function PwaControls() {
  const [online, setOnline] = useState(true);
  const [workerStatus, setWorkerStatus] = useState('starting');
  const [installed, setInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [platform, setPlatform] = useState('desktop');
  const helpRef = useRef(null);
  const installButtonRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let registration;
    let idleTimer;
    const standalone = window.matchMedia('(display-mode: standalone)');
    const updateOnline = () => setOnline(navigator.onLine);
    const updateInstalled = () => setInstalled(standalone.matches || navigator.standalone === true);
    const onInstallPrompt = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); setShowHelp(false); };
    const agent = navigator.userAgent;
    setPlatform(/iPad|iPhone|iPod/i.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'ios' : /Android/i.test(agent) ? 'android' : 'desktop');
    updateOnline();
    updateInstalled();
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    standalone.addEventListener?.('change', updateInstalled);

    const cacheLoadedAssets = () => {
      if (disposed) return Promise.resolve(false);
      const worker = navigator.serviceWorker?.controller || registration?.active;
      if (!worker) return Promise.resolve(false);
      const urls = new Set();
      const collect = (input) => {
        try {
          const url = new URL(input, window.location.href);
          if (url.origin === window.location.origin && (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/'))) urls.add(url.href);
        } catch { /* Ignore unavailable resource timing entries. */ }
      };
      performance.getEntriesByType('resource').forEach((entry) => collect(entry.name));
      document.querySelectorAll('script[src], link[href], img[src]').forEach((element) => collect(element.src || element.href));
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        const timeout = window.setTimeout(() => { channel.port1.close(); resolve(false); }, 12000);
        channel.port1.onmessage = (event) => {
          if (event.data?.type !== 'CACHE_COMPLETE') return;
          window.clearTimeout(timeout);
          channel.port1.close();
          resolve(event.data.ok === true);
        };
        worker.postMessage({ type: 'CACHE_URLS', urls: [...urls].slice(0, 400) }, [channel.port2]);
      });
    };

    const setupWorker = async () => {
      if (!('serviceWorker' in navigator) || !window.isSecureContext) {
        if (!disposed) setWorkerStatus('unsupported');
        return;
      }
      if (process.env.NODE_ENV !== 'production') {
        // Keep development current when this origin previously ran a production preview.
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.filter((entry) => {
          const script = entry.active?.scriptURL || entry.waiting?.scriptURL || entry.installing?.scriptURL;
          return script && new URL(script).origin === location.origin && new URL(script).pathname === '/sw.js';
        }).map((entry) => entry.unregister()));
        if (!disposed) setWorkerStatus('development');
        return;
      }
      try {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        await navigator.serviceWorker.ready;
        if (disposed) return;
        const assetsReady = await cacheLoadedAssets();
        if (disposed) return;
        setWorkerStatus(assetsReady ? 'ready' : 'error');
        idleTimer = window.setTimeout(cacheLoadedAssets, 1500);
        navigator.serviceWorker.addEventListener('controllerchange', cacheLoadedAssets);
        window.addEventListener('load', cacheLoadedAssets);
        registration.update().catch(() => { /* A cached preview can remain available offline. */ });
      } catch {
        if (!disposed) setWorkerStatus('error');
      }
    };
    setupWorker().catch(() => { if (!disposed) setWorkerStatus('error'); });
    return () => {
      disposed = true;
      window.clearTimeout(idleTimer);
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('load', cacheLoadedAssets);
      navigator.serviceWorker?.removeEventListener('controllerchange', cacheLoadedAssets);
      standalone.removeEventListener?.('change', updateInstalled);
    };
  }, []);

  useEffect(() => {
    const dialog = helpRef.current;
    if (!dialog) return;
    if (showHelp && !dialog.open) dialog.showModal();
    if (!showHelp && dialog.open) dialog.close();
    document.body.classList.toggle('pwa-help-open', showHelp);
    return () => document.body.classList.remove('pwa-help-open');
  }, [showHelp]);

  async function install() {
    if (!installPrompt) { setShowHelp(true); return; }
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      setShowHelp(true);
    } finally { setInstallPrompt(null); }
  }

  const status = !online ? 'offline' : workerStatus;
  return (
    <>
      <div className="pwa-controls" data-pwa-status={status}>
        {!installed && <button className="pwa-install-button" ref={installButtonRef} onClick={install} title="Install PASOR on this device">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M9 12h6m-3-3v6M10 19h4" /></svg>
          <span>Install PASOR</span><span className="pwa-install-dot" aria-hidden="true" />
        </button>}
        {!online && <span className="pwa-status is-offline" role="status"><span />Offline · your local preview is still here</span>}
        {online && workerStatus === 'error' && <span className="pwa-status is-error" role="status">Offline setup unavailable. Refresh to retry.</span>}
        <span className="pwa-screen-reader-status" role="status">{online && workerStatus === 'ready' ? 'PASOR is ready to use offline after this visit.' : ''}</span>
      </div>
      <dialog className="pwa-help-dialog" ref={helpRef} onClose={() => { setShowHelp(false); installButtonRef.current?.focus(); }} onClick={(event) => { if (event.target === event.currentTarget) setShowHelp(false); }} aria-labelledby="pwa-help-title">
        <button className="pwa-help-close" onClick={() => setShowHelp(false)} aria-label="Close installation instructions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
        <div className="pwa-help-mark" aria-hidden="true">p<span>.</span></div>
        <span className="pwa-help-eyebrow">A LITTLE CLOSER TO CAMPUS</span>
        <h2 id="pwa-help-title">Your campus.<br />One tap away.</h2>
        <p>Keep PASOR on your home screen and revisit this preview offline.</p>
        {platform === 'ios' ? <ol><li>Open this page in Safari.</li><li>Tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</li><li>Choose <strong>Add</strong> to keep PASOR close.</li></ol> : platform === 'android' ? <ol><li>Open this page in Chrome or Edge.</li><li>Open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation.</li></ol> : <ol><li>Open this page in Chrome or Edge.</li><li>Use the install icon in the address bar, or choose <strong>Install PASOR</strong> from the browser menu.</li><li>If your browser does not offer installation, bookmark PASOR to come back later.</li></ol>}
        <p className="pwa-help-note">Installation depends on your browser. Offline support is enabled in the production preview on localhost or HTTPS. Campus authentication and live transactions are coming later.</p>
        <button className="pwa-help-done" onClick={() => setShowHelp(false)}>Lovely, got it <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" /></svg></button>
      </dialog>
    </>
  );
}
