'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  User,
  CreditCard,
  Link2,
  Bell,
  Shield,
  Users,
  Store,
  ChevronRight,
  Check,
  AlertCircle,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react'

// Integration status
const integrations = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Sync products, customers, and orders from your store',
    connected: true,
    account: 'mystore.myshopify.com',
    lastSync: '5 minutes ago',
    icon: '🛍️',
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    description: 'Run Facebook and Instagram ad campaigns',
    connected: true,
    account: 'My Business Account',
    lastSync: '2 hours ago',
    icon: '📘',
  },
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Search, Shopping, Display, and YouTube ads',
    connected: false,
    account: null,
    lastSync: null,
    icon: '🔍',
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    description: 'Create viral video ad campaigns',
    connected: false,
    account: null,
    lastSync: null,
    icon: '🎵',
  },
]

const settingsSections = [
  { name: 'Profile', href: '/settings/profile', icon: User, description: 'Manage your personal information' },
  { name: 'Billing & Plans', href: '/settings/billing', icon: CreditCard, description: 'Manage subscription and payments' },
  { name: 'Integrations', href: '/settings/integrations', icon: Link2, description: 'Connect your platforms' },
  { name: 'Notifications', href: '/settings/notifications', icon: Bell, description: 'Configure email and push alerts' },
  { name: 'Security', href: '/settings/security', icon: Shield, description: 'Password and two-factor auth' },
  { name: 'Team', href: '/settings/team', icon: Users, description: 'Invite team members' },
]

export default function SettingsPage() {
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const handleSync = async (id: string) => {
    setSyncingId(id)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncingId(null)
  }

  return (
    <div className="page-container max-w-4xl">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and connected platforms</p>
      </div>

      {/* Quick Settings Grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {settingsSections.map((section, i) => (
          <motion.div
            key={section.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Link
              href={section.href}
              className="card-hover p-4 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 bg-dark-100 group-hover:bg-brand-gradient-soft rounded-xl flex items-center justify-center transition-colors">
                <section.icon className="w-6 h-6 text-dark-600 group-hover:text-primary-500 transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark-800">{section.name}</h3>
                <p className="text-sm text-dark-500">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-dark-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Integrations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-dark-100">
          <h2 className="text-lg font-semibold text-dark-800">Connected Platforms</h2>
          <p className="text-sm text-dark-500 mt-1">Manage your integrations with external platforms</p>
        </div>

        <div className="divide-y divide-dark-100">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="p-6 flex items-center gap-4"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-dark-50 rounded-xl flex items-center justify-center text-2xl">
                {integration.icon}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-dark-800">{integration.name}</h3>
                  {integration.connected ? (
                    <span className="badge badge-success">
                      <Check className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="badge badge-neutral">Not connected</span>
                  )}
                </div>
                <p className="text-sm text-dark-500 mt-1">{integration.description}</p>
                {integration.connected && integration.account && (
                  <p className="text-xs text-dark-400 mt-1">
                    {integration.account} • Last sync: {integration.lastSync}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => handleSync(integration.id)}
                      disabled={syncingId === integration.id}
                      className="btn-secondary btn-sm"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${syncingId === integration.id ? 'animate-spin' : ''}`} />
                      {syncingId === integration.id ? 'Syncing...' : 'Sync'}
                    </button>
                    <button className="btn-ghost btn-sm text-dark-500">
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button className="btn-primary btn-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="card p-6 mt-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-semibold text-dark-800">Current Plan</h2>
              <span className="badge-primary">Starter</span>
            </div>
            <p className="text-sm text-dark-500">
              $49/month • Renews on February 15, 2024
            </p>
          </div>
          <Link href="/settings/billing" className="btn-primary">
            Upgrade Plan
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-100">
          {[
            { label: 'Stores', used: 1, limit: 1 },
            { label: 'Email Contacts', used: 2340, limit: 5000 },
            { label: 'Ad Spend Managed', used: 780, limit: 1000, prefix: '$' },
            { label: 'Creatives', used: 23, limit: 50 },
          ].map((usage) => (
            <div key={usage.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-500">{usage.label}</span>
                <span className="text-sm font-medium text-dark-800">
                  {usage.prefix || ''}{usage.used.toLocaleString()} / {usage.prefix || ''}{usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    usage.used / usage.limit >= 0.9 ? 'bg-error' :
                    usage.used / usage.limit >= 0.7 ? 'bg-warning' :
                    'bg-brand-gradient'
                  }`}
                  style={{ width: `${Math.min((usage.used / usage.limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="card p-6 mt-6 border-error/20"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-error-light rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark-800">Danger Zone</h3>
            <p className="text-sm text-dark-500 mt-1">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </div>
          <button className="btn-danger btn-sm">
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  )
}
