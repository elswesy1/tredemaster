import { Metadata } from 'next';
import ChartsClient from './client';

export const metadata: Metadata = {
  title: 'الرسوم البيانية | Trading Charts - TradeMaster',
  description: 'تحليل فني متقدم مع TradingView - رسوم بيانية تفاعلية للمؤشرات والعملات والمعادن والعملات الرقمية',
  keywords: ['رسوم بيانية', 'تحليل فني', 'TradingView', 'DAX', 'NASDAQ', 'Gold', 'Forex', 'مخططات التداول'],
};

export default function ChartsPage() {
  return <ChartsClient />;
}