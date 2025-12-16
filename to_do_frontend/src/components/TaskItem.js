import React, { useState } from "react";
import TaskForm from "./TaskForm";

/**
 * TaskItem renders an individual task with actions:
 * - Toggle status (pending/completed)
 * - Edit inline
 * - Delete with confirmation
 *
 * Props:
 * - task (object): { id, title, description, status, _optimistic? }
 * - onUpdate (function): (id, updates) => Promise<void>
 * - onDelete (function): (id) => Promise<void>
 */
// PUBLIC_INTERFACE
export default function TaskItem({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleStatus = async () => {
    if (busy) return;
    setBusy(true);
    await onUpdate(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
    });
    setBusy(false);
  };

  const handleEditSubmit = async (updates) => {
    if (busy) return;
    setBusy(true);
    await onUpdate(task.id, updates);
    setBusy(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    setConfirming(false);
    await onDelete(task.id);
    setBusy(false);
  };

  if (isEditing) {
    return (
      <li className="task-item editing" data-testid={`task-${task.id}`}>
        <TaskForm
          initial={task}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={`task-item ${task.status} ${
        task._optimistic ? "optimistic" : ""
      }`}
      data-testid={`task-${task.id}`}
    >
      <div className="task-main">
        <input
          type="checkbox"
          checked={task.status === "completed"}
          onChange={toggleStatus}
          aria-label={`Mark "${task.title}" as ${
            task.status === "completed" ? "pending" : "completed"
          }`}
          disabled={busy}
          data-testid={`toggle-${task.id}`}
        />
        <div className="task-texts">
          <div className="task-title" aria-live="polite">
            {task.title}
          </div>
          {task.description ? (
            <div className="task-description">{task.description}</div>
          ) : null}
          <span className={`status-badge ${task.status}`}>
            {task.status === "completed" ? "Completed" : "Pending"}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {!confirming ? (
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditing(true)}
              disabled={busy}
              aria-label={`Edit "${task.title}"`}
              data-testid={`edit-${task.id}`}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => setConfirming(true)}
              disabled={busy}
              aria-label={`Delete "${task.title}"`}
              data-testid={`ask-delete-${task.id}`}
            >
              Delete
            </button>
          </>
        ) : (
          <div className="confirm-delete" role="dialog" aria-label="Confirm delete">
            <span className="confirm-text">Delete this task?</span>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={busy}
              data-testid={`confirm-delete-${task.id}`}
            >
              Confirm
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setConfirming(false)}
              disabled={busy}
              data-testid={`cancel-delete-${task.id}`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
