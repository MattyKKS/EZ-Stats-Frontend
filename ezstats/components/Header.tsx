'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload } from 'lucide-react';

const PAGES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':    { title: 'Dashboard',    subtitle: 'Your team performance overview' },
  '/team-profile': { title: 'Team Profile', subtitle: 'Manage your team details and squad' },
  '/upload-video': { title: 'Upload Video', subtitle: 'Upload a football match video for AI-powered analysis' },
  '/analysis':     { title: 'Analysis',     subtitle: 'All your match video analyses' },
};

export default function Header() {
  const pathname = usePathname();
  const page = Object.entries(PAGES).find(([key]) => pathname.startsWith(key))?.[1]
    ?? { title: 'EzStats', subtitle: '' };

  return (
    <header style={{
      height: 72,
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      top: 0,
      zIndex: 50,
    }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
          {page.title}
        </h1>
        <p style={{ fontSize: 14, color: '#8E8E8E', margin: 0 }}>
          {page.subtitle}
        </p>
      </div>

      <Link href="/upload-video" style={{ textDecoration: 'none' }}>
        <button className="btn-primary">
          <Upload size={16} />
            Upload Video
        </button>
      </Link>
    </header>
  );
}