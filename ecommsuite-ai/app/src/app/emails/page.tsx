'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  Mail,
  Users,
  Eye,
  MousePointer,
  Send,
  Clock,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Zap,
  ArrowRight,
} from 'lucide-react'

// Sample email campaigns
const emailCampaigns = [
  {
    id: 1,
    name: 'Summer Sale Announcement',
    subject: 'Hot Summer Deals - Up to 50% Off!',
    status: 'sent',
    sentAt: '2024-01-15 10:30 AM',
    sent: 5234,
    delivered: 5102,
    opened: 1876,
    clicked: 423,
    openRate: '36.8%',
    clickRate: '8.3%',
  },
  {
    id: 2,
    name: 'New Arrivals Newsletter',
    subject: 'Fresh Drops Just Landed',
    status: 'sent',
    sentAt: '2024-01-12 2:00 PM',
    sent: 4890,
    delivered: 4756,
    opened: 1543,
    clicked: 312,
    openRate: '32.4%',
    clickRate: '6.6%',
  },
  {
    id: 3,
    name: 'VIP Customer Exclusive',
    subject: 'You\'re Invited: Early Access Sale',
    status: 'scheduled',
    scheduledFor: '2024-01-20 9:00 AM',
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    openRate: '-',
    clickRate: '-',
  },
  {
    id: 4,
    name: 'Product Review Request',
    subject: 'How did you like your purchase?',
    status: 'draft',
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    openRate: '-',
    clickRate: '-',
  },
]

// Sample automations
const automations = [
  {
    id: 1,
    name: 'Welcome Series',
    trigger: 'New subscriber',
    status: 'active',
    sent: 1234,
    openRate: '45.2%',
  },
  {
    id: 2,
    name: 'Abandoned Cart',
    trigger: 'Cart abandoned (1 hour)',
    status: 'active',
    sent: 567,
    openRate: '38.9%',
  },
  {
    id: 3,
    name: 'Post-Purchase Thank You',
    trigger: 'Order completed',
    status: 'active',
    sent: 2345,
    openRate: '52.1%',
  },
  {
    id: 4,
    name: 'Win-Back Campaign',
    trigger: 'No purchase (60 days)',
    status: 'paused',
    sent: 234,
    openRate: '22.4%',
  },
]

const statusColors = {
  sent: 'badge-success',
  scheduled: 'badge-warning',
  draft: 'badge-neutral',
  sending: 'badge-primary',
}

export default function EmailsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'automations'>('campaigns')

  const totalSent = emailCampaigns.reduce((sum, c) => sum + c.sent, 0)
  const totalOpened = emailCampaigns.reduce((sum, c) => sum + c.opened, 0)
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Email Marketing</h1>
          <p className="page-subtitle">Create and manage email campaigns and automations</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/emails/automations/new" className="btn-secondary">
            <Zap className="w-5 h-5 mr-2" />
            New Automation
          </Link>
          <Link href="/emails/new" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Campaign
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Subscribers', value: '12,456', icon: Users, color: 'text-blue-500' },
          { label: 'Emails Sent (30d)', value: totalSent.toLocaleString(), icon: Send, color: 'text-green-500' },
          { label: 'Avg Open Rate', value: `${avgOpenRate}%`, icon: Eye, color: 'text-purple-500' },
          { label: 'Avg Click Rate', value: '7.2%', icon: MousePointer, color: 'text-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="card p-4 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl bg-dark-100 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-dark-500">{stat.label}</p>
              <p className="text-xl font-bold text-dark-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="tabs">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={activeTab === 'campaigns' ? 'tab-active' : 'tab'}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={activeTab === 'automations' ? 'tab-active' : 'tab'}
          >
            Automations
          </button>
        </div>

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search..."
            className="input pl-10 w-64"
          />
        </div>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {emailCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="group">
                    <td>
                      <Link href={`/emails/${campaign.id}`} className="block">
                        <span className="font-medium text-dark-800 hover:text-primary-500">
                          {campaign.name}
                        </span>
                        <p className="text-xs text-dark-400 mt-0.5">{campaign.subject}</p>
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                        {campaign.status === 'sent' && campaign.sentAt}
                        {campaign.status === 'scheduled' && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {campaign.scheduledFor}
                          </span>
                        )}
                        {campaign.status === 'draft' && 'Draft'}
                      </span>
                    </td>
                    <td className="text-dark-600">{campaign.sent.toLocaleString()}</td>
                    <td className="text-dark-600">{campaign.delivered.toLocaleString()}</td>
                    <td className="text-dark-600">{campaign.opened.toLocaleString()}</td>
                    <td className="text-dark-600">{campaign.clicked.toLocaleString()}</td>
                    <td>
                      <span className={`font-medium ${
                        parseFloat(campaign.openRate) >= 30 ? 'text-success' :
                        parseFloat(campaign.openRate) >= 20 ? 'text-warning' :
                        campaign.openRate === '-' ? 'text-dark-400' : 'text-error'
                      }`}>
                        {campaign.openRate}
                      </span>
                    </td>
                    <td>
                      <span className={`font-medium ${
                        parseFloat(campaign.clickRate) >= 5 ? 'text-success' :
                        parseFloat(campaign.clickRate) >= 3 ? 'text-warning' :
                        campaign.clickRate === '-' ? 'text-dark-400' : 'text-error'
                      }`}>
                        {campaign.clickRate}
                      </span>
                    </td>
                    <td>
                      <button className="p-2 rounded-lg hover:bg-dark-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-dark-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {automations.map((automation, i) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-800">{automation.name}</h3>
                    <p className="text-sm text-dark-500 mt-1">
                      Trigger: {automation.trigger}
                    </p>
                  </div>
                  <span className={`badge ${automation.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {automation.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-dark-50 rounded-xl p-3">
                    <p className="text-sm text-dark-500">Emails Sent</p>
                    <p className="text-xl font-bold text-dark-800">{automation.sent.toLocaleString()}</p>
                  </div>
                  <div className="bg-dark-50 rounded-xl p-3">
                    <p className="text-sm text-dark-500">Open Rate</p>
                    <p className="text-xl font-bold text-success">{automation.openRate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/emails/automations/${automation.id}`} className="btn-secondary btn-sm flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                  <button className="btn-ghost btn-sm">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="btn-ghost btn-sm text-error">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Add New Automation Card */}
            <Link
              href="/emails/automations/new"
              className="card p-6 border-2 border-dashed border-dark-200 hover:border-primary-300 hover:bg-brand-gradient-soft transition-all flex flex-col items-center justify-center min-h-48"
            >
              <div className="w-14 h-14 bg-dark-100 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-7 h-7 text-dark-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark-700 mb-1">Create Automation</h3>
              <p className="text-sm text-dark-500 text-center">
                Set up automated email flows for your customers
              </p>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Templates Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-800">Email Templates</h2>
          <Link href="/emails/templates" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { name: 'Welcome Email', category: 'Onboarding' },
            { name: 'Abandoned Cart', category: 'Recovery' },
            { name: 'Order Confirmation', category: 'Transactional' },
            { name: 'Product Promotion', category: 'Marketing' },
          ].map((template, i) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
              className="card-hover p-4 cursor-pointer"
            >
              <div className="h-32 bg-dark-100 rounded-xl mb-3 flex items-center justify-center">
                <Mail className="w-8 h-8 text-dark-300" />
              </div>
              <p className="font-medium text-dark-800">{template.name}</p>
              <p className="text-xs text-dark-500">{template.category}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
