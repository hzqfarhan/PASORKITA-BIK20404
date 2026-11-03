import BrandedError from '../../components/BrandedError';

export const metadata = { title: 'PASOR HUSSEIN — Error experience', robots: { index: false, follow: false } };

export default function ErrorPreview() {
  return <BrandedError preview/>;
}
