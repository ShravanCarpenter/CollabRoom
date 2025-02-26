// TaskManagement.js
import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, Circle, Clock, PlusCircle, Trash2 } from 'lucide-react';
import axios from 'axios'; // For API calls
import './TaskManagement.css';

const TaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDate, setNewTaskDate] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [showAddTask, setShowAddTask] = useState(false);
    const [hoverStates, setHoverStates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API URL for tasks
    const API_URL = 'http://localhost:3000/api/tasks';

    useEffect(() => {
        fetchTasks();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Check if date is today
    const isToday = (dateString) => {
        const today = new Date();
        const taskDate = new Date(dateString);
        return today.toDateString() === taskDate.toDateString();
    };

    // Check if date is past due
    const isPastDue = (dateString) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(dateString);
        return taskDate < today;
    };

    // Fetch all tasks from the database
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setTasks(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tasks: ' + err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    // Add new task
    const addTask = async () => {
        if (newTaskTitle.trim() === '' || newTaskDate === '') return;

        const newTask = {
            title: newTaskTitle,
            due: newTaskDate,
            completed: false
        };

        try {
            const response = await axios.post(API_URL, newTask);
            setTasks([...tasks, response.data]);
            setNewTaskTitle('');
            setNewTaskDate('');
            setShowAddTask(false);
        } catch (err) {
            setError('Failed to add task: ' + err.message);
            console.error('Error adding task:', err);
        }
    };

    // Toggle task completion
    const toggleTaskCompletion = async (id) => {
        try {
            const taskToUpdate = tasks.find(task => task._id === id);
            const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

            await axios.put(`${API_URL}/${id}`, updatedTask);

            setTasks(tasks.map(task =>
                task._id === id ? { ...task, completed: !task.completed } : task
            ));
        } catch (err) {
            setError('Failed to update task: ' + err.message);
            console.error('Error updating task:', err);
        }
    };

    // Delete task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
            setError('Failed to delete task: ' + err.message);
            console.error('Error deleting task:', err);
        }
    };

    // Get current date for display
    const getCurrentDate = () => {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString(undefined, options);
    };

    // Handle hover states
    const handleMouseEnter = (id) => {
        setHoverStates(prev => ({ ...prev, [id]: true }));
    };

    const handleMouseLeave = (id) => {
        setHoverStates(prev => ({ ...prev, [id]: false }));
    };

    // Get pending tasks
    const pendingTasks = tasks.filter(task => !task.completed);

    // Get completed tasks
    const completedTasks = tasks.filter(task => task.completed);

    // Get date style based on due date
    const getDateStyle = (dueDate) => {
        if (isToday(dueDate)) return 'dateToday';
        if (isPastDue(dueDate)) return 'dateOverdue';
        return 'dateNormal';
    };

    if (loading) {
        return (
            <div className="task-container">
                <div className="task-header">
                    <h2 className="task-headerTitle">Tasks</h2>
                    <CalendarDays size={24} />
                </div>
                <div className="task-loadingState">Loading tasks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="task-container">
                <div className="task-header">
                    <h2 className="task-headerTitle">Tasks</h2>
                    <CalendarDays size={24} />
                </div>
                <div className="task-errorState">{error}</div>
            </div>
        );
    }

    return (
        <div className="task-container">
            <div className="task-header">
                <div>
                    <h2 className="headerTitle">Tasks</h2>
                    <p className="headerDate">{getCurrentDate()}</p>
                </div>
                <CalendarDays size={24} />
            </div>

            <div className="task-tabBar">
                <button
                    className={`task-tab ${activeTab === 'pending' ? 'activeTab' : 'inactiveTab'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending ({pendingTasks.length})
                </button>
                <button
                    className={`task-tab ${activeTab === 'completed' ? 'activeTab' : 'inactiveTab'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed ({completedTasks.length})
                </button>
            </div>

            <div className="task-list">
                {activeTab === 'pending' ? (
                    <>
                        {pendingTasks.length === 0 ? (
                            <p className="emptyMessage">No pending tasks</p>
                        ) : (
                            pendingTasks.map(task => (
                                <div
                                    key={task._id}
                                    className={`task-item ${hoverStates[task._id] ? 'task-itemHover' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(task._id)}
                                    onMouseLeave={() => handleMouseLeave(task._id)}
                                >
                                    <div className="task-content">
                                        <div className="task-checkbox" onClick={() => toggleTaskCompletion(task._id)}>
                                            <Circle size={20} color="#9ca3af" />
                                        </div>
                                        <div className="task-info">
                                            <p className="task-title">{task.title}</p>
                                            <div className="task-date">
                                                <Clock size={12} color="#9ca3af" style={{ marginRight: '4px' }} />
                                                <span className={getDateStyle(task.due)}>
                                                    {isToday(task.due) ? 'Today' : isPastDue(task.due) ? 'Overdue' : formatDate(task.due)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`task-deleteButton ${hoverStates[task._id] ? 'task-deleteButtonHover' : ''}`}
                                        onClick={() => deleteTask(task._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <>
                        {completedTasks.length === 0 ? (
                            <p className="emptyMessage">No completed tasks</p>
                        ) : (
                            completedTasks.map(task => (
                                <div
                                    key={task._id}
                                    className={`task-item ${hoverStates[task._id] ? 'task-itemHover' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(task._id)}
                                    onMouseLeave={() => handleMouseLeave(task._id)}
                                >
                                    <div className="task-content">
                                        <div className="task-checkbox" onClick={() => toggleTaskCompletion(task._id)}>
                                            <CheckCircle size={20} color="#22c55e" />
                                        </div>
                                        <div className="task-info">
                                            <p className={`task-title ${task.completed ? 'completedTaskTitle' : ''}`}>{task.title}</p>
                                            <div className="task-date">
                                                <Clock size={12} color="#9ca3af" style={{ marginRight: '4px' }} />
                                                <span className={getDateStyle(task.due)}>
                                                    {formatDate(task.due)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className={`task-deleteButton ${hoverStates[task._id] ? 'task-deleteButtonHover' : ''}`}
                                        onClick={() => deleteTask(task._id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>

            {showAddTask ? (
                <div className="addForm">
                    <input
                        type="text"
                        className="task-input"
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <div className="task-formActions">
                        <input
                            type="date"
                            className="task-dateInput"
                            value={newTaskDate}
                            onChange={(e) => setNewTaskDate(e.target.value)}
                        />
                        <button
                            className="task-submitButton"
                            onClick={addTask}
                        >
                            Add
                        </button>
                    </div>
                </div>
            ) : (
                <div className="task-footer">
                    <button
                        className="task-addButton"
                        onClick={() => setShowAddTask(true)}
                    >
                        <PlusCircle size={16} style={{ marginRight: '8px' }} />
                        Add New Task
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskManagement;