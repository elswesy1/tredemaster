import { Metadata } from 'next';
import DashboardClient from './client';

export const metadata: Metadata = {
  title: 'لوحة التحكم | Dashboard - TradeMaster',
  description: 'إدارة تداولاتك ومحفظتك ويومياتك - لوحة تحكم شاملة للمتداولين المحترفين',
  keywords: ['لوحة تحكم', 'إدارة التداول', 'يومية التداول', 'محفظة الأصول', 'تحليل الأداء'],
};

export default function DashboardPage() {
  return <DashboardClient />;
}