'use client';

import { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  locale?: 'ar' | 'en';
  width?: string | number;
  height?: string | number;
  hideSideToolbar?: boolean;
  allowSymbolChange?: boolean;
  saveImage?: boolean;
  studies?: string[];
}

const TradingViewWidget = ({
  symbol = 'OANDA:GER40USD', // DAX default
  interval = '1',
  theme = 'dark',
  locale = 'ar',
  width = '100%',
  height = 500,
  hideSideToolbar = false,
  allowSymbolChange = true,
  saveImage = true,
  studies = ['RSI@tv-basicstudies', 'Volume@tv-basicstudies'],
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Africa/Cairo',
      theme,
      style: '1',
      locale,
      enable_publishing: false,
      withdateranges: true,
      hide_side_toolbar: hideSideToolbar,
      allow_symbol_change: allowSymbolChange,
      save_image: saveImage,
      container_id: 'tradingview-widget',
      studies,
      support_host: 'https://www.tradingview.com',
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, locale, hideSideToolbar, allowSymbolChange, saveImage, studies]);

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div
        id="tradingview-widget"
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default memo(TradingViewWidget);
