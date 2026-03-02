export type PortDataType = 'ingredient' | 'image' | 'any';

export interface PortDefinition {
    id: string;
    label: string;
    dataType: PortDataType;
    maxConnections?: number;
}

export interface NodePortConfig {
    inputs: PortDefinition[];
    outputs: PortDefinition[];
}

export type NodeType =
    | 'ingredient'
    | 'prompt';

export const NODE_PORT_REGISTRY: Record<NodeType, NodePortConfig> = {
    'ingredient': {
        inputs: [],
        outputs: [{ id: 'out', label: 'Image', dataType: 'image' }],
    },
    'prompt': {
        inputs: [
            { id: 'image_in', label: 'Image', dataType: 'image' },
        ],
        outputs: [{ id: 'image_out', label: 'Image', dataType: 'image' }],
    },
};

export type ConnectionRule = Record<PortDataType, PortDataType[]>;

// Which output data types can connect to which input data types
export const CONNECTION_COMPATIBILITY: ConnectionRule = {
    'ingredient': ['image', 'any'],
    'image': ['image', 'any'],
    'any': ['ingredient', 'image', 'any'],
};
