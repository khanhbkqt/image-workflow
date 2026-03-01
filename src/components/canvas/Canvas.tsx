import {
    ReactFlow,
    MiniMap,
    Background,
    BackgroundVariant,
    type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { nodeTypes } from './PlaceholderNode';
import { ZoomControls } from './ZoomControls';
import type { AppNode, AppEdge } from '../../types/canvas';
import '../../styles/canvas.css';

/* ── Canvas Component ────────────────────────────────────────────────── */
export function Canvas() {
    const nodes = useCanvasStore((s) => s.nodes);
    const edges = useCanvasStore((s) => s.edges);
    const onNodesChange = useCanvasStore((s) => s.onNodesChange);
    const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
    const onConnect = useCanvasStore((s) => s.onConnect);
    const setViewport = useCanvasStore((s) => s.setViewport);

    const onInit = useCallback(
        (instance: ReactFlowInstance<AppNode, AppEdge>) => {
            const vp = instance.getViewport();
            setViewport(vp);
        },
        [setViewport],
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            nodeTypes={nodeTypes}
            colorMode="dark"
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.1}
            maxZoom={4}
            defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
            proOptions={{ hideAttribution: true }}
        >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <MiniMap pannable zoomable position="bottom-left" />
            <ZoomControls />
        </ReactFlow>
    );
}
