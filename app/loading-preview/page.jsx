import BrandedLoader from '../../components/BrandedLoader';

export const metadata = { title: 'PASOR HUSSEIN — Loading experience', robots: { index: false, follow: false } };

export default function LoadingPreview() {
  return <BrandedLoader idPrefix="ph-loading-preview" showLink><p className="ph-preview-caption">LOADING SCREEN PREVIEW</p></BrandedLoader>;
}
