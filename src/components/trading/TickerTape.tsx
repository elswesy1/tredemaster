'use client';

import { useEffect, useRef, memo } from 'react';

interface TickerTapeProps {
  theme?: 'light' | 'dark';
  locale?: 'ar' | 'en';
}

const TickerTape = ({ theme = 'dark', locale = 'ar' }: TickerTapeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'OANDA:GER40USD', title: 'DAX 40' },
        { proName: 'CURRENCYCOM:US100', title: 'NAS100' },
        { proName: 'PEPPERSTONE:US500', title: 'US500' },
        { proName: 'OANDA:XAUUSD', title: 'Gold' },
        { proName: 'OANDA:WTIUSD', title: 'WTI' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC' },
        { proName: 'OANDA:EURUSD', title: 'EUR/USD' },
        { proName: 'OANDA:GBPUSD', title: 'GBP/USD' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: theme,
      locale,
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [theme, locale]);

  return (
    <div className="tradingview-widget-container" style={{ width: '100%', height: 46 }}>
      <div
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default memo(TickerTape);