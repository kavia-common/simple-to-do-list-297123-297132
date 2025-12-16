/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { tasksApi } from "../api/client";

/**
// PUBLIC_INTERFACE
export function useTasks(initialLoad = true) {
  /**
   * React hook to manage tasks from backend with loading/error states
   * and optimistic updates (create/update/delete) with rollback on failure.
   *
   * Returns:
   * - tasks: Array of task objects
   * - loading: boolean
   * - error: Error | null
   * - listTasks: () => Promise<void>
   * - createTask: (data) => Promise<task | null>
   * - updateTask: (id, updates) => Promise<task | null>
   * - deleteTask: (id) => Promise<boolean>
   * - resetError: () => void
   */
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialLoad));
  const [error, setError] = useState(null);

  // Track in-flight operations to avoid race conditions
  const inFlight = useRef(new Set());

  const resetError = useCallback(() => setError(null), []);

  const listTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list();
      // Ensure array fallback
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    if (initialLoad) {
      listTasks();
    }
  }, [initialLoad]);

  // Optimistic create
  const createTask = useCallback(async (payload) => {
    // Create a temp id for optimistic insert
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimisticTask = {
      id: tempId,
      title: payload?.title ?? "",
      description: payload?.description ?? "",
      status: payload?.status ?? "pending",
      ...payload,
      _optimistic: true,
    };

    // Apply optimistic update
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      const created = await tasksApi.create(payload);
      // Replace optimistic with actual record
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { ...created, _optimistic: false } : t))
      );
      return created ?? null;
    } catch (e) {
      // Rollback on failure
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      setError(e);
      return null;
    }
  }, []);

  // Optimistic update
  const updateTask = useCallback(async (id, updates) => {
    if (!id) return null;
    if (inFlight.current.has(`update-${id}`)) return null;
    inFlight.current.add(`update-${id}`);

    // Snapshot for rollback
    let prevTask = null;
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          prevTask = t;
          return { ...t, ...updates, _optimistic: true };
        }
        return t;
      });
      return next;
    });

    try {
      const updated = await tasksApi.update(id, updates);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...updated, _optimistic: false } : t
        )
      );
      return updated ?? null;
    } catch (e) {
      // Rollback snapshot
      if (prevTask) {
        setTasks((prev) => prev.map((t) => (t.id === id ? prevTask : t)));
      }
      setError(e);
      return null;
    } finally {
      inFlight.current.delete(`update-${id}`);
    }
  }, []);

  // Optimistic delete
  const deleteTask = useCallback(async (id) => {
    if (!id) return false;
    if (inFlight.current.has(`delete-${id}`)) return false;
    inFlight.current.add(`delete-${id}`);

    // Snapshot for rollback
    let removedTask = null;
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx >= 0) {
        removedTask = prev[idx];
      }
      return prev.filter((t) => t.id !== id);
    });

    try {
      await tasksApi.remove(id);
      return true;
    } catch (e) {
      // Rollback on failure
      if (removedTask) {
        setTasks((prev) => [removedTask, ...prev]);
      }
      setError(e);
      return false;
    } finally {
      inFlight.current.delete(`delete-${id}`);
    }
  }, []);

  const state = useMemo(
    () => ({
      tasks,
      loading,
      error,
      listTasks,
      createTask,
      updateTask,
      deleteTask,
      resetError,
    }),
    [tasks, loading, error, listTasks, createTask, updateTask, deleteTask, resetError]
  );

  return state;
}
