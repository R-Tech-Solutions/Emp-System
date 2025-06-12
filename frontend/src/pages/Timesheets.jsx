import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import DotSpinner from "../loaders/Loader"; // Import the loader
import { backEndURL } from "../Backendurl";

export default function TimesheetPage() {
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCalculated, setIsCalculated] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          const errorText = await response.text(); // Capture backend error response
          console.error(`Error response from backend: ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        if (i === retries - 1) throw err;
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, shiftsData] = await Promise.all([
          fetchWithRetry(`${backEndURL}/api/tasks`),
          fetchWithRetry(`${backEndURL}/api/shifts`),
        ]);
        setTasks(tasksData);
        setShifts(shiftsData);
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false); // Stop loading after data is fetched
      }
    };

    fetchData();
  }, []);

  const convertTimestampToDate = useCallback((timestamp) => {
    if (!timestamp || typeof timestamp !== "object") return null;
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000 + Math.floor(timestamp._nanoseconds / 1000000));
    }
    return new Date(timestamp);
  }, []);

  const calculateTimeDiff = useCallback((start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate - startDate) / 1000);
  }, []);

  const formatTime = useCallback((seconds) => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const toggleRowExpansion = useCallback((taskId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  }, []);

  useEffect(() => {
    if (tasks.length && shifts.length && !isCalculated) {
      const updateTaskInDatabase = async (taskId, updates) => {
        try {
          await fetchWithRetry(`${backEndURL}/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error("Error updating task in database:", error);
        }
      };

      const updatedTasks = tasks.map((task) => {
        const totalTimeUsed = shifts
          .filter((shift) => shift.taskId === task.taskId)
          .reduce(
            (total, shift) =>
              total + calculateTimeDiff(convertTimestampToDate(shift.startTime), convertTimestampToDate(shift.endTime)),
            0
          );

        const remainingTime = task.totalHours * 3600 - totalTimeUsed;

        let status = "not-started";
        if (totalTimeUsed > 0) status = "started";
        if (remainingTime < 0) status = "overtime";

        updateTaskInDatabase(task.id, { status, remainingTime });

        return { ...task, remainingTime, status };
      });

      setTasks(updatedTasks);
      setIsCalculated(true);
    }
  }, [tasks, shifts, isCalculated, calculateTimeDiff, convertTimestampToDate]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.taskId.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;

      return task.status === statusFilter;
    });
  }, [tasks, searchQuery, statusFilter]);

  const isCurrentDay = useCallback((timestamp) => {
    const date = convertTimestampToDate(timestamp);
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }, [convertTimestampToDate]);

  const employeeWorkHours = useMemo(() => {
    const workHours = {};
    shifts.forEach((shift) => {
      const duration = calculateTimeDiff(
        convertTimestampToDate(shift.startTime),
        convertTimestampToDate(shift.endTime)
      );
      if (duration > 0) {
        workHours[shift.employeeId] = (workHours[shift.employeeId] || 0) + duration;
      }
    });
    return workHours; // Ensure all employees with shifts are included
  }, [shifts, calculateTimeDiff, convertTimestampToDate]);

  useEffect(() => {
    const updateDailyWorkHours = async () => {
      const today = new Date().toISOString().split("T")[0];

      const updatePromises = Object.entries(employeeWorkHours).map(
        async ([employeeId, totalSeconds]) => {
          try {
            await fetchWithRetry(`${backEndURL}/api/employee-work-hours/update`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                employeeId,
                date: today,
                totalHours: totalSeconds,
              }),
            });
           
          } catch (error) {
            console.error(`Error updating daily work hours for ${employeeId}:`, error);
          }
        }
      );

      await Promise.all(updatePromises); // Ensure all updates are processed
    };

    if (Object.keys(employeeWorkHours).length > 0) {
      updateDailyWorkHours();
    }
  }, [employeeWorkHours]);

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(employeeWorkHours).length > 0) {
       
        const today = new Date().toISOString().split("T")[0];

        Object.entries(employeeWorkHours).forEach(async ([employeeId, totalSeconds]) => {
          try {
            await fetchWithRetry(`${backEndURL}/api/employee-work-hours/update`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                employeeId,
                date: today,
                totalHours: totalSeconds,
              }),
            });
         
          } catch (error) {
            console.error(`Error auto-saving work hours for ${employeeId}:`, error);
          }
        });
      }
    }, 60000); // Auto-save every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [employeeWorkHours]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <p className="text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-surface p-4 shadow-md border-b border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-background text-text-primary px-4 py-2 pl-10 rounded-lg w-full md:w-64 border border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            </div>

            {/* Status filter */}
            <select
              className="bg-background text-text-primary px-4 py-2 rounded-lg border border-border"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overtime">Overtime</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto p-4">
        <div className="bg-surface rounded-lg shadow-lg overflow-hidden border border-border">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <DotSpinner />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-text-muted">
              <p className="text-xl">No tasks found</p>
              <p className="mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary-light">
                    <th className="px-4 py-3 text-left text-text-primary"></th>
                    <th className="px-4 py-3 text-left text-text-primary">Project</th>
                    <th className="px-4 py-3 text-left text-text-primary">Progress</th>
                    <th className="px-4 py-3 text-left text-text-primary">Time Used</th>
                    <th className="px-4 py-3 text-left text-text-primary">Remaining</th>
                    <th className="px-4 py-3 text-left text-text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => {
                    const isExpanded = expandedRows[task.taskId]
                    const totalTimeUsed = shifts
                      .filter((shift) => shift.taskId === task.taskId)
                      .reduce((total, shift) => total + calculateTimeDiff(convertTimestampToDate(shift.startTime), convertTimestampToDate(shift.endTime)), 0)
                    const remainingTime = task.totalHours * 3600 - totalTimeUsed
                    const isOvertime = remainingTime < 0

                    return (
                      <React.Fragment key={task.taskId}>
                        {/* Task row */}
                        <tr
                          className="bg-background border-b border-border hover:bg-surface/50 cursor-pointer"
                          onClick={() => toggleRowExpansion(task.taskId)}
                        >
                          <td className="px-4 py-3">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-text-muted" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-text-muted" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-text-primary">{task.name}</div>
                            <div className="text-sm text-text-muted">{task.taskId}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-full bg-surface rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${isOvertime ? "bg-primary" : "bg-secondary"}`}
                                style={{ width: `${Math.min(100, (totalTimeUsed / (task.totalHours * 3600)) * 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {formatTime(totalTimeUsed)} / {formatTime(task.totalHours * 3600)}
                          </td>
                          <td className="px-4 py-3">
                            {isOvertime ? (
                              <span className="text-primary font-medium">-{formatTime(Math.abs(remainingTime))}</span>
                            ) : (
                              <span className="text-secondary">{formatTime(remainingTime)}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                task.status === "completed"
                                  ? "bg-secondary text-text-primary"
                                  : task.status === "overtime"
                                  ? "bg-primary text-white"
                                  : "bg-accent text-text-primary"
                              }`}
                            >
                              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                            </span>
                          </td>
                        </tr>

                        {/* Shift rows */}
                        {isExpanded &&
                          shifts
                            .filter((shift) => shift.taskId === task.taskId)
                            .map((shift) => {
                              const duration = calculateTimeDiff(convertTimestampToDate(shift.startTime), convertTimestampToDate(shift.endTime))
                              const startDate = convertTimestampToDate(shift.startTime)
                              const endDate = convertTimestampToDate(shift.endTime)

                              return (
                                <tr key={shift.id} className="bg-surface/50 border-b border-border hover:bg-surface">
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3 text-text-muted">{shift.employeeId}</td>
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3 text-text-secondary">
                                    {startDate ? `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}` : "Invalid Date"}
                                  </td>
                                  <td className="px-4 py-3 text-text-secondary">
                                    {endDate ? `${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}` : "Invalid Date"}
                                  </td>
                                  <td className="px-4 py-3 text-text-secondary">{formatTime(duration)}</td>
                                  <td className="px-4 py-3 text-text-secondary">{shift.location}</td>
                                </tr>
                              )
                            })}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>     
      </main>
    </div>
  );
}
