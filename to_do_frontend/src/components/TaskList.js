import React from "react";
import TaskItem from "./TaskItem";

/**
 * TaskList renders a UL with TaskItem components.
 *
 * Props:
 * - tasks (array)
 * - loading (boolean)
 * - error (Error | null)
 * - onRetry (function): to retry fetch on error
 * - onUpdate (function): (id, updates)
 * - onDelete (function): (id)
 */
// PUBLIC_INTERFACE
export default function TaskList({
  tasks,
  loading,
  error,
  onRetry,
  onUpdate,
  onDelete,
}) {
  if (loading) {
    return <div className="info muted" data-testid="loading">Loading tasks…</div>;
  }
  if (error) {
    return (
      <div className="info error" role="alert" data-testid="error">
        <div>Failed to load tasks.</div>
        <pre className="error-details" aria-hidden="true">
          {String(error?.message || "Unknown error")}
        </pre>
        {onRetry ? (
          <button className="btn btn-primary" onClick={onRetry} data-testid="retry">
            Retry
          </button>
        ) : null}
      </div>
    );
  }
  if (!tasks || tasks.length === 0) {
    return (
      <div className="info" data-testid="empty">
        No tasks yet. Add your first task above!
      </div>
    );
  }

  return (
    <ul className="task-list" data-testid="task-list">
      {tasks.map((t) => (
        <TaskItem
          key={t.id}
          task={t}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
