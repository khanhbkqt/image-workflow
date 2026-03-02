import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { AppNode } from '../../types/canvas';
import './CanvasContextMenu.css';

interface CanvasContextMenuProps {
    x: number;
    y: number;
    flowX: number;
    flowY: number;
    onClose: () => void;
}

interface NodeMenuItem {
    icon: string;
    label: string;
    desc: string;
    createNode: (id: string, position: { x: number; y: number }) => AppNode;
}

const ADDABLE_NODES: NodeMenuItem[] = [
    {
        icon: '✏️',
        label: 'Prompt',
        desc: 'Generate an image from text',
        createNode: (id, position) => ({
            id,
            type: 'prompt' as const,
            position,
            data: { label: 'Prompt', prompt: '' },
        }),
    },
];

export function CanvasContextMenu({ x, y, flowX, flowY, onClose }: CanvasContextMenuProps) {
    const addNode = useCanvasStore((s) => s.addNode);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside or Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [onClose]);

    const handleAdd = (item: NodeMenuItem) => {
        const id = `node-${Date.now()}`;
        const newNode = item.createNode(id, { x: flowX, y: flowY });
        addNode(newNode);
        onClose();
    };

    // Adjust menu position to stay within viewport
    const style: React.CSSProperties = {
        left: x,
        top: y,
    };

    return (
        <div ref={menuRef} className="canvas-context-menu" style={style} role="menu">
            <div className="canvas-context-menu__section-label">Add Node</div>
            {ADDABLE_NODES.map((item) => (
                <button
                    key={item.label}
                    className="canvas-context-menu__item"
                    onClick={() => handleAdd(item)}
                    role="menuitem"
                >
                    <span className="canvas-context-menu__item-icon">{item.icon}</span>
                    <span className="canvas-context-menu__item-info">
                        <span className="canvas-context-menu__item-name">{item.label}</span>
                        <span className="canvas-context-menu__item-desc">{item.desc}</span>
                    </span>
                </button>
            ))}
        </div>
    );
}
