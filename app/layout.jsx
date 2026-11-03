import markup from '../components/marketplace-markup.json';

export const metadata = {
  title: 'PASOR — Your campus. Your marketplace.',
  description: 'Food, services, preloved finds and campus businesses. A marketplace for the UTHM community.',
  applicationName: 'PASOR HUSSEIN',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'PASOR', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: '/assets/favicon.svg', type: 'image/svg+xml' }, { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#782e42' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/jakarta-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {markup.styles.map((href) => <link key={href} rel="stylesheet" href={href} />)}
        <link rel="stylesheet" href="/pwa.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
