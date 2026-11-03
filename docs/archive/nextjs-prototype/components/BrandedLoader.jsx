export function FacetedMark({ className = '', idPrefix = 'ph-mark' }) {
  return (
    <svg className={className} viewBox="0 0 240 225" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}-front`} x1="72" y1="53" x2="165" y2="179" gradientUnits="userSpaceOnUse"><stop stopColor="#AF7086"/><stop offset=".55" stopColor="#7B304B"/><stop offset="1" stopColor="#552038"/></linearGradient>
        <linearGradient id={`${idPrefix}-gold`} x1="96" y1="72" x2="144" y2="147" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF3CF"/><stop offset=".45" stopColor="#E8CA8D"/><stop offset="1" stopColor="#B08A4C"/></linearGradient>
        <linearGradient id={`${idPrefix}-small`} x1="40" y1="62" x2="68" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#F6E4C3"/><stop offset="1" stopColor="#C6A16B"/></linearGradient>
        <filter id={`${idPrefix}-shadow`} x="0" y="0" width="240" height="225" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>
      <ellipse cx="121" cy="196" rx="66" ry="12" fill="#6E4354" fillOpacity=".12" filter={`url(#${idPrefix}-shadow)`}/>
      <ellipse cx="123" cy="123" rx="99" ry="40" transform="rotate(-25 123 123)" stroke="#D4C3A7" strokeWidth="1"/>
      <ellipse cx="123" cy="123" rx="110" ry="54" transform="rotate(-25 123 123)" stroke="#E9DDCA" strokeWidth=".7" strokeDasharray="2 5"/>
      <g className="ph-load-token"><path d="M116 24 183 56 187 144 124 184 56 149 53 63Z" fill="#58233B"/><path d="m116 24 67 32-17 14-54-26-46 31-13-12Z" fill="#C08B98"/><path d="m183 56 4 88-63 40-1-20 46-32-3-62Z" fill="#491E34"/><path d="m112 44 54 26 3 62-46 32-54-28-3-61Z" fill={`url(#${idPrefix}-front)`}/><path d="m112 44 11 120-54-28-3-61Z" fill="#F6D1CA" fillOpacity=".06"/><path d="m112 44 54 26-43 94" stroke="#E1B6BD" strokeOpacity=".15"/>
        <path d="M95 75v65l15 7v-23l15 6c17 6 31-3 31-18 0-13-9-24-24-30l-22-9Zm15 17 17 6c8 3 13 8 13 14 0 7-6 10-13 7l-17-6Z" fill="#6B3E3B" transform="translate(1 3)"/><path d="M93 72v65l15 7v-23l15 6c17 6 31-3 31-18 0-13-9-24-24-30l-22-9Zm15 17 17 6c8 3 13 8 13 14 0 7-6 10-13 7l-17-6Z" fill={`url(#${idPrefix}-gold)`}/>
      </g>
      <g className="ph-load-satellite ph-load-satellite-one"><path d="m42 57 16-7 16 13-3 20-18 7-15-14Z" fill={`url(#${idPrefix}-small)`}/><path d="m42 57 16 13 16-7-16-13Z" fill="#FFF1D3"/><path d="m58 70-5 20 18-7 3-20Z" fill="#B78F59"/><path d="m42 57 16 13-5 20-15-14Z" fill="#DDC091"/></g>
      <g className="ph-load-satellite ph-load-satellite-two"><path d="m191 134 14 6 4 15-12 10-15-6-2-15Z" fill="#AB7C87"/><path d="m191 134 14 6-12 9-13-5Z" fill="#D2AAB2"/><path d="m205 140 4 15-12 10-4-16Z" fill="#744257"/></g>
      <path d="m181 30 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#C3A36B"/><path d="m45 158 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#C7AA7D"/>
      <circle cx="204" cy="76" r="3" fill="#D8C6A5"/>
    </svg>
  );
}

export function LoadingCircle({ label = 'Loading', className = '' }) {
  return (
    <span className={`ph-loading-circle ${className}`} role="img" aria-label={label}>
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><circle cx="32" cy="32" r="25" stroke="#E6DAC8" strokeWidth="1"/>{Array.from({ length: 12 }, (_, index) => <path key={index} d="m29 3 6 0 2 10-10 0Z" transform={`rotate(${index * 30} 32 32)`} fill={index === 0 ? '#C6A263' : '#80364E'} opacity={.12 + index * .073}/>) }<path d="m32 22 9 5v10l-9 5-9-5V27Z" fill="#F0E4D0" stroke="#CAB48D" strokeWidth=".7"/><path d="m32 22 9 5-9 5-9-5Z" fill="#FBF2DF"/><path d="m32 32 9-5v10l-9 5Z" fill="#D5BD91"/></svg>
    </span>
  );
}

export function LoadingBar({ label = 'Preparing your campus marketplace' }) {
  return <div className="ph-loading-bar" role="progressbar" aria-label={label} aria-valuetext="Loading"><span className="ph-loading-bar-track"><span className="ph-loading-bar-fill"/><span className="ph-loading-bar-light"/></span><span className="ph-loading-bar-end"/></div>;
}

export default function BrandedLoader({ title = 'Good things are coming closer.', label = 'Preparing your campus marketplace', fullScreen = true, showLink = false, children, idPrefix = 'ph-loading' }) {
  return (
    <section className={`ph-system-screen ph-loader-screen ${fullScreen ? 'ph-system-full' : ''}`} aria-busy="true" aria-label={label}>
      <div className="ph-system-mesh" aria-hidden="true"/><span className="ph-system-facet ph-facet-one" aria-hidden="true"/><span className="ph-system-facet ph-facet-two" aria-hidden="true"/>
      <a className="ph-system-brand" href="/" aria-label="PASOR HUSSEIN marketplace"><span className="ph-brand-cube" aria-hidden="true"><svg viewBox="0 0 40 44" fill="none"><path d="m19 1 19 10v23L19 44 1 33V11Z" fill="#6B2B43"/><path d="m19 1 19 10-19 11L1 11Z" fill="#B57D8E"/><path d="M19 22v22L1 33V11Z" fill="#8F425A"/><path d="M12 14v17l4 2v-6l4 2c5 2 9-1 9-5s-3-7-7-9l-6-3Zm4 5 5 2c2 1 3 2 3 4s-1 2-3 1l-5-2Z" fill="#F1D9A7"/></svg></span><span>PASOR HUSSEIN<small>THE UTHM MARKETPLACE</small></span></a>
      <div className="ph-loading-content"><FacetedMark className="ph-loading-art" idPrefix={idPrefix}/><div className="ph-system-eyebrow">YOUR CAMPUS. YOUR COMMUNITY.</div><h1>{title}</h1><p className="ph-loading-copy">A little local. A lot to look forward to.</p><div className="ph-loading-indicators" role="status" aria-live="polite"><LoadingCircle label="Marketplace loading"/><span>{label}</span></div><LoadingBar label={label}/>{children}</div>
      <div className="ph-system-footer"><span>Made for the people who make UTHM.</span>{showLink ? <a href="/">Back to the marketplace <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></a> : <span className="ph-footer-rule" aria-hidden="true"/>}</div>
    </section>
  );
}
