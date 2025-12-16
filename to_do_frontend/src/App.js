import React, { useEffect, useState } from "react";
import "./App.css";
import { useTasks } from "./hooks/useTasks";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";

/**
 * App: Single-page layout with a header, a task entry form, and a task list.
 * Integrates with the useTasks hook to load and mutate tasks via backend APIs.
 */
// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("light");

  const {
    tasks,
    loading,
    error,
    listTasks,
    createTask,
    updateTask,
    deleteTask,
    resetError,
  } = useTasks(true);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const handleCreate = async (data) => {
    await createTask(data);
  };

  const handleUpdate = async (id, updates) => {
    await updateTask(id, updates);
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
  };

  useEffect(() => {
    if (error) {
      // Auto clear after a short delay to reduce persistent error banners
      const t = setTimeout(() => resetError(), 4000);
      return () => clearTimeout(t);
    }
  }, [error, resetError]);

  return (
    <div className="App">
      <header className="topbar">
        <div className="container">
          <h1 className="brand">Simple To‑Do</h1>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      <main className="container content">
        <section className="panel">
          <h2 className="panel-title">Add a new task</h2>
          <TaskForm onSubmit={handleCreate} />
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Your tasks</h2>
            <div className="panel-actions">
              <button
                className="btn btn-ghost"
                onClick={listTasks}
                aria-label="Refresh tasks"
                data-testid="refresh"
              >
                Refresh
              </button>
            </div>
          </div>
          <TaskList
            tasks={tasks}
            loading={loading}
            error={error}
            onRetry={listTasks}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <span aria-label="Theme information">Built with React</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
