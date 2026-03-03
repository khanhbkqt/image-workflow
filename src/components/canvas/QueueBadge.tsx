import { useGenerationQueueStore } from '../../stores/generationQueueStore';
import './QueueBadge.css';

export function QueueBadge() {
    const jobs = useGenerationQueueStore((s) => s.jobs);
    const clearCompleted = useGenerationQueueStore((s) => s.clearCompleted);

    const running = jobs.filter((j) => j.status === 'running').length;
    const pending = jobs.filter((j) => j.status === 'pending').length;
    const done = jobs.filter((j) => j.status === 'done' || j.status === 'error').length;
    const total = running + pending;

    if (jobs.length === 0) return null;

    return (
        <div className={`queue-badge ${total > 0 ? 'queue-badge--active' : ''}`}>
            <div className="queue-badge__summary">
                {total > 0 ? (
                    <>
                        <span className="queue-badge__spinner" />
                        <span className="queue-badge__label">
                            {running > 0 ? `Generating ${running}` : ''}
                            {running > 0 && pending > 0 ? ', ' : ''}
                            {pending > 0 ? `${pending} waiting` : ''}
                        </span>
                    </>
                ) : (
                    <span className="queue-badge__label queue-badge__label--done">
                        ✓ {done} done
                    </span>
                )}
            </div>
            {done > 0 && (
                <button
                    className="queue-badge__clear nodrag"
                    onClick={clearCompleted}
                    title="Clear completed jobs"
                    type="button"
                >
                    ✕ Clear
                </button>
            )}
        </div>
    );
}
