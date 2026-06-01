'use client';

import './globals.css';
import { useState } from 'react';
import Sidebar from '@/app/components/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <html lang="en">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
          <main style={{
            marginLeft: collapsed ? 72 : 260,
            flex: 1,
            padding: '32px',
            minHeight: '100vh',
            background: '#f0f2f5',
            transition: 'margin-left 0.2s ease',
          }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}