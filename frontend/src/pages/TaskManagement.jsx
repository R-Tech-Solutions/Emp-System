import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTasks, addTask, editTask, updateTaskStatus, deleteTask } from "../redux/taskSlice";
import DotSpinner from "../loaders/Loader";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { backEndURL } from "../Backendurl";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [filteredByPositionEmployees, setFilteredByPositionEmployees] = useState([]);

  const availableTags = [
    { id: 1, name: "Urgent", color: "bg-red-500" },
    { id: 2, name: "Low Priority", color: "bg-blue-500" },
    { id: 3, name: "Feature", color: "bg-green-500" },
    { id: 4, name: "Bug Fix", color: "bg-yellow-500" },
    { id: 5, name: "Documentation", color: "bg-purple-500" },
  ];

  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    dueDate: "",
    totalHours: "",
    attachments: [],
    assignedTo: "",
    department: "",
    status: "not-started",
    tags: [],
    supervisor: "",
    email: "",
    supervisorEmail: "",
  });
  const [attachmentInput, setAttachmentInput] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [showEmployeeSelector, setShowEmployeeSelector] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredEmployees = newTask.department
    ? employees.filter((emp) => emp.department === newTask.department)
    : employees;

  const searchedEmployees = employeeSearch
    ? employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || emp.id.toString().includes(employeeSearch)
    )
    : employees;

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  // Handle tag toggle
  const handleTagToggle = (tagName) => {
    setNewTask((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((tag) => tag !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  // Handle supervisor selection
  const handleSupervisorChange = async (e) => {
    const selectedSupervisorId = e.target.value;
    setNewTask({
      ...newTask,
      supervisor: selectedSupervisorId,
    });

    // Fetch the supervisor's email
    try {
      const response = await axios.get(`${backEndURL}/api/employees/${selectedSupervisorId}`);
      const supervisorData = response.data.data;
      if (supervisorData) {
        setNewTask((prev) => ({
          ...prev,
          supervisorEmail: supervisorData.email, // Update supervisor email
        }));
      }
    } catch (error) {
      console.error("Error fetching supervisor email:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch supervisor email.",
        icon: "error",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#805ad5",
      });
    }
  };

  // Handle employee assignment (single selection)
  const handleEmployeeSelect = async (employeeId) => {
    try {
      const response = await axios.get(`${backEndURL}/api/employees/${employeeId}`);
      const selectedEmployee = response.data.data;
      if (selectedEmployee) {
        setNewTask((prev) => ({
          ...prev,
          assignedTo: employeeId, // Store only the employee ID
          email: selectedEmployee.email, // Update email
        }));
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch employee details.",
        icon: "error",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#805ad5",
      });
    }
  };


  // Handle attachment addition
  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setNewTask((prev) => ({
        ...prev,
        attachments: [...prev.attachments, attachmentInput.trim()], // Add to array
      }));
      setAttachmentInput("");
    }
  };

  // Handle attachment removal
  const handleRemoveAttachment = (index) => {
    setNewTask((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index), // Remove from array
    }));
  };

  // Convert attachments to strings before sending to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submissions
    if (newTask.name && newTask.dueDate && newTask.department) {
      setIsSubmitting(true); // Disable the button during submission
      const taskData = {
        ...newTask,
        attachments: newTask.attachments || [], // Ensure attachments are included
      };

      try {
        if (isEditMode && editingTaskId) {
          await axios.put(`${backEndURL}/api/tasks/${editingTaskId}`, taskData);
          dispatch(editTask({ id: editingTaskId, taskData })); // Dispatch editTask action
          toast.success("Task updated successfully!", { theme: "dark" }); // Toast for editing
          setIsEditMode(false);
          setEditingTaskId(null);
        } else {
          const response = await axios.post(`${backEndURL}/api/tasks`, taskData);
          dispatch(addTask(response.data)); // Dispatch addTask action
          toast.success("Task added successfully!", { theme: "dark" }); // Toast for adding
        }
        setNewTask({
          name: "",
          description: "",
          dueDate: "",
          totalHours: "",
          attachments: [],
          assignedTo: "",
          department: "",
          status: "not-started",
          tags: [],
          supervisor: "",
          email: "",
          supervisorEmail: "", 
        });
        setShowTaskForm(false);

        // Refresh the page
        window.location.reload();
      } catch (error) {
        console.error("Error submitting task:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to submit task. Please try again.",
          icon: "error",
          background: "#1a202c",
          color: "#fff",
          confirmButtonColor: "#805ad5",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Fetch tasks using Redux
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${backEndURL}/api/tasks/${taskId}`);
      dispatch(deleteTask(taskId)); 
      toast.success("Task deleted successfully!", { theme: "dark" }); 
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task. Please try again.", { theme: "dark" }); 
    }
  };

  const handleMarkAsDone = async (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    if (task.status === "overtime" || task.status === "completed") {
      Swal.fire({
        title: "Action Not Allowed",
        text: "Task status cannot be changed once marked as completed or overtime.",
        icon: "warning",
        background: "#1a202c", 
        color: "#fff", 
        confirmButtonColor: "#805ad5",
      });
      return;
    }
    try {
      await axios.patch(`${backEndURL}/api/tasks/${taskId}`, { status: "completed" });
      dispatch(updateTaskStatus({ id: taskId, status: "completed" })); // Dispatch Redux action to update task status
      Swal.fire({
        title: "Success",
        text: "Task marked as completed.",
        icon: "success",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#805ad5",
      });
    } catch (error) {
      console.error("Error marking task as done:", error);
    }
  };

  const handleMarkAsOvertime = async (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    if (task.status === "completed" || task.status === "overtime") {
      Swal.fire({
        title: "Action Not Allowed",
        text: "Task status cannot be changed once marked as completed or overtime.",
        icon: "warning",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#805ad5",
      });
      return;
    }
    try {
      await axios.patch(`${backEndURL}/api/tasks/${taskId}`, { status: "overtime" });
      dispatch(updateTaskStatus({ id: taskId, status: "overtime" })); // Dispatch Redux action to update task status
      Swal.fire({
        title: "Success",
        text: "Task marked as overtime.",
        icon: "success",
        background: "#1a202c",
        color: "#fff",
        confirmButtonColor: "#805ad5",
      });
    } catch (error) {
      console.error("Error marking task as overtime:", error);
    }
  };

  // Add new task button handler
  const handleAddNewTask = () => {
    // Reset form if in edit mode
    if (isEditMode) {
      setIsEditMode(false);
      setEditingTaskId(null);
      setNewTask({
        name: "",
        description: "",
        dueDate: "",
        totalHours: "",
        attachments: [],
        assignedTo: "",
        department: "",
        status: "not-started",
        tags: [],
        supervisor: "", // Reset supervisor field
        email: "", // Reset email field
        supervisorEmail: "", // Reset supervisorEmail
      });
    }

    // Toggle form visibility
    setShowTaskForm(!showTaskForm);

    // Scroll to form if showing
    if (!showTaskForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Edit task
  const handleEditTask = async (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    if (taskToEdit) {
      setNewTask({ ...taskToEdit });
      setIsEditMode(true);
      setEditingTaskId(taskId);
      setShowTaskForm(true);

      // Fetch and set the selected position
      const position = positions.find((pos) => pos.title === taskToEdit.supervisor);
      if (position) {
        setSelectedPosition(position.title);

        // Fetch employees for the selected position
        const filteredEmployees = employees.filter((emp) => emp.position === position.title);
        setFilteredByPositionEmployees(filteredEmployees);
      }
    }
  };

  const handleDownloadAttachment = (filename) => {
    const element = document.createElement("a");
    const file = new Blob([`This is a dummy content for ${filename}`], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Get status color and label
  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-500", label: "Completed" };
      case "in-progress":
        return { color: "bg-blue-500", label: "In Progress" };
      case "not-started":
        return { color: "bg-gray-500", label: "Not Started" };
      case "overtime":
        return { color: "bg-red-500", label: "Overtime" };
      default:
        return { color: "bg-gray-500", label: "Unknown" };
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/departments`);
        setDepartments(response.data.map((department) => department.name));
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        const employeesArray = Array.isArray(response.data) ? response.data : response.data.data;
        setEmployees(
          employeesArray.map((employee) => ({
            id: employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            avatar: employee.profileImage
              ? `${employee.profileImage}` // Use resized image
              : "/placeholder.svg",
            department: employee.department,
            position: employee.position, // Include position
          }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    const fetchPositions = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/positions`);
        setPositions(response.data.map((position) => ({ id: position.id, title: position.title })));
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };

    fetchDepartments();
    fetchEmployees();
    fetchPositions();
  }, []);

  useEffect(() => {
    // Filter employees based on selected position
    if (selectedPosition) {
      setFilteredByPositionEmployees(
        employees.filter((emp) => emp.position === selectedPosition)
      );
    } else {
      setFilteredByPositionEmployees([]);
    }
  }, [selectedPosition, employees]);

  return (
    <div className="min-h-screen bg-background text-text-primary p-6">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <DotSpinner />
            <span className="ml-3 text-text-secondary">Loading tasks...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Task Management</h1>
              <button
                onClick={handleAddNewTask}
                className="bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-transform transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {showTaskForm ? "Hide Form" : "Add New Task"}
              </button>
            </div>

            {showTaskForm && (
              <div
                ref={formRef}
                className="bg-surface rounded-lg p-6 mb-8 shadow-lg transition-all duration-300 ease-in-out border border-border"
              >
                <h2 className="text-xl font-semibold mb-4">{isEditMode ? "Edit Task" : "Add New Task"}</h2>
                <form onSubmit={handleSubmit}>
                  {loading && <DotSpinner />}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-text-secondary">Task Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newTask.name}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded p-2 text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-text-secondary">Due Date</label>
                      <input
                        type="date"
                        name="dueDate"
                        value={newTask.dueDate}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded p-2 text-text-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-text-secondary">Total Hours</label>
                      <input
                        type="number"
                        name="totalHours"
                        value={newTask.totalHours}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded p-2 text-text-primary"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-text-secondary">Department</label>
                      <select
                        name="department"
                        value={newTask.department}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded p-2 text-text-primary"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-text-secondary">Assign to Employee</label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredEmployees.map((employee) => (
                          <div
                            key={employee.id}
                            className={`flex items-center p-2 rounded cursor-pointer border border-border ${
                              newTask.assignedTo === employee.id ? "bg-primary-light" : "bg-background"
                            }`}
                            onClick={() => handleEmployeeSelect(employee.id)}
                          >
                            <img
                              src={employee.avatar || "/placeholder.svg"}
                              alt={employee.name}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                              <span className="text-text-primary">{employee.name}</span>
                              <span className="block text-xs text-text-muted">{employee.department}</span>
                            </div>
                            <div className="ml-auto">
                              <div
                                className={`w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center ${
                                  newTask.assignedTo === employee.id ? "bg-primary" : "bg-transparent"
                                }`}
                              >
                                {newTask.assignedTo === employee.id && <span className="text-xs text-white">✓</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <br />
                      <div>
                        <label className="block mb-2">Email</label>
                        <input
                          type="email"
                          value={newTask.email || "example@example.com"} // Replace with the appropriate email value
                          readOnly
                          className="w-full bg-gray-700 rounded p-2 text-white cursor-not-allowed"
                        />
                      </div>

                    </div>


                    <div>
                      <label className="block mb-2">Supervisor By</label>
                      <select
                        name="position"
                        value={selectedPosition}
                        onChange={(e) => setSelectedPosition(e.target.value)}
                        className="w-full bg-gray-700 rounded p-2 text-white"
                        required
                      >
                        <option value="">Select Position</option>
                        {positions.map((position) => (
                          <option key={position.id} value={position.title}>
                            {position.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedPosition && (
                      <div>
                        <label className="block mb-2">Employees in {selectedPosition}</label>
                        <select
                          name="supervisor"
                          value={newTask.supervisor}
                          onChange={handleSupervisorChange}
                          className="w-full bg-gray-700 rounded p-2 text-white"
                          required
                        >
                          <option value="">Select Supervisor</option>
                          {filteredByPositionEmployees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} ({emp.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block mb-2">Supervisor Email</label>
                      <input
                        type="email"
                        value={newTask.supervisorEmail || "example@example.com"} // Bind supervisor email
                        readOnly
                        className="w-full bg-gray-700 rounded p-2 text-white cursor-not-allowed"
                      />
                    </div>



                    <div className="md:col-span-2">
                      <label className="block mb-2">Task Description</label>
                      <textarea
                        name="description"
                        value={newTask.description}
                        onChange={handleInputChange}
                        className="w-full bg-gray-700 rounded p-2 text-white h-24"
                      ></textarea>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2 text-text-secondary">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <div
                            key={tag.id}
                            onClick={() => handleTagToggle(tag.name)}
                            className={`px-3 py-1 rounded-full text-sm cursor-pointer border border-border ${
                              newTask.tags.includes(tag.name) ? "bg-primary text-white" : "bg-background text-text-secondary"
                            }`}
                          >
                            {tag.name}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-2">Attachments</label>
                      <div className="flex mb-2">
                        <input
                          type="text"
                          value={attachmentInput}
                          onChange={(e) => setAttachmentInput(e.target.value)}
                          className="flex-1 bg-gray-700 rounded-l p-2 text-white"
                          placeholder="Filename.ext"
                        />
                        <button
                          type="button"
                          onClick={handleAddAttachment}
                          className="bg-purple-600 hover:bg-purple-700 px-4 rounded-r"
                        >
                          Add
                        </button>
                      </div>

                      {newTask.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newTask.attachments.map((file, index) => (
                            <div key={index} className="bg-gray-700 rounded px-3 py-1 flex items-center">
                              <span>{file}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(index)}
                                className="ml-2 text-red-400 hover:text-red-300"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>


                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className={`bg-primary hover:bg-primary-dark px-6 py-2 rounded font-semibold flex items-center justify-center gap-2 text-white ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <DotSpinner />
                          <span>Adding...</span>
                        </>
                      ) : (
                        isEditMode ? "Save Changes" : "Add Task"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        setEditingTaskId(null);
                        setNewTask({
                          name: "",
                          description: "",
                          dueDate: "",
                          totalHours: "",
                          attachments: [],
                          assignedTo: "",
                          department: "",
                          status: "not-started",
                          tags: [],
                          supervisor: "",
                          email: "",
                          supervisorEmail: "",
                        });
                        setShowTaskForm(false);
                      }}
                      className="bg-secondary hover:bg-secondary/80 px-6 py-2 rounded font-semibold text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Task List */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                  {tasks.length} {tasks.length === 1 ? "task" : "tasks"} total
                </div>
              </div>
              {/* ...existing task list rendering... */}
              {tasks.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <div className="text-gray-400 mb-4">No tasks available</div>
                  <button
                    onClick={handleAddNewTask}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded inline-flex items-center gap-2 transition-transform transform hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Create your first task
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((task) => {
                    const statusInfo = getStatusInfo(task.status);
                    return (
                      <div
                        key={task.id}
                        className="bg-surface rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 border border-border"
                      >
                        <div className={`${statusInfo.color} h-2`}></div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-text-primary">{task.name}</h3>
                            <span
                              className={`${statusInfo.color} text-xs px-2 py-1 rounded-full text-white`}
                              title={`Status: ${statusInfo.label}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-text-muted text-sm mb-2">Task ID: {task.taskId}</div>

                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {task.tags.map((tagName, index) => (
                                <span
                                  key={index}
                                  className="bg-gray-700 text-xs px-2 py-0.5 rounded-full text-white truncate max-w-[100px]"
                                  title={tagName}
                                >
                                  {tagName}
                                </span>
                              ))}
                            </div>
                          )}

                          {task.attachments?.length > 0 && (
                            <div className="mb-4">
                              <span className="block text-gray-400 text-sm mb-1">Attachments</span>
                              <div className="flex flex-wrap gap-2">
                                {task.attachments.map((attachment, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-700 rounded px-2 py-1 text-xs cursor-pointer hover:bg-gray-600 truncate max-w-[120px]"
                                    onClick={() => handleDownloadAttachment(attachment)}
                                    title={`Download ${attachment}`}
                                  >
                                    {attachment}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-gray-300 mb-4 text-sm">{task.description}</p>
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            <div>
                              <span className="block text-gray-400">Due Date</span>
                              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Total Hours</span>
                              <span>{task.totalHours} hrs</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Remaining Time</span>
                              <span>
                                {(() => {
                                  const totalSeconds = Math.floor(task.remainingTime);
                                  const hours = Math.floor(totalSeconds / 3600);
                                  const minutes = Math.floor((totalSeconds % 3600) / 60);
                                  const seconds = totalSeconds % 60;
                                  return `${hours} hrs ${minutes} min ${seconds} sec`;
                                })()}
                              </span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Department</span>
                              <span>{task.department}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Supervisor</span>
                              <span>{task.supervisor || "Not Assigned"}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Supervisor Email</span>
                              <span>{task.supervisorEmail || "Not Assigned"}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Assigned To</span>
                              <span>{task.assignedTo?.name || "Not Assigned"}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400">Assigned Email</span>
                              <span>{task.email || "Not Assigned"}</span>
                            </div>
                          </div>

                          <div className="flex justify-between mt-4 border-t border-border pt-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleMarkAsDone(task.id)}
                                className="p-2 bg-primary hover:bg-primary-dark rounded-full transition-transform transform hover:scale-110 text-white"
                                title="Mark as Done"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleMarkAsOvertime(task.id)}
                                className="p-2 bg-accent hover:bg-accent/80 rounded-full transition-transform transform hover:scale-110 text-text-primary"
                                title="Mark as Overtime"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTask(task.id)}
                                className="p-2 bg-secondary hover:bg-secondary/80 rounded-full transition-transform transform hover:scale-110 text-text-primary"
                                title="Edit Task"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-2 bg-text-muted hover:bg-text-muted/80 rounded-full transition-transform transform hover:scale-110 text-white"
                                title="Delete Task"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Employee Selector Modal */}
      {showEmployeeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Select Employees</h3>
              <button onClick={() => setShowEmployeeSelector(false)} className="text-gray-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="w-full bg-gray-700 rounded p-2 text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`flex items-center p-3 rounded cursor-pointer ${newTask.assignedTo === employee.id ? "bg-purple-700" : "bg-gray-700"
                    }`}
                  onClick={() => handleEmployeeSelect(employee.id)}
                >
                  <img
                    src={employee.avatar || "/placeholder.svg"}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <span>{employee.name}</span>
                    <span className="block text-xs text-gray-400">
                      ID: {employee.id} • {employee.department}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <div
                      className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${newTask.assignedTo === employee.id ? "bg-purple-500" : "bg-transparent"
                        }`}
                    >
                      {newTask.assignedTo === employee.id && <span className="text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowEmployeeSelector(false)}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

