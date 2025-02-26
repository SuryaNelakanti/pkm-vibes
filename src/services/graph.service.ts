import { PrismaClient, Note, NoteLink } from '@prisma/client';

const prisma = new PrismaClient();

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  tags: string[];
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export class GraphService {
  async getGlobalGraph(): Promise<GraphData> {
    const notes = await prisma.note.findMany({
      include: {
        outgoingLinks: true,
      },
    });

    const nodes: GraphNode[] = notes.map((note) => ({
      id: note.id,
      label: note.title,
      type: note.type,
      tags: note.tags,
    }));

    const links: GraphLink[] = notes.flatMap((note) =>
      note.outgoingLinks.map((link) => ({
        source: link.sourceId,
        target: link.targetId,
      }))
    );

    return { nodes, links };
  }

  async getLocalGraph(noteId: string, depth: number = 2): Promise<GraphData> {
    const relatedNotes = new Set<string>([noteId]);
    const links: GraphLink[] = [];

    // Breadth-first search to find related notes up to specified depth
    for (let i = 0; i < depth; i++) {
      const currentNotes = Array.from(relatedNotes);
      for (const currentNoteId of currentNotes) {
        // Get outgoing links
        const outgoingLinks = await prisma.noteLink.findMany({
          where: { sourceId: currentNoteId },
        });
        outgoingLinks.forEach((link) => {
          relatedNotes.add(link.targetId);
          links.push({
            source: link.sourceId,
            target: link.targetId,
          });
        });

        // Get incoming links
        const incomingLinks = await prisma.noteLink.findMany({
          where: { targetId: currentNoteId },
        });
        incomingLinks.forEach((link) => {
          relatedNotes.add(link.sourceId);
          links.push({
            source: link.sourceId,
            target: link.targetId,
          });
        });
      }
    }

    // Get note details for all related notes
    const notes = await prisma.note.findMany({
      where: {
        id: {
          in: Array.from(relatedNotes),
        },
      },
    });

    const nodes: GraphNode[] = notes.map((note) => ({
      id: note.id,
      label: note.title,
      type: note.type,
      tags: note.tags,
    }));

    return { nodes, links };
  }

  async findShortestPath(startId: string, endId: string): Promise<string[]> {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [
      { id: startId, path: [startId] },
    ];
    visited.add(startId);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;

      if (id === endId) {
        return path;
      }

      // Get all connected notes through outgoing links
      const outgoingLinks = await prisma.noteLink.findMany({
        where: { sourceId: id },
      });

      for (const link of outgoingLinks) {
        if (!visited.has(link.targetId)) {
          visited.add(link.targetId);
          queue.push({
            id: link.targetId,
            path: [...path, link.targetId],
          });
        }
      }

      // Get all connected notes through incoming links
      const incomingLinks = await prisma.noteLink.findMany({
        where: { targetId: id },
      });

      for (const link of incomingLinks) {
        if (!visited.has(link.sourceId)) {
          visited.add(link.sourceId);
          queue.push({
            id: link.sourceId,
            path: [...path, link.sourceId],
          });
        }
      }
    }

    return []; // No path found
  }

  async getGraphStats(): Promise<{
    totalNotes: number;
    totalLinks: number;
    avgLinksPerNote: number;
    mostConnectedNotes: Array<{
      id: string;
      title: string;
      connections: number;
    }>;
  }> {
    const [notesCount, linksCount, notes] = await Promise.all([
      prisma.note.count(),
      prisma.noteLink.count(),
      prisma.note.findMany({
        include: {
          _count: {
            select: {
              outgoingLinks: true,
              incomingLinks: true,
            },
          },
        },
      }),
    ]);

    const notesWithConnections = notes.map((note) => ({
      id: note.id,
      title: note.title,
      connections: note._count.outgoingLinks + note._count.incomingLinks,
    }));

    const mostConnected = notesWithConnections
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5);

    return {
      totalNotes: notesCount,
      totalLinks: linksCount,
      avgLinksPerNote: linksCount / notesCount,
      mostConnectedNotes: mostConnected,
    };
  }
}
