class Shift {
  constructor(data) {
    this.date = data.date || null;
    this.employeeId = data.employeeId || ""; 
    this.taskId = data.taskId || "";
    this.taskName = data.taskName || ""; 
    this.startTime = data.startTime || null; 
    this.endTime = data.endTime || null;
    this.totalSpentTime = data.totalSpentTime || 0;
  }
}

module.exports = Shift;
