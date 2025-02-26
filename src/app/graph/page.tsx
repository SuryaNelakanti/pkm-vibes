'use client';

import { useState, useEffect } from 'react';
import { KnowledgeGraph } from '@/components/Graph/KnowledgeGraph';
import { GraphService } from '@/services/graph.service';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalLinks: 0,
    avgLinksPerNote: 0,
    mostConnectedNotes: [],
  });

  const graphService = new GraphService();

  useEffect(() => {
    loadGraphData();
    loadStats();
  }, []);

  const loadGraphData = async () => {
    try {
      const data = await graphService.getGlobalGraph();
      setGraphData(data);
    } catch (error) {
      console.error('Error loading graph data:', error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await graphService.getGraphStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading graph stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 via-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/50 border-b border-border/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Knowledge Graph
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize connections between your notes
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.totalNotes}
              </p>
              <p className="text-xs text-muted-foreground">Total Notes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.totalLinks}
              </p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {stats.avgLinksPerNote.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Avg. Links/Note</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Graph Visualization */}
        <div className="flex-1 relative">
          <KnowledgeGraph
            data={graphData}
            onNodeClick={(nodeId) => setSelectedNode(nodeId)}
            width={800}
            height={600}
          />
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border/50 backdrop-blur-xl bg-background/50 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Most Connected Notes */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Most Connected Notes
              </h3>
              <div className="space-y-2">
                {stats.mostConnectedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <p className="font-medium text-sm">{note.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {note.connections} connections
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Graph Controls */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Graph Controls
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                  Center Graph
                </button>
                <button className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                  Reset Zoom
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
