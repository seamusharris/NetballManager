import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultBadge } from '@/components/ui/result-badge';
import PageTemplate from '@/components/layout/PageTemplate';

export default function ResultBadgeComponent() {
  return (
    <PageTemplate 
      title="Result Badge Component" 
      breadcrumbs={[
        { label: "Development", href: "/component-examples" },
        { label: "Reference", href: "/reference" },
        { label: "Result Badge Component" }
      ]}
    >
      <Helmet>
        <title>Result Badge Component | Component Reference</title>
        <meta name="description" content="Complete reference for the Result Badge component with sizing, usage, and implementation guidelines." />
      </Helmet>

      <div className="space-y-8">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>
                Result Badge Component
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard sizing system: sm, md, lg, xl
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center space-y-2">
                    <ResultBadge result="Win" size="sm" />
                  </div>
                  <span className="text-xs text-muted-foreground">24px - For compact displays</span>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center space-y-2">
                    <ResultBadge result="Loss" size="md" />
                  </div>
                  <span className="text-xs text-muted-foreground">32px - Default size for most uses</span>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center space-y-2">
                    <ResultBadge result="Draw" size="lg" />
                  </div>
                  <span className="text-xs text-muted-foreground">40px - For prominent displays</span>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex flex-col items-center space-y-2">
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