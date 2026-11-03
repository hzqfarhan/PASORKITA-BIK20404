import Script from 'next/script';
import markup from '../components/marketplace-markup.json';
import PwaControls from '../components/PwaControls';
import InitialLoading from '../components/InitialLoading';

export default function MarketplacePage() {
  return (
    <>
      {/* Build-time local markup only. User input is never injected into this boundary. */}
      <div id="pasor-marketplace-root" dangerouslySetInnerHTML={{ __html: markup.html }} />
      <PwaControls />
      <InitialLoading />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
