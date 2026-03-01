import { useEdges, useNodesData } from '@xyflow/react';
import { useMemo } from 'react';

/**
 * Hook to read all upstream data flowing into a particular node,
 * grouped by the target handle (input port) ID.
 */
export function useUpstreamData(nodeId: string) {
    // 1. Get all edges to find incoming connections to nodeId
    const edges = useEdges();

    const incomingEdges = useMemo(
        () => edges.filter((e) => e.target === nodeId),
        [edges, nodeId]
    );

    const sourceIds = useMemo(
        () => incomingEdges.map((e) => e.source),
        [incomingEdges]
    );

    // 2. Get data for all source nodes - useNodesData retrieves the data object for each node
    const sourceNodesData = useNodesData(sourceIds);

    // 3. Group the data by the targetHandle (which is the input port ID)
    const upstreamDataByPort = useMemo(() => {
        const result: Record<string, Array<{ sourceId: string; data: any }>> = {};

        incomingEdges.forEach((edge) => {
            if (!edge.targetHandle) return;

            // sourceNodesData might be a single object or an array depending on React Flow version,
            // but for an array of IDs, it should return an array of { id, data }.
            const nodeInfo = Array.isArray(sourceNodesData)
                ? sourceNodesData.find((d) => d.id === edge.source)
                : (sourceNodesData as any)?.id === edge.source ? sourceNodesData : null;

            const nodeData = nodeInfo?.data;
            if (!nodeData) return;

            if (!result[edge.targetHandle]) {
                result[edge.targetHandle] = [];
            }
            result[edge.targetHandle].push({
                sourceId: edge.source,
                data: nodeData
            });
        });

        return result;
    }, [incomingEdges, sourceNodesData]);

    return upstreamDataByPort;
}
