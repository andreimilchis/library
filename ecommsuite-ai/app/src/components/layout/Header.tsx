'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Store,
} from 'lucide-react'

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showStoreMenu, setShowStoreMenu] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'Campaign "Summer Sale" is performing well',
      time: '5 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New subscriber added to "Newsletter" list',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Product sync completed successfully',
      time: '3 hours ago',
      unread: false,
    },
  ]

  return (
    <header className="header">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search campaigns, emails, products..."
            className="w-80 pl-10 pr-4 py-2 rounded-xl border border-dark-200 bg-dark-50 text-dark-800 placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-400 bg-white px-2 py-0.5 rounded border border-dark-200">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Store Selector */}
        <div className="relative">
          <button
            onClick={() => setShowStoreMenu(!showStoreMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dark-200 hover:border-dark-300 transition-colors"
          >
            <Store className="w-4 h-4 text-dark-500" />
            <span className="text-sm font-medium text-dark-700">My Store</span>
            <ChevronDown className="w-4 h-4 text-dark-400" />
          </button>

          {showStoreMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStoreMenu(false)} />
              <div className="dropdown-menu">
                <div className="px-4 py-2 border-b border-dark-100">
                  <p className="text-xs text-dark-400 uppercase tracking-wider">Connected Stores</p>
                </div>
                <div className="py-1">
                  <button className="dropdown-item w-full bg-primary-50">
                    <Store className="w-4 h-4 text-primary-500" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-dark-800">My Store</p>
                      <p className="text-xs text-dark-400">mystore.myshopify.com</p>
                    </div>
                  </button>
                </div>
                <div className="border-t border-dark-100 py-1">
                  <Link href="/settings/integrations" className="dropdown-item text-primary-500">
                    <Plus className="w-4 h-4" />
                    Connect New Store
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Create */}
        <button className="btn-primary btn-sm">
          <Plus className="w-4 h-4 mr-1" />
          Create
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-dark-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-dark-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-dark-100 shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-dark-100 flex items-center justify-between">
                  <h3 className="font-semibold text-dark-800">Notifications</h3>
                  <button className="text-xs text-primary-500 hover:text-primary-600">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-dark-50 cursor-pointer ${
                        notification.unread ? 'bg-primary-50/50' : ''
                      }`}
                    >
                      <p className="text-sm text-dark-700">{notification.title}</p>
                      <p className="text-xs text-dark-400 mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-dark-100">
                  <Link
                    href="/notifications"
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-100 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm">
              JS
            </div>
            <ChevronDown className="w-4 h-4 text-dark-400" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="dropdown-menu">
                <div className="px-4 py-3 border-b border-dark-100">
                  <p className="font-semibold text-dark-800">John Smith</p>
                  <p className="text-sm text-dark-500">john@example.com</p>
                  <span className="badge-primary mt-2">Starter Plan</span>
                </div>
                <div className="py-1">
                  <Link href="/settings/profile" className="dropdown-item">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  <Link href="/settings/billing" className="dropdown-item">
                    <CreditCard className="w-4 h-4" />
                    Billing & Plans
                  </Link>
                  <Link href="/settings" className="dropdown-item">
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Link>
                </div>
                <div className="border-t border-dark-100 py-1">
                  <button className="dropdown-item w-full text-error">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
