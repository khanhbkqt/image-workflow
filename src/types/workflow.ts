export type PortDataType = 'ingredient' | 'prompt' | 'image' | 'style' | 'batch' | 'any';

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
    | 'compose'
    | 'preview'
    | 'output'
    | 'generate'
    | 'batch-generator'
    | 'style-fanout'
    | 'generate-ingredient'
    | 'brand-kit'
    | 'placeholder';

export const NODE_PORT_REGISTRY: Record<NodeType, NodePortConfig> = {
    'ingredient': {
        inputs: [],
        outputs: [{ id: 'out', label: 'Ingredient', dataType: 'ingredient' }],
    },
    'brand-kit': {
        inputs: [],
        outputs: [{ id: 'out', label: 'Brand Kit', dataType: 'style' }],
    },
    'compose': {
        inputs: [
            { id: 'bg', label: 'Background', dataType: 'image', maxConnections: 1 },
            { id: 'fg', label: 'Foreground', dataType: 'image', maxConnections: 1 }
        ],
        outputs: [{ id: 'out', label: 'Image', dataType: 'image' }],
    },
    'preview': {
        inputs: [{ id: 'in', label: 'Image', dataType: 'image' }],
        outputs: [],
    },
    'output': {
        inputs: [{ id: 'in', label: 'Image', dataType: 'image' }],
        outputs: [],
    },
    'generate': {
        inputs: [
            { id: 'prompt', label: 'Prompt', dataType: 'prompt' },
            { id: 'style', label: 'Style', dataType: 'style' },
            { id: 'image', label: 'Base Image (Opt)', dataType: 'image' }
        ],
        outputs: [{ id: 'out', label: 'Image', dataType: 'image' }],
    },
    'batch-generator': {
        inputs: [{ id: 'prompt', label: 'Prompt', dataType: 'prompt' }],
        outputs: [{ id: 'out', label: 'Batch', dataType: 'batch' }],
    },
    'style-fanout': {
        inputs: [
            { id: 'in', label: 'Image', dataType: 'image' },
            { id: 'styles', label: 'Styles', dataType: 'style' }
        ],
        outputs: [{ id: 'out', label: 'Images', dataType: 'batch' }],
    },
    'generate-ingredient': {
        inputs: [{ id: 'prompt', label: 'Prompt', dataType: 'prompt' }],
        outputs: [{ id: 'out', label: 'Ingredient', dataType: 'ingredient' }],
    },
    'placeholder': {
        inputs: [{ id: 'in', label: 'In', dataType: 'any' }],
        outputs: [{ id: 'out', label: 'Out', dataType: 'any' }],
    }
};

export type ConnectionRule = Record<PortDataType, PortDataType[]>;

// Which outputs can connect to which inputs
export const CONNECTION_COMPATIBILITY: ConnectionRule = {
    'ingredient': ['ingredient', 'prompt', 'image', 'any'], // ingredients can be used as prompt text, base images, or raw ingredients
    'prompt': ['prompt', 'any'],
    'image': ['image', 'any'],
    'style': ['style', 'any'],
    'batch': ['batch', 'any'],
    'any': ['ingredient', 'prompt', 'image', 'style', 'batch', 'any'],
};
