import React, { useEffect, useState } from "react";

/**
 * TaskForm component renders a form to add or edit a task.
 * Accessible labels and keyboard handling included.
 * - Required title
 * - Optional description
 * - Status selector (pending/completed)
 *
 * Props:
 * - initial (object | null): optional initial task data for editing
 * - onCancel (function): called when user cancels edit
 * - onSubmit (function): called with { title, description, status } when submitted
 */
// PUBLIC_INTERFACE
export default function TaskForm({ initial = null, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState(initial?.status ?? "pending");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? "pending");
  }, [initial]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({
      title: title.trim(),
      description: description.trim(),
      status,
    });
    // Do not clear if editing; parent decides UI flow
    if (!initial) {
      setTitle("");
      setDescription("");
      setStatus("pending");
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} data-testid="task-form">
      <div className="form-row">
        <label htmlFor="task-title" className="form-label">
          Title <span aria-hidden="true" className="required">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          className={`input ${errors.title ? "input-error" : ""}`}
          placeholder="e.g., Buy groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          data-testid="title-input"
        />
        {errors.title ? (
          <span id="title-error" role="alert" className="error-text">
            {errors.title}
          </span>
        ) : null}
      </div>

      <div className="form-row">
        <label htmlFor="task-description" className="form-label">
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          className="textarea"
          placeholder="Optional details"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="description-input"
        />
      </div>

      <div className="form-row">
        <label htmlFor="task-status" className="form-label">
          Status
        </label>
        <select
          id="task-status"
          name="status"
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          data-testid="status-select"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          aria-label={initial ? "Save changes" : "Add task"}
          data-testid="submit-task"
        >
          {initial ? "Save" : "Add Task"}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            aria-label="Cancel"
            data-testid="cancel-edit"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
