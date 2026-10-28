"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Search,
  Trash2,
  Link2,
  X,
} from "lucide-react";
import {
  TimelineTask,
  TimelinePhase,
  TaskStatus,
  PriorityLevel,
} from "@/types/event";
import {
  PHASE_LABELS,
  calculateTimelineProgress,
  isTaskOverdue,
} from "@/lib/calculations/timeline";

interface TimelineSectionProps {
  tasks: TimelineTask[];
  eventDate: string;
  onUpdateTasks: (updated: TimelineTask[]) => void;
}

/**
 * Interactive Timeline & Milestones Component
 *
 * Renders planning phase milestones, countdown progress bars, overdue alerts,
 * interactive task status toggles (todo -> in progress -> completed), and custom task creation.
 *
 * @param props - TimelineSectionProps containing tasks list, celebration event date, and update handler.
 * @returns React.JSX.Element
 */
export function TimelineSection({
  tasks,
  eventDate,
  onUpdateTasks,
}: TimelineSectionProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);

  // Client-side live date detection (preserves SSR stability with zero hydration error)
  const [todayStr, setTodayStr] = useState<string>("2027-01-01");
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setTodayStr(`${y}-${m}-${d}`);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // New Task Modal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPhase, setNewPhase] = useState<TimelinePhase>("1_to_2_months");
  const [newTargetDate, setNewTargetDate] = useState(eventDate);
  const [newPriority, setNewPriority] = useState<PriorityLevel>("medium");
  const [newCategory, setNewCategory] = useState("Operations");

  const progress = calculateTimelineProgress(tasks, todayStr);

  // Toggle task status: todo -> in_progress -> completed -> todo
  const handleCycleStatus = (id: string) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        let nextStatus: TaskStatus = "todo";
        if (t.status === "todo") nextStatus = "in_progress";
        else if (t.status === "in_progress") nextStatus = "completed";
        else nextStatus = "todo";

        return {
          ...t,
          status: nextStatus,
          isOverdue: isTaskOverdue(t.targetDate, nextStatus, todayStr),
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
  };

  // Add custom task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `custom-task-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      phase: newPhase,
      phaseLabel: PHASE_LABELS[newPhase],
      targetDate: newTargetDate,
      priority: newPriority,
      dependencies: [],
      status: "todo",
      isOverdue: isTaskOverdue(newTargetDate, "todo"),
      category: newCategory,
      assignee: "Organizer",
    };

    onUpdateTasks([...tasks, newTask]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = phaseFilter === "all" || task.phase === phaseFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    return matchesSearch && matchesPhase && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Milestone Overview */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              <span>Event Countdown & Task Completion</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Celebration Date: <strong className="text-slate-200">{eventDate}</strong>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="rounded-lg bg-indigo-950/80 border border-indigo-800/60 px-3 py-1 text-indigo-300 font-semibold">
              {progress.completedTasks} / {progress.totalTasks} Done ({progress.completionPercentage}%)
            </span>
            {progress.overdueTasks > 0 && (
              <span className="rounded-lg bg-rose-950/80 border border-rose-800/60 px-3 py-1 text-rose-300 font-semibold flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>{progress.overdueTasks} Overdue</span>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute inset-y-0 left-0 pl-3 my-auto h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search milestone tasks..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Phase Filter */}
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-violet-500"
          >
            <option value="all">All Phases</option>
            {Object.entries(PHASE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-violet-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-300 focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 transition shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
            No planning tasks match the selected search or filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            const isInProgress = task.status === "in_progress";
            const overdue = isTaskOverdue(task.targetDate, task.status, todayStr);

            return (
              <div
                key={task.id}
                className={`rounded-xl border p-4 transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? "border-emerald-950/50 bg-emerald-950/15 text-slate-300"
                    : overdue
                    ? "border-rose-900/60 bg-rose-950/20"
                    : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                }`}
              >
                {/* Left: Status Toggle & Info */}
                <div className="flex items-start space-x-3 flex-1">
                  {/* Status Clickable Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleCycleStatus(task.id)}
                    title={`Current status: ${task.status}. Click to change.`}
                    aria-label={`Mark status for ${task.title}`}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                      isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-slate-950 font-bold"
                        : isInProgress
                        ? "border-amber-500 bg-amber-500/20 text-amber-300"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : isInProgress ? (
                      <Clock className="h-3 w-3" />
                    ) : (
                      <span className="text-[9px]">○</span>
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h4
                        className={`text-sm font-semibold ${
                          isCompleted ? "line-through text-slate-400" : "text-white"
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Phase Badge */}
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700/60">
                        {task.phaseLabel}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          task.priority === "high"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-900/60"
                            : task.priority === "medium"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-900/60"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Overdue Badge */}
                      {overdue && (
                        <span className="rounded bg-rose-900/80 text-rose-200 text-[10px] px-1.5 py-0.5 font-bold flex items-center space-x-0.5">
                          <AlertCircle className="h-2.5 w-2.5" />
                          <span>Overdue</span>
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Task Dependencies Display */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center space-x-1 font-semibold text-slate-500">
                          <Link2 className="h-3 w-3 text-indigo-400" />
                          <span>Prerequisites:</span>
                        </span>
                        {task.dependencies.map((dep, dIdx) => (
                          <span
                            key={dIdx}
                            className="rounded bg-slate-800/80 px-1.5 py-0.5 border border-slate-700/60 text-slate-300 text-[10px]"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Date & Status Action */}
                <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Target Date</span>
                    <span className="font-semibold text-slate-200">{task.targetDate}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCycleStatus(task.id)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold border transition ${
                      isCompleted
                        ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-300"
                        : isInProgress
                        ? "bg-amber-950/70 border-amber-500/60 text-amber-300"
                        : "bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {isCompleted
                      ? "Completed ✓"
                      : isInProgress
                      ? "In Progress..."
                      : "Mark Started"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    title={`Delete task ${task.title}`}
                    aria-label={`Delete task ${task.title}`}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeline-add-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-left relative">
            <div className="flex items-center justify-between mb-1">
              <h3 id="timeline-add-title" className="text-base font-bold text-white">
                Add Timeline Task
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
                aria-label="Close add timeline task dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Schedule an essential preparation task or deadline.
            </p>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label htmlFor="timeline-new-title" className="block font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  id="timeline-new-title"
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Schedule rehearsal dinner walkthrough"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="timeline-new-phase" className="block font-semibold text-slate-300 mb-1">
                  Phase
                </label>
                <select
                  id="timeline-new-phase"
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value as TimelinePhase)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                >
                  {Object.entries(PHASE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="timeline-new-target-date" className="block font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    id="timeline-new-target-date"
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  />
                </div>

                <div>
                  <label htmlFor="timeline-new-priority" className="block font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="timeline-new-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="timeline-new-category" className="block font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <input
                  id="timeline-new-category"
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Operations, Venue, Catering..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div>
                <label htmlFor="timeline-new-description" className="block font-semibold text-slate-300 mb-1">
                  Description / Notes
                </label>
                <input
                  id="timeline-new-description"
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Who is responsible, prerequisites, or contact info..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-4 py-1.5 font-bold text-white hover:bg-violet-500 shadow-md"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
