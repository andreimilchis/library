'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Zap,
  LayoutDashboard,
  Megaphone,
  Mail,
  Palette,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShoppingBag,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Ads Manager',
    href: '/ads',
    icon: Megaphone,
    submenu: [
      { name: 'All Campaigns', href: '/ads' },
      { name: 'Meta Ads', href: '/ads/meta' },
      { name: 'Google Ads', href: '/ads/google' },
      { name: 'TikTok Ads', href: '/ads/tiktok' },
    ],
  },
  {
    name: 'Email Marketing',
    href: '/emails',
    icon: Mail,
    submenu: [
      { name: 'Campaigns', href: '/emails' },
      { name: 'Automations', href: '/emails/automations' },
      { name: 'Subscribers', href: '/emails/subscribers' },
      { name: 'Templates', href: '/emails/templates' },
    ],
  },
  {
    name: 'Creative Studio',
    href: '/creative',
    icon: Palette,
    submenu: [
      { name: 'All Creatives', href: '/creative' },
      { name: 'Banner Creator', href: '/creative/banners' },
      { name: 'Video Creator', href: '/creative/videos' },
      { name: 'Templates', href: '/creative/templates' },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    name: 'Products',
    href: '/products',
    icon: ShoppingBag,
  },
]

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help & Support', href: '/support', icon: HelpCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Ads Manager', 'Email Marketing'])

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-brand">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-dark-800 block leading-tight">
              Ecomm<span className="text-gradient">Suite</span>
            </span>
            <span className="text-xs text-dark-400">.AI</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav custom-scrollbar">
        <div className="space-y-1">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full ${isActive(item.href) ? 'nav-link-active' : 'nav-link'}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedMenus.includes(item.name) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedMenus.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            pathname === subitem.href
                              ? 'text-primary-600 bg-primary-50 font-medium'
                              : 'text-dark-500 hover:text-dark-700 hover:bg-dark-50'
                          }`}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={isActive(item.href) ? 'nav-link-active' : 'nav-link'}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Upgrade Banner */}
        <div className="mt-8 p-4 bg-brand-gradient-soft rounded-xl border border-primary-100">
          <h4 className="font-semibold text-dark-800 mb-1">Upgrade to Growth</h4>
          <p className="text-sm text-dark-500 mb-3">
            Get AI copywriting, advanced analytics, and more.
          </p>
          <Link href="/settings/billing" className="btn-primary btn-sm w-full">
            Upgrade Now
          </Link>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="sidebar-footer">
        <div className="space-y-1">
          {bottomNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={isActive(item.href) ? 'nav-link-active' : 'nav-link'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          ))}
          <button className="nav-link w-full text-error hover:bg-error-light hover:text-error-dark">
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
