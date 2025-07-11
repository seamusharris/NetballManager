
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FlourishChartProps {
  chartId: string;
  title?: string;
  height?: number;
  className?: string;
}

export function FlourishChart({ chartId, title, height = 400, className }: FlourishChartProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flourish-embed" data-src={`visualisation/${chartId}`}>
          <iframe 
            src={`https://flo.uri.sh/visualisation/${chartId}/embed`}
            title={title || "Flourish Chart"}
            className="w-full border-0"
            style={{ height: `${height}px` }}
            frameBorder="0"
            scrolling="no"
            sandbox="allow-same-origin allow-forms allow-scripts allow-downloads allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
          />
        </div>
      </CardContent>
    </Card>
  );
}
