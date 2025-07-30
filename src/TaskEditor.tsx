import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";

interface Task {
  id: string;
  text: string;
  isLink: boolean;
  url?: string;
  isTodo?: boolean;
  isCompleted?: boolean;
}

interface TaskEditorProps {
  date: string;
  initialTasks: Task[];
}

export function TaskEditor({ date, initialTasks }: TaskEditorProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskText, setNewTaskText] = useState("");
  const [isTodoMode, setIsTodoMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const saveEntry = useMutation(api.journal.saveEntry);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;

    const isLink = isValidUrl(newTaskText.trim());
    const newTask: Task = {
      id: generateId(),
      text: newTaskText.trim(),
      isLink,
      url: isLink ? newTaskText.trim() : undefined,
      isTodo: isTodoMode,
      isCompleted: isTodoMode ? false : undefined,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    setNewTaskText("");
    setShowAddForm(false); // Hide form after adding task

    try {
      await saveEntry({ date, tasks: updatedTasks });
      toast.success("Task added successfully!");
    } catch (error) {
      toast.error("Failed to save task");
      setTasks(tasks); // Revert on error
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      // Reset form when opening
      setNewTaskText("");
      setIsTodoMode(false);
    }
  };

  const updateTask = async (taskId: string, newText: string) => {
    const isLink = isValidUrl(newText.trim());
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            text: newText.trim(),
            isLink,
            url: isLink ? newText.trim() : undefined,
          }
        : task
    );

    setTasks(updatedTasks);

    try {
      await saveEntry({ date, tasks: updatedTasks });
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);

    try {
      await saveEntry({ date, tasks: updatedTasks });
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
      setTasks(tasks); // Revert on error
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, isCompleted: !task.isCompleted }
        : task
    );

    setTasks(updatedTasks);

    try {
      await saveEntry({ date, tasks: updatedTasks });
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Tasks for {formatDate(date)}
        </h2>
        <button
          onClick={toggleAddForm}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
        >
          + Add task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 && !showAddForm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No tasks scheduled</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Task" to create your first task for this date</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                {task.isTodo === true ? (
                  <input
                    type="checkbox"
                    checked={task.isCompleted || false}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-500 mt-1 min-w-[20px]">
                    {index + 1}.
                  </span>
                )}
                <div className={`flex-1 min-w-0 ${task.isTodo === true && task.isCompleted ? 'opacity-60' : ''}`}>
                  {task.isLink ? (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-600 hover:text-blue-800 underline break-all ${
                        task.isTodo === true && task.isCompleted ? 'line-through' : ''
                      }`}
                    >
                      {task.text}
                    </a>
                  ) : (
                    <TaskInput
                      value={task.text}
                      onChange={(newText) => updateTask(task.id, newText)}
                      isCompleted={task.isTodo === true && task.isCompleted}
                    />
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all p-1 rounded"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {showAddForm && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTodoMode}
                  onChange={(e) => setIsTodoMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Add as To-Do</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTodoMode ? "Add a to-do item..." : "Add a task or paste a link..."}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={addTask}
                disabled={!newTaskText.trim()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskInput({ value, onChange, isCompleted }: { value: string; onChange: (value: string) => void; isCompleted?: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded block ${
        isCompleted ? 'line-through' : ''
      }`}
    >
      {value}
    </span>
  );
}
