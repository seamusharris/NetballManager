
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

declare global {
  interface Window {
    Flourish: any;
  }
}

interface DynamicFlourishChartProps {
  template: string;
  data: any;
  bindings?: any;
  title?: string;
  height?: number;
  className?: string;
}

export function DynamicFlourishChart({ 
  template, 
  data, 
  bindings, 
  title, 
  height = 400, 
  className 
}: DynamicFlourishChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const flourishRef = useRef<any>(null);

  useEffect(() => {
    // Load Flourish SDK if not already loaded
    if (!window.Flourish) {
      const script = document.createElement('script');
      script.src = 'https://public.flourish.studio/resources/embed.js';
      script.async = true;
      script.onload = initChart;
      document.head.appendChild(script);
    } else {
      initChart();
    }

    function initChart() {
      if (chartRef.current && window.Flourish) {
        flourishRef.current = new window.Flourish.Live({
          api_key: process.env.REACT_APP_FLOURISH_API_KEY, // Optional for public templates
          container: chartRef.current,
          template,
          data,
          bindings,
          height
        });
      }
    }

    return () => {
      if (flourishRef.current) {
        flourishRef.current.destroy();
      }
    };
  }, [template, height]);

  useEffect(() => {
    // Update chart when data changes
    if (flourishRef.current && data) {
      flourishRef.current.update({ data, bindings });
    }
  }, [data, bindings]);

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div ref={chartRef} style={{ height: `${height}px` }} />
      </CardContent>
    </Card>
  );
}
