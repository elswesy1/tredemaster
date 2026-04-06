'use client';

import { useEffect, useRef, memo } from 'react';

interface MarketOverviewProps {
  theme?: 'light' | 'dark';
  locale?: 'ar' | 'en';
  width?: string | number;
  height?: string | number;
}

const MarketOverview = ({
  theme = 'dark',
  locale = 'ar',
  width = '100%',
  height = 400,
}: MarketOverviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width,
      height,
      locale,
      symbolsGroups: [
        {
          name: 'المؤشرات',
          originalName: 'Indices',
          symbols: [
            { name: 'OANDA:GER40USD', displayName: 'DAX 40' },
            { name: 'CURRENCYCOM:US100', displayName: 'NAS100' },
            { name: 'OANDA:UK100GBP', displayName: 'UK100' },
            { name: 'PEPPERSTONE:US500', displayName: 'US500' },
            { name: 'OANDA:JP225USD', displayName: 'JP225' },
          ],
        },
        {
          name: 'العملات',
          originalName: 'Forex',
          symbols: [
            { name: 'OANDA:EURUSD', displayName: 'EUR/USD' },
            { name: 'OANDA:GBPUSD', displayName: 'GBP/USD' },
            { name: 'OANDA:USDJPY', displayName: 'USD/JPY' },
            { name: 'OANDA:USDCHF', displayName: 'USD/CHF' },
            { name: 'OANDA:AUDUSD', displayName: 'AUD/USD' },
          ],
        },
        {
          name: 'الذهب والمعادن',
          originalName: 'Metals',
          symbols: [
            { name: 'OANDA:XAUUSD', displayName: 'XAU/USD' },
            { name: 'OANDA:XAGUSD', displayName: 'XAG/USD' },
          ],
        },
        {
          name: 'النفط والطاقة',
          originalName: 'Energy',
          symbols: [
            { name: 'OANDA:WTIUSD', displayName: 'WTI' },
            { name: 'OANDA:BCOUSD', displayName: 'Brent' },
          ],
        },
        {
          name: 'العملات الرقمية',
          originalName: 'Crypto',
          symbols: [
            { name: 'BINANCE:BTCUSDT', displayName: 'BTC/USDT' },
            { name: 'BINANCE:ETHUSDT', displayName: 'ETH/USDT' },
          ],
        },
      ],
      showSymbolLogo: true,
      isTransparent: false,
      colorTheme: theme,
      largeChartUrl: '',
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

export default memo(MarketOverview);
