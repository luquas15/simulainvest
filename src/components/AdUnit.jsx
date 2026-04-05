import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-2711666517501481';

/**
 * Dois slots configurados no AdSense:
 *  STANDARD  — formato "auto" (responsivo)        slot 2437371973
 *  RELAXED   — formato "autorelaxed" (in-article) slot 6514451425
 */
export const AD_SLOTS = {
  STANDARD:   '2437371973',  // responsivo, data-full-width-responsive
  RELAXED:    '6514451425',  // in-article / autorelaxed
  // aliases para páginas existentes
  HORIZONTAL: '2437371973',
  SQUARE:     '2437371973',
  VERTICAL:   '2437371973',
};

export default function AdUnit({ slot, className = '' }) {
  const pushed = useRef(false);
  const isRelaxed = slot === AD_SLOTS.RELAXED;

  useEffect(() => {
    if (!slot || pushed.current) return;
    const raf = requestAnimationFrame(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {}
    });
    return () => cancelAnimationFrame(raf);
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={`overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format={isRelaxed ? 'autorelaxed' : 'auto'}
        {...(!isRelaxed && { 'data-full-width-responsive': 'true' })}
      />
    </div>
  );
}
