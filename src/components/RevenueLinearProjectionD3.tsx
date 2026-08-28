import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Info, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Activity,
  Calculator,
  Eye,
  Sliders,
  Maximize2
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { MonthlyAccountingReport } from '../types/pharmacy';
import { MOCK_ANNUAL_TRENDS } from '../data/mockPharmacyData';

export interface RevenueLinearProjectionD3Props {
  monthlyReports?: MonthlyAccountingReport[];
  className?: string;
  onNavigateTab?: (tab: string) => void;
}

interface HistoricalDataPoint {
  index: number;
  monthKey: string;
  monthLabel: string;
  fullDateLabel: string;
  revenueHt: number;
  marginHt: number;
  isProjected: boolean;
  projectedRevenueHt?: number;
  projectedMarginHt?: number;
  confidenceLowerHt?: number;
  confidenceUpperHt?: number;
}

export const RevenueLinearProjectionD3: React.FC<RevenueLinearProjectionD3Props> = ({
  monthlyReports = [],
  className = '',
  onNavigateTab
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // State controls
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'margin'>('revenue');
  const [forecastHorizon, setForecastHorizon] = useState<3 | 6>(3);
  const [showConfidenceInterval, setShowConfidenceInterval] = useState<boolean>(true);
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalDataPoint | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Measure container width responsively
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const width = entries[0].contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Build the 6-month historical dataset and calculate linear regression
  const isBlankState = useMemo(() => {
    return monthlyReports.length === 0;
  }, [monthlyReports.length]);

  const { 
    combinedData, 
    historicalCount, 
    regressionStats,
    forecastPoints
  } = useMemo(() => {
    // If in blank state (Reset to zero executed), return pure zero datasets
    if (isBlankState) {
      const emptyHistorical = [
        'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'
      ].map((m, i) => ({
        index: i,
        monthKey: `2026-0${i + 2}`,
        monthLabel: m,
        fullDateLabel: `${m} 2026`,
        revenueHt: 0,
        marginHt: 0,
        isProjected: false,
        projectedRevenueHt: 0,
        projectedMarginHt: 0,
        confidenceLowerHt: 0,
        confidenceUpperHt: 0
      }));

      const emptyForecast = ['Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan+1'].slice(0, forecastHorizon).map((m, f) => ({
        index: 6 + f,
        monthKey: `2026-${String(8 + f).padStart(2, '0')}`,
        monthLabel: m,
        fullDateLabel: `${m} (Projection)`,
        revenueHt: 0,
        marginHt: 0,
        isProjected: true,
        projectedRevenueHt: 0,
        projectedMarginHt: 0,
        confidenceLowerHt: 0,
        confidenceUpperHt: 0
      }));

      return {
        combinedData: [...emptyHistorical, ...emptyForecast],
        historicalCount: 6,
        forecastPoints: emptyForecast,
        regressionStats: {
          slope: 0,
          intercept: 0,
          rSquared: 0,
          standardError: 0,
          meanY: 0,
          latestActual: 0,
          firstProjected: 0,
          endProjected: 0,
          monthlyGrowthRatePct: 0,
          projectedGrowthPct: 0
        }
      };
    }

    // 6-month historical reference data
    // Default to last 6 months from MOCK_ANNUAL_TRENDS (Fév to Juil 2026)
    const baseHistorical: { monthKey: string; monthLabel: string; fullDateLabel: string; revenueHt: number; marginHt: number }[] = [
      { monthKey: '2026-02', monthLabel: 'Fév', fullDateLabel: 'Février 2026', revenueHt: 146500, marginHt: 49810 },
      { monthKey: '2026-03', monthLabel: 'Mar', fullDateLabel: 'Mars 2026', revenueHt: 154000, marginHt: 52360 },
      { monthKey: '2026-04', monthLabel: 'Avr', fullDateLabel: 'Avril 2026', revenueHt: 148200, marginHt: 50388 },
      { monthKey: '2026-05', monthLabel: 'Mai', fullDateLabel: 'Mai 2026', revenueHt: 153800, marginHt: 52292 },
      { monthKey: '2026-06', monthLabel: 'Juin', fullDateLabel: 'Juin 2026', revenueHt: 157200, marginHt: 53448 },
      { monthKey: '2026-07', monthLabel: 'Juil', fullDateLabel: 'Juillet 2026 (Dernier clôturé)', revenueHt: 156485, marginHt: 54200 }
    ];

    // If monthlyReports provided, use the latest closed ones
    if (monthlyReports && monthlyReports.length >= 2) {
      // Use existing reports if available
      const sorted = [...monthlyReports].sort((a, b) => a.month.localeCompare(b.month));
      if (sorted.length >= 4) {
        const lastMonths = sorted.slice(-6);
        // Replace matching items
        lastMonths.forEach((rep, idx) => {
          if (idx < baseHistorical.length) {
            baseHistorical[idx] = {
              monthKey: rep.month,
              monthLabel: rep.monthName.split(' ')[0] || `M${idx + 1}`,
              fullDateLabel: rep.monthName,
              revenueHt: rep.caHt,
              marginHt: rep.margeBruteHt
            };
          }
        });
      }
    }


    const n = baseHistorical.length; // 6
    const xValues = baseHistorical.map((_, i) => i);
    const yValues = baseHistorical.map(d => selectedMetric === 'revenue' ? d.revenueHt : d.marginHt);

    // Compute Linear Regression: y = a * x + b
    const sumX = d3.sum(xValues);
    const sumY = d3.sum(yValues);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (xValues[i] - meanX) * (yValues[i] - meanY);
      denominator += Math.pow(xValues[i] - meanX, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Calculate R² (Coefficient of Determination) and Standard Error
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const actual = yValues[i];
      const predicted = slope * xValues[i] + intercept;
      ssTot += Math.pow(actual - meanY, 2);
      ssRes += Math.pow(actual - predicted, 2);
    }
    const rSquared = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - (ssRes / ssTot))) : 0.85;
    const standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 1500;

    // Build historical combined items with regression value
    const historicalItems: HistoricalDataPoint[] = baseHistorical.map((d, i) => {
      const pred = slope * i + intercept;
      const marginOfError = 1.96 * standardError * Math.sqrt(1 + (1 / n) + (Math.pow(i - meanX, 2) / denominator));
      return {
        index: i,
        monthKey: d.monthKey,
        monthLabel: d.monthLabel,
        fullDateLabel: d.fullDateLabel,
        revenueHt: d.revenueHt,
        marginHt: d.marginHt,
        isProjected: false,
        projectedRevenueHt: selectedMetric === 'revenue' ? pred : undefined,
        projectedMarginHt: selectedMetric === 'margin' ? pred : undefined,
        confidenceLowerHt: pred - marginOfError,
        confidenceUpperHt: pred + marginOfError
      };
    });

    // Build forecast horizon items (e.g. M+1, M+2, M+3...)
    const futureMonthLabels = ['Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan+1'];
    const futureFullLabels = [
      'Août 2026 (En cours)',
      'Septembre 2026 (Projeté)',
      'Octobre 2026 (Projeté)',
      'Novembre 2026 (Projeté)',
      'Décembre 2026 (Projeté)',
      'Janvier 2027 (Projeté)'
    ];

    const forecastItems: HistoricalDataPoint[] = [];
    for (let f = 0; f < forecastHorizon; f++) {
      const x = n + f;
      const pred = slope * x + intercept;
      // Confidence bounds expand with distance into the future
      const marginOfError = 1.96 * standardError * Math.sqrt(1 + (1 / n) + (Math.pow(x - meanX, 2) / denominator));

      forecastItems.push({
        index: x,
        monthKey: `2026-${String(8 + f).padStart(2, '0')}`,
        monthLabel: futureMonthLabels[f] || `M+${f + 1}`,
        fullDateLabel: futureFullLabels[f] || `Mois +${f + 1} (Projection)`,
        revenueHt: pred, // projected value
        marginHt: pred * 0.345, // default margin ratio
        isProjected: true,
        projectedRevenueHt: selectedMetric === 'revenue' ? pred : undefined,
        projectedMarginHt: selectedMetric === 'margin' ? pred : undefined,
        confidenceLowerHt: Math.max(0, pred - marginOfError),
        confidenceUpperHt: pred + marginOfError
      });
    }

    const allCombined = [...historicalItems, ...forecastItems];

    // Stats
    const latestActual = yValues[n - 1];
    const firstProjected = forecastItems[0]?.revenueHt || (slope * n + intercept);
    const endProjected = forecastItems[forecastItems.length - 1]?.revenueHt || (slope * (n + forecastHorizon - 1) + intercept);
    const monthlyGrowthRatePct = meanY > 0 ? (slope / meanY) * 100 : 0;
    const projectedGrowthPct = latestActual > 0 ? ((endProjected - latestActual) / latestActual) * 100 : 0;

    return {
      combinedData: allCombined,
      historicalCount: n,
      forecastPoints: forecastItems,
      regressionStats: {
        slope,
        intercept,
        rSquared,
        standardError,
        meanY,
        latestActual,
        firstProjected,
        endProjected,
        monthlyGrowthRatePct,
        projectedGrowthPct
      }
    };
  }, [monthlyReports, selectedMetric, forecastHorizon]);

  // Render D3 SVG Chart
  useEffect(() => {
    if (!svgRef.current || combinedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Dimensions & Margins
    const height = 340;
    const margin = { 
      top: 24, 
      right: containerWidth < 640 ? 20 : 40, 
      bottom: 45, 
      left: containerWidth < 640 ? 55 : 68 
    };
    const width = Math.max(300, containerWidth);
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    // Defs for gradients & filters
    const defs = svg.append('defs');

    // Historical Area Gradient (Emerald)
    const emeraldGradient = defs.append('linearGradient')
      .attr('id', 'd3-emerald-area')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    emeraldGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', selectedMetric === 'revenue' ? '#10b981' : '#6366f1')
      .attr('stop-opacity', 0.35);
    emeraldGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', selectedMetric === 'revenue' ? '#10b981' : '#6366f1')
      .attr('stop-opacity', 0.0);

    // Projected Area Gradient (Cyan / Amber)
    const projectedGradient = defs.append('linearGradient')
      .attr('id', 'd3-projected-area')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    projectedGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.25);
    projectedGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#06b6d4')
      .attr('stop-opacity', 0.0);

    // Confidence Corridor Gradient
    const confidenceGradient = defs.append('linearGradient')
      .attr('id', 'd3-confidence-area')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    confidenceGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#818cf8')
      .attr('stop-opacity', 0.18);
    confidenceGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#818cf8')
      .attr('stop-opacity', 0.04);

    // Main Chart Group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Point scale across all combined data points
    const xScale = d3.scalePoint<string>()
      .domain(combinedData.map(d => d.monthLabel))
      .range([0, innerWidth])
      .padding(0.35);

    // Y Scale: Range based on values and confidence bounds
    const allValues = combinedData.flatMap(d => [
      selectedMetric === 'revenue' ? d.revenueHt : d.marginHt,
      d.confidenceLowerHt || (selectedMetric === 'revenue' ? d.revenueHt : d.marginHt),
      d.confidenceUpperHt || (selectedMetric === 'revenue' ? d.revenueHt : d.marginHt)
    ]);

    const yMinRaw = d3.min(allValues) || 0;
    const yMaxRaw = d3.max(allValues) || 100000;
    const yPadding = (yMaxRaw - yMinRaw) * 0.18;
    const yMin = Math.max(0, Math.floor((yMinRaw - yPadding) / 5000) * 5000);
    const yMax = Math.ceil((yMaxRaw + yPadding) / 5000) * 5000;

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([innerHeight, 0])
      .nice();

    // 1. Background Grid Lines
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(5);

    g.append('g')
      .attr('class', 'grid-lines')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '3,3');

    g.select('.grid-lines .domain').remove();

    // 2. Separation Boundary Line between Historical and Forecast
    const splitX = (xScale(combinedData[historicalCount - 1].monthLabel) || 0) + 
                   ((xScale(combinedData[historicalCount].monthLabel) || 0) - (xScale(combinedData[historicalCount - 1].monthLabel) || 0)) / 2;

    // Shaded background zone for forecast period
    g.append('rect')
      .attr('x', splitX)
      .attr('y', 0)
      .attr('width', innerWidth - splitX)
      .attr('height', innerHeight)
      .attr('fill', '#06b6d4')
      .attr('fill-opacity', 0.035)
      .attr('rx', 6);

    // Vertical dashed marker line
    g.append('line')
      .attr('x1', splitX)
      .attr('x2', splitX)
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-opacity', 0.7);

    // Label for Forecast boundary
    g.append('text')
      .attr('x', splitX + 8)
      .attr('y', 14)
      .attr('fill', '#0891b2')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('letter-spacing', '0.05em')
      .text('PROJECTION LINÉAIRE D3');

    // 3. Confidence Interval Area (if enabled)
    if (showConfidenceInterval) {
      const confidenceAreaGenerator = d3.area<HistoricalDataPoint>()
        .x(d => xScale(d.monthLabel) || 0)
        .y0(d => yScale(d.confidenceLowerHt || 0))
        .y1(d => yScale(d.confidenceUpperHt || 0))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(combinedData)
        .attr('fill', 'url(#d3-confidence-area)')
        .attr('d', confidenceAreaGenerator);

      // Upper and Lower confidence dashed bounds
      const confidenceUpperLine = d3.line<HistoricalDataPoint>()
        .x(d => xScale(d.monthLabel) || 0)
        .y(d => yScale(d.confidenceUpperHt || 0))
        .curve(d3.curveMonotoneX);

      const confidenceLowerLine = d3.line<HistoricalDataPoint>()
        .x(d => xScale(d.monthLabel) || 0)
        .y(d => yScale(d.confidenceLowerHt || 0))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(combinedData)
        .attr('fill', 'none')
        .attr('stroke', '#818cf8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-opacity', 0.5)
        .attr('d', confidenceUpperLine);

      g.append('path')
        .datum(combinedData)
        .attr('fill', 'none')
        .attr('stroke', '#818cf8')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .attr('stroke-opacity', 0.5)
        .attr('d', confidenceLowerLine);
    }

    // 4. Linear Regression Trendline (y = a*x + b) across entire domain
    const regressionLineGenerator = d3.line<HistoricalDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y(d => {
        const val = selectedMetric === 'revenue' ? (d.projectedRevenueHt || 0) : (d.projectedMarginHt || 0);
        return yScale(val);
      });

    g.append('path')
      .datum(combinedData)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '6,4')
      .attr('stroke-opacity', 0.85)
      .attr('d', regressionLineGenerator);

    // 5. Historical Data Area & Line (Monotone curve)
    const historicalData = combinedData.slice(0, historicalCount);

    const historicalAreaGenerator = d3.area<HistoricalDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y0(innerHeight)
      .y1(d => yScale(selectedMetric === 'revenue' ? d.revenueHt : d.marginHt))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(historicalData)
      .attr('fill', 'url(#d3-emerald-area)')
      .attr('d', historicalAreaGenerator);

    const historicalLineGenerator = d3.line<HistoricalDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y(d => yScale(selectedMetric === 'revenue' ? d.revenueHt : d.marginHt))
      .curve(d3.curveMonotoneX);

    const historicalPath = g.append('path')
      .datum(historicalData)
      .attr('fill', 'none')
      .attr('stroke', selectedMetric === 'revenue' ? '#059669' : '#4f46e5')
      .attr('stroke-width', 3.5)
      .attr('stroke-linecap', 'round')
      .attr('d', historicalLineGenerator);

    // Animate line stroke drawing
    const totalLength = (historicalPath.node() as SVGPathElement)?.getTotalLength() || 600;
    historicalPath
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .attr('stroke-dashoffset', 0);

    // 6. Projected Forecast Line (Connecting last historical point to forecast points)
    const bridgeData = [historicalData[historicalCount - 1], ...combinedData.slice(historicalCount)];

    const projectedLineGenerator = d3.line<HistoricalDataPoint>()
      .x(d => xScale(d.monthLabel) || 0)
      .y(d => yScale(selectedMetric === 'revenue' ? d.revenueHt : d.marginHt))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(bridgeData)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 3)
      .attr('stroke-dasharray', '5,4')
      .attr('stroke-linecap', 'round')
      .attr('d', projectedLineGenerator);

    // 7. Interactive Points (Circles)
    // Historical dots (Solid emerald with white center)
    historicalData.forEach((d) => {
      const cx = xScale(d.monthLabel) || 0;
      const val = selectedMetric === 'revenue' ? d.revenueHt : d.marginHt;
      const cy = yScale(val);

      const dotGroup = g.append('g').attr('class', 'dot-historical');

      dotGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 6)
        .attr('fill', selectedMetric === 'revenue' ? '#10b981' : '#6366f1')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5)
        .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))');

      // Value label above the last historical point
      if (d.index === historicalCount - 1) {
        dotGroup.append('text')
          .attr('x', cx)
          .attr('y', cy - 12)
          .attr('text-anchor', 'middle')
          .attr('fill', selectedMetric === 'revenue' ? '#059669' : '#4f46e5')
          .attr('font-size', '11px')
          .attr('font-weight', '800')
          .text(`${(val / 1000).toFixed(1)}k€`);
      }
    });

    // Projected dots (Cyan with diamond/ring style)
    combinedData.slice(historicalCount).forEach((d) => {
      const cx = xScale(d.monthLabel) || 0;
      const val = selectedMetric === 'revenue' ? d.revenueHt : d.marginHt;
      const cy = yScale(val);

      const dotGroup = g.append('g').attr('class', 'dot-projected');

      // Outer glow ring
      dotGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 8)
        .attr('fill', '#06b6d4')
        .attr('fill-opacity', 0.2);

      // Core point
      dotGroup.append('circle')
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', 5)
        .attr('fill', '#0891b2')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Value label on projection points
      dotGroup.append('text')
        .attr('x', cx)
        .attr('y', cy - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0891b2')
        .attr('font-size', '11px')
        .attr('font-weight', '800')
        .text(`${(val / 1000).toFixed(1)}k€*`);
    });

    // 8. X-Axis with custom styled month labels
    const xAxis = d3.axisBottom(xScale).tickSize(0);
    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight + 10})`)
      .call(xAxis);

    xAxisGroup.select('.domain').remove();

    xAxisGroup.selectAll<SVGTextElement, string>('.tick text')
      .attr('font-size', '11px')
      .attr('font-weight', (d) => {
        const item = combinedData.find(item => item.monthLabel === d);
        return item?.isProjected ? '700' : '600';
      })
      .attr('fill', (d) => {
        const item = combinedData.find(item => item.monthLabel === d);
        return item?.isProjected ? '#0891b2' : '#64748b';
      });

    // 9. Y-Axis with formatted Euro labels
    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(0)
      .tickFormat((d) => `${(Number(d) / 1000).toFixed(0)} k€`);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis')
      .attr('transform', 'translate(-10, 0)')
      .call(yAxis);

    yAxisGroup.select('.domain').remove();
    yAxisGroup.selectAll('text')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('fill', '#94a3b8');

    // 10. Interactive Crosshair & Tooltip Overlay
    const focusGroup = g.append('g')
      .attr('class', 'focus-crosshair')
      .style('display', 'none');

    const focusLine = focusGroup.append('line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3');

    const focusCircle = focusGroup.append('circle')
      .attr('r', 7)
      .attr('fill', '#ffffff')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 3)
      .attr('filter', 'drop-shadow(0 2px 6px rgba(99,102,241,0.4))');

    // Invisible overlay rect for mouse tracking
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('pointermove', function (event: MouseEvent) {
        const [pointerX] = d3.pointer(event);
        
        // Find closest data point
        let closestPoint = combinedData[0];
        let minDistance = Infinity;

        combinedData.forEach(d => {
          const px = xScale(d.monthLabel) || 0;
          const dist = Math.abs(pointerX - px);
          if (dist < minDistance) {
            minDistance = dist;
            closestPoint = d;
          }
        });

        if (closestPoint) {
          const cx = xScale(closestPoint.monthLabel) || 0;
          const val = selectedMetric === 'revenue' ? closestPoint.revenueHt : closestPoint.marginHt;
          const cy = yScale(val);

          focusGroup.style('display', null);
          focusLine.attr('x1', cx).attr('x2', cx);
          focusCircle.attr('cx', cx).attr('cy', cy);
          setHoveredPoint(closestPoint);
        }
      })
      .on('pointerleave', function () {
        focusGroup.style('display', 'none');
        setHoveredPoint(null);
      });

  }, [combinedData, historicalCount, selectedMetric, showConfidenceInterval, containerWidth]);

  return (
    <div 
      ref={containerRef}
      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* Top Header & Interactive Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              Modélisation D3.js Officine
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Historique 6 mois (Fév - Juil 2026) • Moindres Carrés
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Projection Linéaire des Revenus & Tendance de Vente
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Régression linéaire mathématique continue (y = ax + b) et intervalle de confiance à 95% pour le pilotage prédictif de trésorerie et d'achats.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Metric Selector Toggle (CA HT vs Marge HT) */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedMetric('revenue')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>CA HT</span>
            </button>
            <button
              onClick={() => setSelectedMetric('margin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedMetric === 'margin'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Marge Brute HT</span>
            </button>
          </div>

          {/* Forecast Horizon (3M vs 6M) */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setForecastHorizon(3)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                forecastHorizon === 3
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Horizon +3M
            </button>
            <button
              onClick={() => setForecastHorizon(6)}
              className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                forecastHorizon === 6
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Horizon +6M
            </button>
          </div>

          {/* Confidence toggle */}
          <button
            onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showConfidenceInterval
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Afficher/Masquer le corridor d'incertitude à 95%"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Corridor 95%</span>
          </button>
        </div>
      </div>

      {/* Regression KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        
        {/* KPI 1: Pente / Tendance mensuelle */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Pente Mensuelle (a)</span>
            {regressionStats.slope >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
            )}
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {regressionStats.slope >= 0 ? '+' : ''}{formatCurrency(regressionStats.slope)} <span className="text-xs font-normal text-slate-500">/ mois</span>
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
            {regressionStats.monthlyGrowthRatePct >= 0 ? '+' : ''}{regressionStats.monthlyGrowthRatePct.toFixed(2)}% / mois en moyenne
          </div>
        </div>

        {/* KPI 2: R² Fiabilité */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
            <span>Coefficient R²</span>
            <Target className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
            {(regressionStats.rSquared * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {regressionStats.rSquared >= 0.7 ? '🟢 Excellente corrélation' : '🟡 Volatilité modérée'}
          </div>
        </div>

        {/* KPI 3: Projection à M+1 (Août/Sep) */}
        <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60">
          <div className="text-[11px] text-cyan-800 dark:text-cyan-300 font-medium flex items-center justify-between">
            <span>Projection M+1 (Août)</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-cyan-900 dark:text-cyan-100 mt-0.5">
            {formatCurrency(regressionStats.firstProjected)}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-0.5">
            Modèle linéaire estimé
          </div>
        </div>

        {/* KPI 4: Projection à Fin d'Horizon */}
        <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60">
          <div className="text-[11px] text-cyan-800 dark:text-cyan-300 font-medium flex items-center justify-between">
            <span>Projection Fin +{forecastHorizon}M</span>
            <Calendar className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-cyan-900 dark:text-cyan-100 mt-0.5">
            {formatCurrency(regressionStats.endProjected)}
          </div>
          <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold mt-0.5">
            {regressionStats.projectedGrowthPct >= 0 ? '+' : ''}{regressionStats.projectedGrowthPct.toFixed(1)}% vs Juil 2026
          </div>
        </div>

      </div>

      {/* SVG Canvas Area */}
      <div className="w-full relative mt-2">
        <svg ref={svgRef} className="w-full select-none" />
      </div>

      {/* Dynamic Hover Details Card or Legend Indicator */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        
        {hoveredPoint ? (
          <div className="flex flex-wrap items-center gap-3 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs shadow-md animate-fadeIn">
            <span className="font-bold text-emerald-400">{hoveredPoint.fullDateLabel}</span>
            <span className="text-slate-300">•</span>
            <span>
              {hoveredPoint.isProjected ? 'Projection Linéaire : ' : 'Réalisé : '}
              <strong className="text-white font-mono">
                {formatCurrency(selectedMetric === 'revenue' ? hoveredPoint.revenueHt : hoveredPoint.marginHt)}
              </strong>
            </span>
            {hoveredPoint.confidenceLowerHt && hoveredPoint.confidenceUpperHt && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-300 text-[11px]">
                  Corridor 95% : [{formatCurrency(hoveredPoint.confidenceLowerHt)} - {formatCurrency(hoveredPoint.confidenceUpperHt)}]
                </span>
              </>
            )}
            {hoveredPoint.isProjected && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PROJETÉ
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow-xs" />
              <span>Données Historiques Réelles (Fév-Juil)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-indigo-500 border-t-2 border-dashed border-indigo-500" />
              <span>Droite de Régression (y = {regressionStats.slope.toFixed(0)}x + {regressionStats.intercept.toFixed(0)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500 border border-white dark:border-slate-900 shadow-xs" />
              <span>Prévision Linéaire M+{forecastHorizon}</span>
            </div>
            {showConfidenceInterval && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-2.5 rounded bg-indigo-300/40 border border-indigo-400/40" />
                <span>Intervalle de Confiance 95%</span>
              </div>
            )}
          </div>
        )}

        {onNavigateTab && (
          <button
            onClick={() => onNavigateTab('ventes')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 self-start sm:self-auto cursor-pointer"
          >
            <span>Voir l'analyse saisonnière 3 ans</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
