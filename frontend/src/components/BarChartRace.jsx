import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BarChartRace({ data, options, width = 900, height = 400 }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    
    // Initialize container group if it doesn't exist
    if (!gRef.current) {
      const margin = { top: 20, right: 200, bottom: 30, left: 200 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      gRef.current = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add static axes containers
      gRef.current.append('g').attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`);
      gRef.current.append('g').attr('class', 'y-axis');
    }

    const margin = { top: 20, right: 200, bottom: 30, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Calculate maximum bar width to leave space for labels
    const maxBarWidth = innerWidth * 0.75; // Limit bars to 75% of inner width

    // Update scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count || 0)])
      .range([0, maxBarWidth]);

    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerHeight])
      .padding(0.1);

    // Update axes with transition
    const t = d3.transition().duration(750);

    gRef.current.select('.x-axis')
      .transition(t)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', '12px');

    gRef.current.select('.y-axis')
      .transition(t)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-size', '14px');

    // Update bars
    const bars = gRef.current.selectAll('.bar')
      .data(data, d => d.label);

    // Exit
    bars.exit()
      .transition(t)
      .attr('width', 0)
      .remove();

    // Enter
    const barsEnter = bars.enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.label))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0);

    // Update + Enter
    bars.merge(barsEnter)
      .transition(t)
      .attr('y', d => y(d.label))
      .attr('height', y.bandwidth())
      .attr('fill', d => d.isCorrect ? 'rgba(72, 187, 120, 0.8)' : 'rgba(54, 162, 235, 0.8)')
      .attr('width', d => x(d.count || 0));

    // Calculate label padding
    const labelPadding = 15; // Padding for label backgrounds

    // Update label backgrounds
    const labelBgs = gRef.current.selectAll('.label-bg')
      .data(data, d => d.label);

    labelBgs.exit().remove();

    const labelBgsEnter = labelBgs.enter()
      .append('rect')
      .attr('class', 'label-bg')
      .attr('y', d => y(d.label) + y.bandwidth() / 4)
      .attr('height', y.bandwidth() / 2)
      .attr('fill', 'white')
      .attr('opacity', 0.9);

    labelBgs.merge(labelBgsEnter)
      .transition(t)
      .attr('x', d => Math.max(x(d.count || 0) - labelPadding, 0))
      .attr('y', d => y(d.label) + y.bandwidth() / 4)
      .attr('width', d => {
        const labelWidth = String(d.count || 0).length * 12;
        const correctWidth = d.isCorrect ? 100 : 0; // Increased width for "Correct" label
        return labelWidth + correctWidth + (labelPadding * 2); // Add padding on both sides
      });

    // Update value labels
    const labels = gRef.current.selectAll('.value-label')
      .data(data, d => d.label);

    labels.exit().remove();

    const labelsEnter = labels.enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('dy', '0.35em')
      .attr('font-size', '14px')
      .attr('fill', '#4A5568')
      .attr('font-weight', 'bold')
      .attr('opacity', 0);

    labels.merge(labelsEnter)
      .transition(t)
      .attr('x', d => Math.max(x(d.count || 0) + 5, 5))
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .text(d => d.count || 0)
      .attr('opacity', 1);

    // Update correct indicators
    const indicators = gRef.current.selectAll('.correct-indicator')
      .data(data.filter(d => d.isCorrect), d => d.label);

    indicators.exit().remove();

    const indicatorsEnter = indicators.enter()
      .append('text')
      .attr('class', 'correct-indicator')
      .attr('dy', '0.35em')
      .attr('font-size', '14px')
      .attr('fill', '#48BB78')
      .attr('font-weight', 'bold')
      .text('✓ Correct')
      .attr('opacity', 0);

    indicators.merge(indicatorsEnter)
      .transition(t)
      .attr('x', d => Math.max(x(d.count || 0) + 45, 45))
      .attr('y', d => y(d.label) + y.bandwidth() / 2)
      .attr('opacity', 1);

  }, [data, width, height]);

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}

export default BarChartRace;
