import type { Connection, Edge, Node } from '@xyflow/react';
import { NODE_PORT_REGISTRY, CONNECTION_COMPATIBILITY } from '../types/workflow';
import type { NodeType } from '../types/workflow';

export function isValidConnection(
    connection: Connection,
    nodes: Node[],
    edges: Edge[],
    portRegistry = NODE_PORT_REGISTRY
): boolean {
    const { source, target, sourceHandle, targetHandle } = connection;

    // 1. Prevent self-connections
    if (source === target) {
        return false;
    }

    const sourceNode = nodes.find(n => n.id === source);
    const targetNode = nodes.find(n => n.id === target);

    if (!sourceNode || !targetNode || !sourceNode.type || !targetNode.type) {
        return false;
    }

    // 2. Prevent duplicate edges (normalize null/undefined handles to avoid false positives)
    const normSrcHandle = sourceHandle ?? null;
    const normTgtHandle = targetHandle ?? null;
    const isDuplicate = edges.some(
        e =>
            e.source === source &&
            e.target === target &&
            (e.sourceHandle ?? null) === normSrcHandle &&
            (e.targetHandle ?? null) === normTgtHandle
    );
    if (isDuplicate) {
        return false;
    }

    const sourceConfig = portRegistry[sourceNode.type as NodeType];
    const targetConfig = portRegistry[targetNode.type as NodeType];

    if (!sourceConfig || !targetConfig) {
        return false;
    }

    const sourcePort = sourceConfig.outputs.find(p => p.id === sourceHandle);
    const targetPort = targetConfig.inputs.find(p => p.id === targetHandle);

    if (!sourcePort || !targetPort) {
        // Missing handle definition — allow as fallback
        return true;
    }

    // 3. Check port type compatibility
    const allowedInputTypes = CONNECTION_COMPATIBILITY[sourcePort.dataType] || [];
    if (!allowedInputTypes.includes(targetPort.dataType)) {
        return false;
    }

    // 4. Check max connections per port on target
    if (targetPort.maxConnections !== undefined) {
        const existingConnectionsToTargetPort = edges.filter(
            e => e.target === target && (e.targetHandle ?? null) === normTgtHandle
        );
        if (existingConnectionsToTargetPort.length >= targetPort.maxConnections) {
            return false;
        }
    }

    // 5. Check max connections per port on source (if defined)
    if (sourcePort.maxConnections !== undefined) {
        const existingConnectionsFromSourcePort = edges.filter(
            e => e.source === source && (e.sourceHandle ?? null) === normSrcHandle
        );
        if (existingConnectionsFromSourcePort.length >= sourcePort.maxConnections) {
            return false;
        }
    }

    return true;
}
