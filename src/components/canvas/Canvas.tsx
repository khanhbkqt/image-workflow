import {
    ReactFlow,
    MiniMap,
    Background,
    BackgroundVariant,
    useReactFlow,
    type ReactFlowInstance,
} from '@xyflow/react';
import { useCallback, useState } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import { nodeTypes } from './nodes/nodeRegistry';
import { ZoomControls } from './ZoomControls';
import type { AppNode, AppEdge, IngredientNodeData } from '../../types/canvas';
import type { IngredientType } from '../../types/ingredient';
import { isValidConnection } from '../../utils/connectionValidator';
import '@xyflow/react/dist/style.css';
import '../../styles/canvas.css';

/* ── Drag payload shape (matches IngredientCard encoder) ─────────────── */
interface DraggedIngredient {
    id: string;
    name: string;
    type: IngredientType;
    tags: string[];
    imageUrl?: string;
    description?: string;
    icon: string;
}

/* ── Inner Canvas (needs ReactFlow context for useReactFlow) ─────────── */
function CanvasInner() {
    const nodes = useCanvasStore((s) => s.nodes);
    const edges = useCanvasStore((s) => s.edges);
    const onNodesChange = useCanvasStore((s) => s.onNodesChange);
    const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
    const onConnect = useCanvasStore((s) => s.onConnect);
    const setViewport = useCanvasStore((s) => s.setViewport);
    const addNode = useCanvasStore((s) => s.addNode);

    const { screenToFlowPosition, updateNode } = useReactFlow<AppNode, AppEdge>();
    const [isDragOver, setIsDragOver] = useState(false);

    const onInit = useCallback(
        (instance: ReactFlowInstance<AppNode, AppEdge>) => {
            const vp = instance.getViewport();
            setViewport(vp);
        },
        [setViewport],
    );

    /* ── Drop handlers ── */
    const onDragOver = useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('application/ingredient')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }
    }, []);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        if (e.dataTransfer.types.includes('application/ingredient')) {
            setIsDragOver(true);
        }
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, []);

    const flashNode = useCallback(
        (nodeId: string) => {
            updateNode(nodeId, { className: 'ingredient-node--flash' });
            setTimeout(() => {
                updateNode(nodeId, { className: '' });
            }, 700);
        },
        [updateNode],
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const raw = e.dataTransfer.getData('application/ingredient');
            if (!raw) return;

            let ingredient: DraggedIngredient;
            try {
                ingredient = JSON.parse(raw) as DraggedIngredient;
            } catch {
                return;
            }

            // Duplicate prevention — find existing ingredient node with same ingredientId
            const existingNode = nodes.find(
                (n) =>
                    n.type === 'ingredient' &&
                    (n.data as IngredientNodeData).ingredientId === ingredient.id,
            );

            if (existingNode) {
                flashNode(existingNode.id);
                return;
            }

            const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });

            const nodeData: IngredientNodeData = {
                label: ingredient.name,
                ingredientId: ingredient.id,
                ingredientType: ingredient.type,
                icon: ingredient.icon,
                description: ingredient.description,
                imageUrl: ingredient.imageUrl,
            };

            const newNode: AppNode = {
                id: `ingredient-${ingredient.id}-${Date.now()}`,
                type: 'ingredient',
                position,
                data: nodeData,
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode, nodes, flashNode],
    );

    const isValidConnectionFn = useCallback(
        (edgeOrConnection: import('@xyflow/react').Edge | import('@xyflow/react').Connection) => {
            const connection: import('@xyflow/react').Connection = {
                source: edgeOrConnection.source,
                target: edgeOrConnection.target,
                sourceHandle: edgeOrConnection.sourceHandle ?? null,
                targetHandle: edgeOrConnection.targetHandle ?? null,
            };
            return isValidConnection(connection, nodes, edges);
        },
        [nodes, edges]
    );

    return (
        <div
            className={`canvas-drop-zone${isDragOver ? ' canvas-drop-zone--active' : ''}`}
            style={{ width: '100%', height: '100%' }}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                isValidConnection={isValidConnectionFn}
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
        </div>
    );
}

/* ── Canvas Component ────────────────────────────────────────────────── */
export function Canvas() {
    return <CanvasInner />;
}
