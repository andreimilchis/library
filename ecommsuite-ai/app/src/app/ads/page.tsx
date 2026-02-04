'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  DollarSign,
  Target,
} from 'lucide-react'

// Sample campaigns data
const campaigns = [
  {
    id: 1,
    name: 'Summer Sale 2024',
    platform: 'META',
    status: 'active',
    budget: '$100/day',
    spent: '$2,450',
    impressions: '125,430',
    clicks: '3,245',
    ctr: '2.59%',
    conversions: 89,
    revenue: '$12,340',
    roas: '5.0x',
    trend: 'up',
  },
  {
    id: 2,
    name: 'Google Shopping - All Products',
    platform: 'GOOGLE',
    status: 'active',
    budget: '$75/day',
    spent: '$1,890',
    impressions: '89,120',
    clicks: '2,134',
    ctr: '2.39%',
    conversions: 67,
    revenue: '$8,920',
    roas: '4.7x',
    trend: 'up',
  },
  {
    id: 3,
    name: 'Retargeting - Cart Abandoners',
    platform: 'META',
    status: 'active',
    budget: '$50/day',
    spent: '$890',
    impressions: '45,230',
    clicks: '1,890',
    ctr: '4.18%',
    conversions: 45,
    revenue: '$5,670',
    roas: '6.4x',
    trend: 'up',
  },
  {
    id: 4,
    name: 'TikTok Brand Awareness',
    platform: 'TIKTOK',
    status: 'paused',
    budget: '$80/day',
    spent: '$1,200',
    impressions: '234,500',
    clicks: '4,567',
    ctr: '1.95%',
    conversions: 23,
    revenue: '$3,450',
    roas: '2.9x',
    trend: 'down',
  },
  {
    id: 5,
    name: 'New Collection Launch',
    platform: 'META',
    status: 'draft',
    budget: '$150/day',
    spent: '$0',
    impressions: '0',
    clicks: '0',
    ctr: '0%',
    conversions: 0,
    revenue: '$0',
    roas: '-',
    trend: 'neutral',
  },
]

const platformColors = {
  META: 'bg-blue-100 text-blue-700',
  GOOGLE: 'bg-green-100 text-green-700',
  TIKTOK: 'bg-pink-100 text-pink-700',
}

const statusColors = {
  active: 'badge-success',
  paused: 'badge-warning',
  draft: 'badge-neutral',
}

export default function AdsPage() {
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([])
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filterPlatform !== 'all' && campaign.platform !== filterPlatform) return false
    if (filterStatus !== 'all' && campaign.status !== filterStatus) return false
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalSpend = campaigns.reduce((sum, c) => sum + parseFloat(c.spent.replace(/[$,]/g, '')), 0)
  const totalRevenue = campaigns.reduce((sum, c) => sum + parseFloat(c.revenue.replace(/[$,]/g, '')), 0)

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Ads Manager</h1>
          <p className="page-subtitle">Manage all your ad campaigns across platforms</p>
        </div>
        <Link href="/ads/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create Campaign
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}`, icon: DollarSign, color: 'text-blue-500' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: Target, color: 'text-green-500' },
          { label: 'Average ROAS', value: '4.5x', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Active Campaigns', value: campaigns.filter(c => c.status === 'active').length.toString(), icon: Play, color: 'text-orange-500' },
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

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Platform Filter */}
          <select
            className="input w-40"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="META">Meta</option>
            <option value="GOOGLE">Google</option>
            <option value="TIKTOK">TikTok</option>
          </select>

          {/* Status Filter */}
          <select
            className="input w-40"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>

          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="w-8">
                  <input
                    type="checkbox"
                    className="rounded border-dark-300"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCampaigns(campaigns.map(c => c.id))
                      } else {
                        setSelectedCampaigns([])
                      }
                    }}
                  />
                </th>
                <th>Campaign</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Spent</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Revenue</th>
                <th>ROAS</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="group">
                  <td>
                    <input
                      type="checkbox"
                      className="rounded border-dark-300"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns([...selectedCampaigns, campaign.id])
                        } else {
                          setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id))
                        }
                      }}
                    />
                  </td>
                  <td>
                    <Link href={`/ads/${campaign.id}`} className="font-medium text-dark-800 hover:text-primary-500">
                      {campaign.name}
                    </Link>
                    <p className="text-xs text-dark-400">{campaign.budget}</p>
                  </td>
                  <td>
                    <span className={`badge ${platformColors[campaign.platform as keyof typeof platformColors]}`}>
                      {campaign.platform}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusColors[campaign.status as keyof typeof statusColors]}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-dark-600">{campaign.spent}</td>
                  <td className="text-dark-600">{campaign.impressions}</td>
                  <td className="text-dark-600">{campaign.clicks}</td>
                  <td className="text-dark-600">{campaign.ctr}</td>
                  <td className="font-medium text-dark-800">{campaign.revenue}</td>
                  <td>
                    <span className={`font-semibold flex items-center gap-1 ${
                      campaign.trend === 'up' ? 'text-success' :
                      campaign.trend === 'down' ? 'text-error' :
                      'text-dark-400'
                    }`}>
                      {campaign.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {campaign.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {campaign.roas}
                    </span>
                  </td>
                  <td>
                    <div className="relative group">
                      <button className="p-2 rounded-lg hover:bg-dark-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-dark-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bulk Actions */}
        {selectedCampaigns.length > 0 && (
          <div className="px-6 py-4 bg-dark-50 border-t border-dark-100 flex items-center justify-between">
            <span className="text-sm text-dark-600">
              {selectedCampaigns.length} campaign(s) selected
            </span>
            <div className="flex items-center gap-2">
              <button className="btn-secondary btn-sm">
                <Play className="w-4 h-4 mr-1" />
                Activate
              </button>
              <button className="btn-secondary btn-sm">
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </button>
              <button className="btn-secondary btn-sm">
                <Copy className="w-4 h-4 mr-1" />
                Duplicate
              </button>
              <button className="btn-danger btn-sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
