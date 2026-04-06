'use client';

import { useEffect, useRef, memo } from 'react';

interface EconomicCalendarProps {
  theme?: 'light' | 'dark';
  locale?: 'ar' | 'en';
  width?: string | number;
  height?: string | number;
}

const EconomicCalendar = ({
  theme = 'dark',
  locale = 'ar',
  width = '100%',
  height = 600,
}: EconomicCalendarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width,
      height,
      colorTheme: theme,
      isTransparent: false,
      locale,
      importanceFilter: '-1,0,1', // High, Medium, Low
      countryFilter: 'us,gb,de,eu,fr,it,es,jp,cn,sa,ae', // Major economies + MENA
      currencyFilter: 'USD,EUR,GBP,JPY,CHF,AUD,CAD,NZD,SAR,AED',
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, locale, width, height]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default memo(EconomicCalendar);
