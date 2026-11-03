'use client';

import BrandedError from '../components/BrandedError';

export default function GlobalError({ retry, reset }) {
  return <html lang="en"><head><title>PASOR HUSSEIN — A little detour</title><meta name="viewport" content="width=device-width, initial-scale=1"/><link rel="stylesheet" href="/loading.css"/></head><body style={{ margin: 0 }}><BrandedError onRetry={retry || reset}/></body></html>;
}
