import React from 'react';
import { Helmet } from 'react-helmet';
import PageTemplate from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResultBadge } from '@/components/ui/result-badge';
import { Trophy, Target, TrendingUp, Users } from 'lucide-react';

export default function ResultBadgeExamples() {
  return (
    <PageTemplate
      title="Result Badge Examples"
      subtitle="Standardized win/loss/draw badges and result indicators"
      breadcrumbs={[
        { label: 'Component Examples', href: '/component-examples' },
        { label: 'Result Badge Examples' }
      ]}
    >
      <Helmet>
        <title>Result Badge Examples | Team Manager</title>
      </Helmet>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>
                Result Badge Component
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard sizing system: <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Extra Small */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">sm:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="sm" />
                    <ResultBadge result="Loss" size="sm" />
                    <ResultBadge result="Draw" size="sm" />
                    <ResultBadge result="Bye" size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">24px - For compact lists and inline use</span>
                </div>

                {/* Medium */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">md:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="md" />
                    <ResultBadge result="Loss" size="md" />
                    <ResultBadge result="Draw" size="md" />
                    <ResultBadge result="Bye" size="md" />
                  </div>
                  <span className="text-xs text-muted-foreground">32px - Standard size for cards and widgets</span>
                </div>

                {/* Large */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">lg:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="lg" />
                    <ResultBadge result="Loss" size="lg" />
                    <ResultBadge result="Draw" size="lg" />
                    <ResultBadge result="Bye" size="lg" />
                  </div>
                  <span className="text-xs text-muted-foreground">40px - For headers and emphasis</span>
                </div>

                {/* Extra Large */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium w-16">xl:</span>
                  <div className="flex gap-2">
                    <ResultBadge result="Win" size="xl" />
                    <ResultBadge result="Loss" size="xl" />
                    <ResultBadge result="Draw" size="xl" />
                    <ResultBadge result="Bye" size="xl" />
                  </div>
                  <span className="text-xs text-muted-foreground">48px - For dashboard highlights</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Component Usage Documentation */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>How to Use the ResultBadge Component</CardTitle>
              <p className="text-sm text-muted-foreground">
                Simple usage examples with just size and result props
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Basic Usage</h4>
                  <code className="text-sm bg-white p-2 rounded border block">
                    {`<ResultBadge result="Win" size="md" />`}
                  </code>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">All Available Props</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>result:</strong> "Win" | "Loss" | "Draw" | "Bye"</p>
                    <p><strong>size:</strong> "sm" | "md" | "lg" | "xl" (default: "md")</p>
                    <p><strong>className:</strong> optional additional CSS classes</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Live Examples</h4>
                  <div className="flex gap-3 items-center">
                    <code className="text-xs">sm:</code>
                    <ResultBadge result="Win" size="sm" />
                    <code className="text-xs">md:</code>
                    <ResultBadge result="Loss" size="md" />
                    <code className="text-xs">lg:</code>
                    <ResultBadge result="Draw" size="lg" />
                    <code className="text-xs">xl:</code>
                    <ResultBadge result="Bye" size="xl" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageTemplate>
  );
}