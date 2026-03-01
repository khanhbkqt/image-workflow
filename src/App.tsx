import { Button } from './components/ui/Button';
import { Panel } from './components/ui/Panel';
import { Input } from './components/ui/Input';
import './App.css';

/* ── Tiny SVG icons for demo purposes ──────────────────────────────────── */
const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6.5" cy="6.5" r="5" />
    <path d="M10.5 10.5L15 15" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1l2.1 4.3 4.7.7-3.4 3.3.8 4.7L8 11.8 3.8 14l.8-4.7L1.2 6l4.7-.7z" />
  </svg>
);

/* ── Color Swatch ──────────────────────────────────────────────────────── */
function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="swatch">
      <div className="swatch__color" style={{ background: `var(${cssVar})` }} />
      <span className="swatch__name">{name}</span>
      <span className="swatch__var mono">{cssVar}</span>
    </div>
  );
}

/* ── Spacing Block ─────────────────────────────────────────────────────── */
function SpaceBlock({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="space-block">
      <div className="space-block__bar" style={{ width: `var(${cssVar})` }} />
      <span className="space-block__label mono">{name}</span>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────────────── */
function App() {
  return (
    <div className="showcase">
      <header className="showcase__header">
        <h1 className="h1">
          Design System <span className="showcase__accent">Showcase</span>
        </h1>
        <p className="body-lg" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
          Every token, every variant — the visual language of Image Workflow.
        </p>
      </header>

      {/* ── Color Palette ─────────────────────────────────────────── */}
      <Panel variant="glass" title="Color Palette" padding="lg">
        <div className="showcase__section">
          <span className="overline">Surfaces</span>
          <div className="swatch-grid">
            <Swatch name="Surface 0" cssVar="--surface-0" />
            <Swatch name="Surface 1" cssVar="--surface-1" />
            <Swatch name="Surface 2" cssVar="--surface-2" />
            <Swatch name="Surface 3" cssVar="--surface-3" />
            <Swatch name="Surface 4" cssVar="--surface-4" />
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">Text</span>
          <div className="swatch-grid">
            <Swatch name="Primary" cssVar="--text-primary" />
            <Swatch name="Secondary" cssVar="--text-secondary" />
            <Swatch name="Muted" cssVar="--text-muted" />
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">Accent</span>
          <div className="swatch-grid">
            <Swatch name="Accent" cssVar="--accent" />
            <Swatch name="Hover" cssVar="--accent-hover" />
            <Swatch name="Subtle" cssVar="--accent-subtle" />
            <Swatch name="Muted" cssVar="--accent-muted" />
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">Semantic</span>
          <div className="swatch-grid">
            <Swatch name="Success" cssVar="--success" />
            <Swatch name="Warning" cssVar="--warning" />
            <Swatch name="Error" cssVar="--error" />
            <Swatch name="Info" cssVar="--info" />
          </div>
        </div>
      </Panel>

      {/* ── Typography ────────────────────────────────────────────── */}
      <Panel variant="glass" title="Typography" padding="lg">
        <div className="typography-demo">
          <div className="type-row">
            <span className="label">h1</span>
            <span className="h1">Display Heading</span>
          </div>
          <div className="type-row">
            <span className="label">h2</span>
            <span className="h2">Section Title</span>
          </div>
          <div className="type-row">
            <span className="label">h3</span>
            <span className="h3">Subsection</span>
          </div>
          <div className="type-row">
            <span className="label">h4</span>
            <span className="h4">Card Title</span>
          </div>
          <div className="type-row">
            <span className="label">h5</span>
            <span className="h5">Widget Heading</span>
          </div>
          <div className="type-row">
            <span className="label">h6</span>
            <span className="h6">Label Heading</span>
          </div>
          <hr className="showcase__divider" />
          <div className="type-row">
            <span className="label">body-lg</span>
            <span className="body-lg">Large body text for introductions and emphasis.</span>
          </div>
          <div className="type-row">
            <span className="label">body</span>
            <span className="body">Standard body text for general content and descriptions.</span>
          </div>
          <div className="type-row">
            <span className="label">body-sm</span>
            <span className="body-sm">Small body text for secondary information.</span>
          </div>
          <hr className="showcase__divider" />
          <div className="type-row">
            <span className="label">label</span>
            <span className="label" style={{ color: 'var(--text-primary)' }}>Form label text</span>
          </div>
          <div className="type-row">
            <span className="label">caption</span>
            <span className="caption">Caption text for metadata and timestamps</span>
          </div>
          <div className="type-row">
            <span className="label">overline</span>
            <span className="overline">Section Overline</span>
          </div>
          <div className="type-row">
            <span className="label">mono</span>
            <span className="mono">const value = 42; // monospaced</span>
          </div>
        </div>
      </Panel>

      {/* ── Buttons ───────────────────────────────────────────────── */}
      <Panel variant="glass" title="Buttons" padding="lg">
        <div className="showcase__section">
          <span className="overline">Variants</span>
          <div className="button-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">Sizes</span>
          <div className="button-row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">With Icons</span>
          <div className="button-row">
            <Button icon={<StarIcon />}>Favorite</Button>
            <Button variant="secondary" icon={<SearchIcon />}>Search</Button>
            <Button variant="ghost" icon={<StarIcon />} />
          </div>
        </div>

        <div className="showcase__section">
          <span className="overline">States</span>
          <div className="button-row">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button variant="danger" loading>Deleting</Button>
          </div>
        </div>
      </Panel>

      {/* ── Panels ────────────────────────────────────────────────── */}
      <Panel variant="glass" title="Panels" padding="lg">
        <div className="panel-demos">
          <Panel variant="default" title="Default Panel" padding="md">
            <p className="body-sm">Standard surface-1 background with subtle border. Used for general content grouping.</p>
          </Panel>
          <Panel variant="elevated" title="Elevated Panel" padding="md">
            <p className="body-sm">Elevated surface-2 with shadow. Used for cards and floating content.</p>
          </Panel>
          <Panel variant="glass" title="Glass Panel" padding="md">
            <p className="body-sm">Semi-transparent with backdrop blur. Great for overlaying on canvas.</p>
          </Panel>
        </div>
      </Panel>

      {/* ── Inputs ────────────────────────────────────────────────── */}
      <Panel variant="glass" title="Inputs" padding="lg">
        <div className="input-demos">
          <Input label="Name" placeholder="Enter your name" />
          <Input label="Search" icon={<SearchIcon />} placeholder="Search nodes..." />
          <Input label="Email" placeholder="invalid@" error="Please enter a valid email address" />
          <Input label="Small Input" size="sm" placeholder="Compact size" />
        </div>
      </Panel>

      {/* ── Spacing & Radii ───────────────────────────────────────── */}
      <Panel variant="glass" title="Spacing Scale" padding="lg">
        <div className="spacing-demo">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <SpaceBlock key={n} name={`--space-${n}`} cssVar={`--space-${n}`} />
          ))}
        </div>
      </Panel>

      <Panel variant="glass" title="Border Radii" padding="lg">
        <div className="radii-demo">
          {['sm', 'md', 'lg', 'xl', 'full'].map((r) => (
            <div key={r} className="radius-block">
              <div
                className="radius-block__shape"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <span className="mono caption">--radius-{r}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export default App;
