'use client';

import BrandedError from '../components/BrandedError';

export default function ErrorPage({ retry, reset }) {
  return <BrandedError onRetry={retry || reset}/>;
}
