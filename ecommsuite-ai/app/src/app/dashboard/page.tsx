'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  ArrowRight,
  Mail,
  Megaphone,
  Eye,
  MousePointer,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'

// Stats data
const stats = [
  {
    name: 'Total Revenue',
    value: '$124,580',
    change: '+23.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Ad Spend',
    value: '$12,340',
    change: '-5.2%',
    trend: 'down',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'ROAS',
    value: '4.2x',
    change: '+0.5',
    trend: 'up',
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'New Customers',
    value: '1,234',
    change: '+12.3%',
    trend: 'up',
    icon: Users,
    color: 'from-orange-500 to-red-500',
  },
]

// Campaign performance data
const campaigns = [
  {
    name: 'Summer Sale 2024',
    platform: 'Meta',
    status: 'Active',
    spend: '$2,450',
    revenue: '$12,340',
    roas: '5.0x',
  },
  {
    name: 'New Arrivals Collection',
    platform: 'Google',
    status: 'Active',
    spend: '$1,890',
    revenue: '$8,920',
    roas: '4.7x',
  },
  {
    name: 'Retargeting - Cart Abandon',
    platform: 'Meta',
    status: 'Active',
    spend: '$890',
    revenue: '$5,670',
    roas: '6.4x',
  },
  {
    name: 'TikTok Brand Awareness',
    platform: 'TikTok',
    status: 'Paused',
    spend: '$1,200',
    revenue: '$3,450',
    roas: '2.9x',
  },
]

// Email stats
const emailStats = [
  { name: 'Sent', value: '12,450', icon: Mail },
  { name: 'Opened', value: '4,230', subtext: '34% rate', icon: Eye },
  { name: 'Clicked', value: '890', subtext: '7.2% rate', icon: MousePointer },
]

// Quick actions
const quickActions = [
  { name: 'Create Campaign', href: '/ads/new', icon: Megaphone },
  { name: 'Send Email', href: '/emails/new', icon: Mail },
  { name: 'Sync Products', href: '/products', icon: RefreshCw },
]

export default function DashboardPage() {
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Welcome back, John!</h1>
          <p className="page-subtitle">Here&apos;s what&apos;s happening with your marketing today.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="input w-40 py-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="stat-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.name}</p>
                <p className="stat-value mt-1">{stat.value}</p>
                <p className={stat.trend === 'up' ? 'stat-change-positive' : 'stat-change-negative'}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {stat.change} vs last period
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="chart-container"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="chart-title">Revenue Overview</h2>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-gradient" />
                  <span className="text-dark-500">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-dark-300" />
                  <span className="text-dark-500">Ad Spend</span>
                </div>
              </div>
            </div>
            {/* Chart Placeholder */}
            <div className="h-64 flex items-end gap-2">
              {[65, 45, 75, 55, 85, 60, 90, 70, 95, 75, 85, 80].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  <div
                    className="bg-brand-gradient rounded-t-lg transition-all duration-300 hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <div
                    className="bg-dark-200 rounded-t-lg transition-all duration-300"
                    style={{ height: `${height * 0.25}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-dark-400">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-dark-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-dark-100 hover:border-primary-300 hover:bg-brand-gradient-soft transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-dark-100 group-hover:bg-brand-gradient flex items-center justify-center transition-all">
                  <action.icon className="w-5 h-5 text-dark-600 group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-dark-700 group-hover:text-dark-800">{action.name}</span>
                <ArrowRight className="w-4 h-4 text-dark-400 ml-auto group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          {/* Email Stats */}
          <div className="mt-6 pt-6 border-t border-dark-100">
            <h3 className="text-sm font-semibold text-dark-600 mb-4">Email Performance (7 days)</h3>
            <div className="grid grid-cols-3 gap-3">
              {emailStats.map((stat) => (
                <div key={stat.name} className="text-center">
                  <stat.icon className="w-5 h-5 text-dark-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-dark-800">{stat.value}</p>
                  <p className="text-xs text-dark-500">{stat.name}</p>
                  {stat.subtext && (
                    <p className="text-xs text-success">{stat.subtext}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Campaigns Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="card mt-6 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-800">Active Campaigns</h2>
          <Link href="/ads" className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Platform</th>
                <th>Status</th>
                <th>Spend</th>
                <th>Revenue</th>
                <th>ROAS</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.name}>
                  <td>
                    <span className="font-medium text-dark-800">{campaign.name}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      campaign.platform === 'Meta' ? 'badge-primary' :
                      campaign.platform === 'Google' ? 'badge-success' :
                      'badge-warning'
                    }`}>
                      {campaign.platform}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      campaign.status === 'Active' ? 'badge-success' : 'badge-neutral'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="text-dark-600">{campaign.spend}</td>
                  <td className="font-medium text-dark-800">{campaign.revenue}</td>
                  <td>
                    <span className={`font-semibold ${
                      parseFloat(campaign.roas) >= 4 ? 'text-success' :
                      parseFloat(campaign.roas) >= 3 ? 'text-warning' :
                      'text-error'
                    }`}>
                      {campaign.roas}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Bottom Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-800">Top Selling Products</h2>
            <Link href="/products" className="text-sm text-primary-500 hover:text-primary-600">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Summer Beach Towel', sales: 234, revenue: '$6,980' },
              { name: 'Wireless Earbuds Pro', sales: 189, revenue: '$15,120' },
              { name: 'Organic Face Cream', sales: 156, revenue: '$4,680' },
              { name: 'Yoga Mat Premium', sales: 134, revenue: '$5,360' },
            ].map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dark-100 rounded-xl flex items-center justify-center text-dark-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-800">{product.name}</p>
                  <p className="text-sm text-dark-500">{product.sales} sales</p>
                </div>
                <p className="font-semibold text-dark-800">{product.revenue}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-dark-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'Campaign "Summer Sale" reached 10,000 impressions', time: '5 min ago', type: 'success' },
              { action: 'New subscriber: john@example.com', time: '15 min ago', type: 'info' },
              { action: 'Email "Welcome Series" sent to 234 contacts', time: '1 hour ago', type: 'info' },
              { action: 'Product sync completed - 156 products updated', time: '2 hours ago', type: 'success' },
              { action: 'Campaign "TikTok Test" paused due to budget', time: '4 hours ago', type: 'warning' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'success' ? 'bg-success' :
                  activity.type === 'warning' ? 'bg-warning' :
                  'bg-primary-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-dark-700">{activity.action}</p>
                  <p className="text-xs text-dark-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
