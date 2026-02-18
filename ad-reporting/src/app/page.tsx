import Link from "next/link";
import {
  BarChart3,
  Mail,
  Clock,
  Layers,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Platform Analytics",
    description:
      "Pull data from Facebook Ads, Google Ads, and TikTok Ads into one unified dashboard.",
  },
  {
    icon: Mail,
    title: "Automated Email Reports",
    description:
      "Send beautiful, branded performance reports directly to your clients' inbox.",
  },
  {
    icon: Clock,
    title: "Scheduled Delivery",
    description:
      "Set up daily, weekly, or monthly report schedules. Never miss a report again.",
  },
  {
    icon: Layers,
    title: "Report Templates",
    description:
      "Pre-built templates for e-commerce: ROAS, CPA, funnel analysis, and more.",
  },
  {
    icon: Shield,
    title: "White Label",
    description:
      "Custom branding, colors, logo, and domain. Reports look like they come from you.",
  },
  {
    icon: Zap,
    title: "Real-Time Dashboard",
    description:
      "Live dashboards for clients to check performance anytime, anywhere.",
  },
];

const metrics = [
  "CPA",
  "ROAS",
  "Conversions",
  "Conversion Value",
  "CTR",
  "CPC",
  "Amount Spent",
  "CPM",
  "AOV",
  "Add to Cart",
  "Purchases",
  "Impressions",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              AdReport Pro
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Built for e-commerce marketing agencies
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Automated Ad Reporting
            <br />
            <span className="text-blue-600">for Your Clients</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Pull metrics from Facebook Ads, Google Ads, and TikTok Ads.
            Send beautiful branded reports via email automatically.
            Track ROAS, CPA, Conversions, and 20+ metrics.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-lg"
            >
              Start Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">
            Supported Platforms
          </p>
          <div className="flex items-center justify-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                f
              </div>
              <span className="font-medium text-gray-700">Facebook Ads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
                G
              </div>
              <span className="font-medium text-gray-700">Google Ads</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                T
              </div>
              <span className="font-medium text-gray-700">TikTok Ads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete reporting solution built specifically for agencies
              managing e-commerce clients.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">20+ E-commerce Metrics</h2>
          <p className="text-gray-400 mb-12 text-lg">
            All the metrics your e-commerce clients care about
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {metrics.map((metric) => (
              <span
                key={metric}
                className="px-4 py-2 bg-gray-800 rounded-lg text-sm font-medium text-gray-300 border border-gray-700"
              >
                {metric}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to automate your reporting?
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Stop wasting hours building reports manually.
            Set up once and let the reports deliver themselves.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-lg"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-medium">AdReport Pro</span>
          </div>
          <p>Powered by your agency</p>
        </div>
      </footer>
    </div>
  );
}
