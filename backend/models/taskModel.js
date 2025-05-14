class Task {
    constructor(data) {
        this.taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // Generate unique task ID
        this.name = data.name || "Untitled Task";
        this.description = data.description || "";
        this.dueDate = data.dueDate || null;
        this.totalHours = data.totalHours || 0;
        this.department = data.department || "General";
        this.assignedTo = data.assignedTo || ""; // Single value for assignedTo
        this.employee_id = data.employee_id || ""; // Add employee_id field
        this.remainingTime = data.remainingTime || ""; // Save remaining time
        this.status = this.calculateStatus(data.remainingTime, data.totalHours); // Calculate status
        this.tags = Array.isArray(data.tags) ? data.tags : []; // Store tag names
        this.supervisor = data.supervisor || "";
        this.attachments = Array.isArray(data.attachments) ? data.attachments : []; // Ensure attachments is an array
        this.email = data.email || "";
        this.supervisorEmail = data.supervisorEmail || ""; // Add supervisorEmail field
    }

    // Method to calculate task status based on remaining time and total hours
    calculateStatus(remainingTime, totalHours) {
        if (remainingTime === "") return "not-started"; // No time logged
        if (remainingTime >= 0 && remainingTime < totalHours * 3600) return "started"; // Time logged but within limit
        if (remainingTime < 0) return "overtime"; // Time exceeded
        return "not-started"; // Default fallback
    }
}

module.exports = Task;
