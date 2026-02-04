'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Zap,
  BarChart3,
  Mail,
  Palette,
  ShoppingBag,
  TrendingUp,
  Play,
  Check,
  ArrowRight,
  Star,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-dark-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-dark-800">
              Ecomm<span className="text-gradient">Suite</span>.AI
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-dark-600 hover:text-dark-800 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-dark-600 hover:text-dark-800 transition-colors">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-dark-600 hover:text-dark-800 transition-colors">
              Testimonials
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-dark-600 hover:text-dark-800 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="badge-primary mb-4 inline-flex">
                <Star className="w-3 h-3 mr-1" /> Trusted by 1,000+ Shopify Stores
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-dark-800 leading-tight mb-6"
            >
              Your Marketing on{' '}
              <span className="text-gradient">Autopilot</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-dark-500 mb-8 max-w-2xl mx-auto"
            >
              Connect your Shopify store and let AI handle your Facebook ads, Google ads,
              TikTok campaigns, emails, and creatives. All from one powerful dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register" className="btn-primary btn-lg">
                Start Free 14-Day Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button className="btn-secondary btn-lg">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm text-dark-400 mt-4"
            >
              No credit card required. Cancel anytime.
            </motion.p>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-3xl opacity-20 -z-10" />
            <div className="bg-white rounded-2xl shadow-2xl border border-dark-100 overflow-hidden">
              <div className="bg-dark-50 px-4 py-3 flex items-center gap-2 border-b border-dark-100">
                <div className="w-3 h-3 rounded-full bg-error" />
                <div className="w-3 h-3 rounded-full bg-warning" />
                <div className="w-3 h-3 rounded-full bg-success" />
              </div>
              <div className="p-8 bg-dark-50">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Revenue', value: '$124,500', change: '+23%' },
                    { label: 'Ad Spend', value: '$12,340', change: '-5%' },
                    { label: 'ROAS', value: '4.2x', change: '+0.5' },
                    { label: 'New Customers', value: '1,234', change: '+12%' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl">
                      <p className="text-sm text-dark-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-dark-800">{stat.value}</p>
                      <p className="text-sm text-success">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-6 h-48 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-brand-gradient rounded-t-lg transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 px-6 border-y border-dark-100 bg-dark-50">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-dark-400 mb-8">Integrates with your favorite platforms</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-60">
            {['Shopify', 'Meta', 'Google', 'TikTok', 'Mailchimp', 'Klaviyo'].map((brand) => (
              <span key={brand} className="text-2xl font-bold text-dark-400">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-flex">Features</span>
            <h2 className="text-4xl font-bold text-dark-800 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-dark-500 max-w-2xl mx-auto">
              Stop juggling multiple tools. EcommSuite.AI brings all your marketing in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Shopify Sync',
                description: 'Auto-import products, customers, and orders. Always up-to-date with your store.',
              },
              {
                icon: BarChart3,
                title: 'Paid Media Hub',
                description: 'Manage Facebook, Google, and TikTok ads from one dashboard. AI-optimized budgets.',
              },
              {
                icon: Mail,
                title: 'Email Automation',
                description: 'Welcome series, abandoned cart, win-back emails. Set it once, works forever.',
              },
              {
                icon: Palette,
                title: 'Creative Studio',
                description: 'Generate banners and videos instantly. No design skills needed.',
              },
              {
                icon: TrendingUp,
                title: 'Smart Analytics',
                description: 'See all your metrics in one view. Know what\'s working at a glance.',
              },
              {
                icon: Zap,
                title: 'AI-Powered',
                description: 'AI writes your ad copy, suggests audiences, and optimizes your campaigns.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-hover p-8"
              >
                <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-800 mb-3">{feature.title}</h3>
                <p className="text-dark-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-dark-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-flex">Pricing</span>
            <h2 className="text-4xl font-bold text-dark-800 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-dark-500">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 49,
                description: 'Perfect for new stores',
                features: [
                  '1 Shopify store',
                  'Up to $1K/mo ad spend',
                  '5,000 email contacts',
                  'Basic templates',
                  'Email support',
                ],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'Growth',
                price: 149,
                description: 'For growing businesses',
                features: [
                  '1 Shopify store',
                  'Up to $10K/mo ad spend',
                  '25,000 email contacts',
                  'All templates + AI copy',
                  'Priority support',
                  'Advanced analytics',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Scale',
                price: 349,
                description: 'For established stores',
                features: [
                  '3 Shopify stores',
                  'Unlimited ad spend',
                  '100,000 email contacts',
                  'Custom templates',
                  'Dedicated manager',
                  'API access',
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`card p-8 relative ${plan.popular ? 'border-primary-500 border-2' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-gradient text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-dark-800">{plan.name}</h3>
                <p className="text-dark-500 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-dark-800">${plan.price}</span>
                  <span className="text-dark-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-dark-600">
                      <Check className="w-5 h-5 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4 inline-flex">Testimonials</span>
            <h2 className="text-4xl font-bold text-dark-800 mb-4">
              Loved by Store Owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "EcommSuite.AI saved me 20+ hours per week. My ROAS improved by 40% in the first month!",
                author: "Sarah M.",
                role: "Fashion Store Owner",
              },
              {
                quote: "Finally, one tool that does it all. I cancelled 4 other subscriptions after switching.",
                author: "Mike R.",
                role: "Electronics Store",
              },
              {
                quote: "The AI copywriting is incredible. It writes better ads than my freelancer did.",
                author: "Jessica L.",
                role: "Beauty Brand Founder",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-dark-600 mb-6 text-lg">&ldquo;{testimonial.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-dark-800">{testimonial.author}</p>
                  <p className="text-dark-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-gradient rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Automate Your Marketing?
              </h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join 1,000+ e-commerce stores that save time and increase revenue with EcommSuite.AI
              </p>
              <Link href="/register" className="btn bg-white text-primary-600 hover:bg-dark-50 btn-lg">
                Start Your Free 14-Day Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-dark-800">
                Ecomm<span className="text-gradient">Suite</span>.AI
              </span>
            </div>

            <div className="flex items-center gap-8">
              <Link href="/privacy" className="text-dark-500 hover:text-dark-700 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-dark-500 hover:text-dark-700 text-sm">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-dark-500 hover:text-dark-700 text-sm">
                Contact
              </Link>
            </div>

            <p className="text-dark-400 text-sm">
              &copy; 2024 EcommSuite.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
