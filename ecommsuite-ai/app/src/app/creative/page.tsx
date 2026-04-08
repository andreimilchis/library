'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Plus,
  Search,
  Image,
  Video,
  Grid,
  List,
  Filter,
  Download,
  Share2,
  Edit,
  Trash2,
  Sparkles,
  Wand2,
  LayoutTemplate,
  Palette,
  Type,
} from 'lucide-react'

// Sample creatives
const creatives = [
  {
    id: 1,
    name: 'Summer Sale Banner',
    type: 'banner',
    size: '1200x628',
    platform: 'Facebook Feed',
    status: 'completed',
    createdAt: '2024-01-15',
    thumbnail: null,
  },
  {
    id: 2,
    name: 'Product Showcase Video',
    type: 'video',
    size: '1080x1920',
    platform: 'Instagram Stories',
    status: 'completed',
    createdAt: '2024-01-14',
    thumbnail: null,
  },
  {
    id: 3,
    name: 'New Arrivals Collection',
    type: 'banner',
    size: '1080x1080',
    platform: 'Instagram Post',
    status: 'completed',
    createdAt: '2024-01-13',
    thumbnail: null,
  },
  {
    id: 4,
    name: 'TikTok Product Demo',
    type: 'video',
    size: '1080x1920',
    platform: 'TikTok',
    status: 'draft',
    createdAt: '2024-01-12',
    thumbnail: null,
  },
  {
    id: 5,
    name: 'Google Display Ad Set',
    type: 'banner',
    size: 'Multiple',
    platform: 'Google Display',
    status: 'completed',
    createdAt: '2024-01-11',
    thumbnail: null,
  },
  {
    id: 6,
    name: 'Email Header - Welcome',
    type: 'banner',
    size: '600x200',
    platform: 'Email',
    status: 'completed',
    createdAt: '2024-01-10',
    thumbnail: null,
  },
]

// Template categories
const templateCategories = [
  { name: 'Sale & Promotions', count: 24 },
  { name: 'Product Launch', count: 18 },
  { name: 'Seasonal', count: 32 },
  { name: 'Social Proof', count: 15 },
  { name: 'Lifestyle', count: 21 },
]

export default function CreativePage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState('all')

  const filteredCreatives = creatives.filter(c => {
    if (filterType === 'all') return true
    return c.type === filterType
  })

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Creative Studio</h1>
          <p className="page-subtitle">Design beautiful banners and videos for your campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/creative/videos/new" className="btn-secondary">
            <Video className="w-5 h-5 mr-2" />
            Create Video
          </Link>
          <Link href="/creative/banners/new" className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Banner
          </Link>
        </div>
      </div>

      {/* Quick Create Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: 'AI Banner Generator',
            description: 'Generate banners from your product images with AI',
            icon: Wand2,
            color: 'from-purple-500 to-pink-500',
            href: '/creative/banners/ai',
          },
          {
            title: 'Template Gallery',
            description: 'Start with professional pre-made templates',
            icon: LayoutTemplate,
            color: 'from-blue-500 to-cyan-500',
            href: '/creative/templates',
          },
          {
            title: 'Brand Kit',
            description: 'Manage your colors, fonts, and logos',
            icon: Palette,
            color: 'from-orange-500 to-red-500',
            href: '/creative/brand-kit',
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Link
              href={card.href}
              className="card-hover p-6 flex items-start gap-4 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dark-800 group-hover:text-primary-500 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-dark-500 mt-1">{card.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Filters and View Toggle */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search creatives..."
              className="input pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            className="input w-40"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="banner">Banners</option>
            <option value="video">Videos</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-dark-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-dark-200'}`}
            >
              <Grid className="w-5 h-5 text-dark-600" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-dark-200'}`}
            >
              <List className="w-5 h-5 text-dark-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Creatives Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Create New Card */}
            <Link
              href="/creative/banners/new"
              className="card border-2 border-dashed border-dark-200 hover:border-primary-300 hover:bg-brand-gradient-soft transition-all aspect-square flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-dark-100 rounded-2xl flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-dark-400" />
              </div>
              <p className="text-lg font-semibold text-dark-700">Create New</p>
              <p className="text-sm text-dark-500">Banner or Video</p>
            </Link>

            {/* Creative Cards */}
            {filteredCreatives.map((creative, i) => (
              <motion.div
                key={creative.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="card-hover group overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-dark-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {creative.type === 'banner' ? (
                      <Image className="w-12 h-12 text-dark-300" />
                    ) : (
                      <Video className="w-12 h-12 text-dark-300" />
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="p-2 bg-white rounded-lg hover:bg-dark-100 transition-colors">
                      <Edit className="w-5 h-5 text-dark-700" />
                    </button>
                    <button className="p-2 bg-white rounded-lg hover:bg-dark-100 transition-colors">
                      <Download className="w-5 h-5 text-dark-700" />
                    </button>
                    <button className="p-2 bg-white rounded-lg hover:bg-dark-100 transition-colors">
                      <Share2 className="w-5 h-5 text-dark-700" />
                    </button>
                    <button className="p-2 bg-white rounded-lg hover:bg-error-light transition-colors">
                      <Trash2 className="w-5 h-5 text-error" />
                    </button>
                  </div>

                  {/* Type Badge */}
                  <span className={`absolute top-2 left-2 badge ${creative.type === 'banner' ? 'badge-primary' : 'badge-warning'}`}>
                    {creative.type === 'banner' ? <Image className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                    {creative.type}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-dark-800 truncate">{creative.name}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-dark-500">
                    <span>{creative.size}</span>
                    <span>{creative.platform}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Platform</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCreatives.map((creative) => (
                  <tr key={creative.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-dark-100 rounded-lg flex items-center justify-center">
                          {creative.type === 'banner' ? (
                            <Image className="w-5 h-5 text-dark-400" />
                          ) : (
                            <Video className="w-5 h-5 text-dark-400" />
                          )}
                        </div>
                        <span className="font-medium text-dark-800">{creative.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${creative.type === 'banner' ? 'badge-primary' : 'badge-warning'}`}>
                        {creative.type}
                      </span>
                    </td>
                    <td className="text-dark-600">{creative.size}</td>
                    <td className="text-dark-600">{creative.platform}</td>
                    <td>
                      <span className={`badge ${creative.status === 'completed' ? 'badge-success' : 'badge-neutral'}`}>
                        {creative.status}
                      </span>
                    </td>
                    <td className="text-dark-500">{creative.createdAt}</td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 rounded-lg hover:bg-dark-100">
                          <Edit className="w-4 h-4 text-dark-500" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-dark-100">
                          <Download className="w-4 h-4 text-dark-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Template Categories */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-dark-800 mb-6">Browse Templates</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {templateCategories.map((category, i) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
            >
              <Link
                href={`/creative/templates?category=${category.name}`}
                className="card-hover p-6 text-center"
              >
                <div className="w-16 h-16 bg-brand-gradient-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutTemplate className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-dark-800">{category.name}</h3>
                <p className="text-sm text-dark-500 mt-1">{category.count} templates</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
