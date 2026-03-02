import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../stores/canvasStore';
import type { AppNode } from '../../types/canvas';
import './NodeContextMenu.css';

interface NodeContextMenuProps {
    node: AppNode;
    x: number;
    y: number;
    onClose: () => void;
}

export function NodeContextMenu({ node, x, y, onClose }: NodeContextMenuProps) {
    const removeNode = useCanvasStore((s) => s.removeNode);
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

    const handleDelete = () => {
        removeNode(node.id);
        onClose();
    };

    const handleDuplicate = () => {
        const duplicate: AppNode = {
            ...node,
            id: `${node.id}-copy-${Date.now()}`,
            position: {
                x: node.position.x + 30,
                y: node.position.y + 30,
            },
            selected: false,
        } as AppNode;
        addNode(duplicate);
        onClose();
    };

    const style: React.CSSProperties = { left: x, top: y };

    return (
        <div ref={menuRef} className="node-context-menu" style={style} role="menu">
            <button
                className="node-context-menu__item"
                onClick={handleDuplicate}
                role="menuitem"
            >
                <span className="node-context-menu__item-icon">⧉</span>
                Duplicate
            </button>
            <div className="node-context-menu__divider" />
            <button
                className="node-context-menu__item node-context-menu__item--danger"
                onClick={handleDelete}
                role="menuitem"
            >
                <span className="node-context-menu__item-icon">🗑</span>
                Delete
            </button>
        </div>
    );
}
