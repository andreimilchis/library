"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  ShoppingCart,
  TrendingUp,
  Video,
  BarChart3,
} from "lucide-react";

const defaultTemplates = [
  {
    id: "ecommerce-weekly",
    name: "E-commerce Weekly Report",
    description:
      "Complete weekly report with ROAS, CPA, Conversions, Revenue, and funnel metrics across all platforms.",
    metrics: [
      "spend",
      "roas",
      "conversions",
      "conversion_value",
      "cpa",
      "ctr",
      "cpc",
      "purchases",
      "purchase_value",
      "aov",
      "add_to_cart",
      "cost_per_purchase",
    ],
    icon: ShoppingCart,
    color: "bg-purple-50 text-purple-600",
    isDefault: true,
  },
  {
    id: "performance-overview",
    name: "Performance Overview",
    description:
      "High-level overview of campaign performance with key metrics and platform breakdown.",
    metrics: [
      "spend",
      "roas",
      "conversions",
      "conversion_value",
      "cpa",
      "ctr",
      "impressions",
      "clicks",
    ],
    icon: TrendingUp,
    color: "bg-green-50 text-green-600",
    isDefault: true,
  },
  {
    id: "video-campaign",
    name: "Video Campaign Report",
    description:
      "Focused on video metrics including views, view rates, thumbstop rate, and engagement.",
    metrics: [
      "spend",
      "video_views",
      "video_views_25",
      "video_views_50",
      "video_views_75",
      "video_views_100",
      "thumbstop_rate",
      "cpm",
      "ctr",
      "likes",
      "comments",
      "shares",
    ],
    icon: Video,
    color: "bg-pink-50 text-pink-600",
    isDefault: true,
  },
  {
    id: "full-funnel",
    name: "Full Funnel Analysis",
    description:
      "End-to-end funnel analysis from impressions to purchase, with cost per stage.",
    metrics: [
      "impressions",
      "clicks",
      "ctr",
      "view_content",
      "add_to_cart",
      "cost_per_add_to_cart",
      "checkout_initiated",
      "purchases",
      "cost_per_purchase",
      "purchase_value",
      "roas",
      "conversion_rate",
    ],
    icon: BarChart3,
    color: "bg-blue-50 text-blue-600",
    isDefault: true,
  },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Report Templates
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pre-built and custom templates for your reports
          </p>
        </div>
        <Button>
          <Layers className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Default Templates */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Default Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        {template.isDefault && (
                          <Badge variant="info">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {template.metrics.slice(0, 8).map((metric) => (
                      <span
                        key={metric}
                        className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {metric.replace(/_/g, " ").toUpperCase()}
                      </span>
                    ))}
                    {template.metrics.length > 8 && (
                      <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                        +{template.metrics.length - 8} more
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Preview
                    </Button>
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
