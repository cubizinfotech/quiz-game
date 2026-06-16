import { useEffect, useRef } from 'react';

export default function AdBlock({ ad }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ad || ad.adType !== 'adsense' || !containerRef.current) return;

    const existing = containerRef.current.querySelector('script');
    if (existing) return;

    const range = document.createRange();
    range.selectNode(containerRef.current);
    const fragment = range.createContextualFragment(ad.content);
    containerRef.current.appendChild(fragment);

    if (window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch (_) {}
    }
  }, [ad]);

  if (!ad) return null;

  if (ad.adType === 'html') {
    return (
      <div
        className="w-full overflow-hidden rounded-lg"
        dangerouslySetInnerHTML={{ __html: ad.content }}
      />
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-lg min-h-[60px] flex items-center justify-center" />
  );
}
