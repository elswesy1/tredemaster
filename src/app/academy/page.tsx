import { Metadata } from 'next';
import AcademyClient from './client';

export const metadata: Metadata = {
  title: 'أكاديمية التداول | TradeMaster Academy',
  description: 'تعلم التداول من الصفر إلى الاحتراف - دورات مجانية في التحليل الفني والأساسي وإدارة المخاطر وسيكولوجية التداول',
  keywords: ['تعلم التداول', 'دورات تداول', 'التحليل الفني', 'إدارة المخاطر', 'سيكولوجية التداول', 'تعليم مالي', 'تداول الأسهم', 'تداول العملات', 'المؤشرات'],
  openGraph: {
    title: 'أكاديمية التداول | TradeMaster Academy',
    description: 'تعلم التداول من الصفر إلى الاحتراف',
    type: 'website',
    locale: 'ar_EG',
    images: ['/icons/icon-512.png'],
  },
};

export default function AcademyPage() {
  return <AcademyClient />;
}
