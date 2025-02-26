import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, GraphNode, GraphLink } from '@/services/graph.service';

interface KnowledgeGraphProps {
  data: GraphData;
  onNodeClick?: (nodeId: string) => void;
  width?: number;
  height?: number;
}

export function KnowledgeGraph({
  data,
  onNodeClick,
  width = 800,
  height = 600,
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    const container = svg.append('g');

    // Create forces
    const simulation = d3
      .forceSimulation<GraphNode>(data.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(data.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Create links
    const links = container
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // Create nodes
    const nodes = container
      .append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      )
      .on('click', (event, d) => onNodeClick?.(d.id));

    // Add circles to nodes
    nodes
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d) => getNodeColor(d.type));

    // Add labels to nodes
    nodes
      .append('text')
      .text((d) => d.label)
      .attr('x', 8)
      .attr('y', 3)
      .attr('class', 'text-sm fill-current');

    // Add tags as small circles
    nodes.each(function (d) {
      const node = d3.select(this);
      d.tags.forEach((tag, i) => {
        node
          .append('circle')
          .attr('r', 3)
          .attr('cx', -5 - i * 8)
          .attr('cy', -5)
          .attr('fill', getTagColor(tag));
      });
    });

    // Update positions on each tick
    simulation.on('tick', () => {
      links
        .attr('x1', (d) => (d.source as GraphNode).x!)
        .attr('y1', (d) => (d.source as GraphNode).y!)
        .attr('x2', (d) => (d.target as GraphNode).x!)
        .attr('y2', (d) => (d.target as GraphNode).y!);

      nodes.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full bg-background"
        style={{ cursor: 'grab' }}
      />
    </div>
  );
}

// Helper functions
function getNodeColor(type: string): string {
  switch (type) {
    case 'document':
      return '#4f46e5'; // indigo-600
    case 'outline':
      return '#0891b2'; // cyan-600
    default:
      return '#6b7280'; // gray-500
  }
}

function getTagColor(tag: string): string {
  // Generate a consistent color based on the tag string
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
