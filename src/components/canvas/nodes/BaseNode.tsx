import { Handle, Position } from '@xyflow/react';
import type { ReactNode } from 'react';
import { NODE_PORT_REGISTRY, type NodeType } from '../../../types/workflow';
import './BaseNode.css';

interface BaseNodeProps {
    nodeType: NodeType;
    children: ReactNode;
    className?: string;
}

export function BaseNode({ nodeType, children, className = '' }: BaseNodeProps) {
    const portConfig = NODE_PORT_REGISTRY[nodeType];

    if (!portConfig) {
        console.warn(`No port config found for node type: ${nodeType}`);
        return <div className={`base-node ${className}`}>{children}</div>;
    }

    // Determine the max number of ports to set appropriate min-height for the node
    const maxPorts = Math.max(portConfig.inputs.length, portConfig.outputs.length);

    return (
        <div
            className={`base-node ${className}`}
            style={{ minHeight: maxPorts > 0 ? `${Math.max(40, maxPorts * 24 + 16)}px` : undefined }}
        >
            {/* Input Handles */}
            <div className="base-node__inputs">
                {portConfig.inputs.map((port) => (
                    <div key={`in-${port.id}`} className="base-node__port-container base-node__port-container--left">
                        <Handle
                            type="target"
                            id={port.id}
                            position={Position.Left}
                            className={`base-node__handle base-node__handle--${port.dataType}`}
                        />
                        <span className="base-node__port-label">{port.label}</span>
                    </div>
                ))}
            </div>

            {/* Node Content */}
            <div className="base-node__content">
                {children}
            </div>

            {/* Output Handles */}
            <div className="base-node__outputs">
                {portConfig.outputs.map((port) => (
                    <div key={`out-${port.id}`} className="base-node__port-container base-node__port-container--right">
                        <span className="base-node__port-label">{port.label}</span>
                        <Handle
                            type="source"
                            id={port.id}
                            position={Position.Right}
                            className={`base-node__handle base-node__handle--${port.dataType}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
