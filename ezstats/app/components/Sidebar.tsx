'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Users, Upload, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={20} /> },
  { href: '/team-profile', label: 'Team Profile', icon: <Users size={20} /> },
  { href: '/upload-video', label: 'Upload Video', icon: <Upload size={20} /> },
  { href: '/analysis',     label: 'Analysis',     icon: <BarChart2 size={20} /> },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const width = collapsed ? 72 : 260;

  return (
    <aside style={{
      width,
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e5e7eb',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      transition: 'width 0.2s ease',
      overflow: 'hidden',
    }}>

      {/* Logo + collapse button */}
      <div style={{
        padding: '28px 16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <Image src="/logo.png" alt="EzStats" width={130} height={40} style={{ objectFit: 'contain' }} />
        )}
        <button
          onClick={onToggle}
          style={{
            border: '1px solid #e5e7eb', borderRadius: 8,
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, color: '#6b7280', flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} title={collapsed ? label : undefined}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                background: active ? 'rgba(5,113,75,0.1)' : 'transparent',
                color: active ? '#05714B' : '#222222',
                fontWeight: active ? 600 : 500,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderRight: active ? '3px solid #05714B' : '3px solid transparent',
                whiteSpace: 'nowrap',
              }}>
                {icon}
                {!collapsed && label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px 10px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 12, padding: '11px 14px', borderRadius: 10,
          color: '#222222', fontWeight: 500, fontSize: 15, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>
          <LogOut size={20} />
          {!collapsed && 'Logout'}
        </div>
      </div>
    </aside>
  );
}