const { db } = require('../firebaseConfig')
const Task = require('../models/taskModel');
const sharp = require('sharp'); // Add sharp for image resizing
const { sendTaskNotification } = require('../config/mailer');

const taskRef = db.collection('tasks'); // Ensure this is initialized correctly

exports.getAllTasks = async (req, res) => {
  try {
    const snapshot = await taskRef.get();
    const tasks = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        attachments: Array.isArray(data.attachments) ? data.attachments : [], // Ensure attachments is an array
      };
    });

    // Ensure assignedTo field is processed correctly
    for (const task of tasks) {
      if (task.assignedTo && typeof task.assignedTo === 'string' && task.assignedTo.trim() !== '') {
        try {
          const employeeDoc = await db.collection('employees').doc(task.assignedTo).get();
          if (employeeDoc.exists) {
            const employeeData = employeeDoc.data(); 
            task.assignedTo = {
              id: task.assignedTo,
              name: `${employeeData.firstName} ${employeeData.lastName}`,
              profileImage: employeeData.profileImage
                ? `${employeeData.profileImage}`
                : "/placeholder.svg",
            };
          } else {
            // If employee not found, keep as string ID
            task.assignedTo = task.assignedTo;
          }
        } catch (error) {
          console.error(`Error fetching employee ${task.assignedTo}:`, error);
          // Keep as string ID if there's an error
          task.assignedTo = task.assignedTo;
        }
      }
    }

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error); // Log the error for debugging
    res.status(500).json({ error: "Failed to fetch tasks. Please try again later." });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const doc = await taskRef.doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Task not found' });
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const taskData = { 
      ...req.body, 
      attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [], // Ensure attachments is an array
      supervisorEmail: req.body.supervisorEmail || "", // Include supervisorEmail
    };

    // Validate required fields
    if (!taskData.name || !taskData.dueDate || !taskData.department) {
      return res.status(400).json({ error: "Task name, due date, and department are required." });
    }

    // Validate assignedTo
    if (taskData.assignedTo && typeof taskData.assignedTo === "object" && taskData.assignedTo.id) {
      taskData.assignedTo = taskData.assignedTo.id; // Use the ID of the assigned employee
    } else {
      taskData.assignedTo = ""; // Clear invalid assignedTo
    }

    // Fetch supervisor name using supervisor ID
    if (taskData.supervisor) {
      try {
        const supervisorDoc = await db.collection('employees').doc(taskData.supervisor).get();
        if (supervisorDoc.exists) {
          const supervisorData = supervisorDoc.data();
          taskData.supervisor = `${supervisorData.firstName} ${supervisorData.lastName}`; // Save supervisor name
        } else {
          taskData.supervisor = "Unknown Supervisor"; // Fallback if supervisor not found
        }
      } catch (error) {
        console.error("Error fetching supervisor:", error);
        taskData.supervisor = "Unknown Supervisor";
      }
    }

    // Check for duplicate task by name and dueDate
    const existingTasks = await taskRef
      .where("name", "==", taskData.name)
      .where("dueDate", "==", taskData.dueDate)
      .get();

    if (!existingTasks.empty) {
      return res.status(400).json({ error: "A task with the same name and due date already exists." });
    }

    const task = new Task(taskData);
    const docRef = await taskRef.add({ ...task });

    // Send email notifications
    try {
      if (task.email) {
        await sendTaskNotification(task.email, task.assignedTo || "Employee", task);
      }
      if (task.supervisorEmail) {
        await sendTaskNotification(task.supervisorEmail, task.supervisor || "Supervisor", task);
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the task creation if email fails
    }

    res.status(201).json({ id: docRef.id, taskId: task.taskId, ...task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task. Please try again later." });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updateData = { 
      ...req.body, 
      attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [] // Ensure attachments is an array
    };

    // Fetch supervisor name using supervisor ID
    if (updateData.supervisor) {
      try {
        const supervisorDoc = await db.collection('employees').doc(updateData.supervisor).get();
        if (supervisorDoc.exists) {
          const supervisorData = supervisorDoc.data();
          updateData.supervisor = `${supervisorData.firstName} ${supervisorData.lastName}`; // Save supervisor name
        }
      } catch (error) {
        console.error("Error fetching supervisor:", error);
      }
    }

    // Fetch employeeId using assignedTo
    if (updateData.assignedTo) {
      try {
        const employeeDoc = await db.collection('employees').doc(updateData.assignedTo).get();
        if (employeeDoc.exists) {
          const employeeData = employeeDoc.data();
          updateData.employee_id = employeeData.employeeId; // Save employeeId
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    }

    const taskDoc = await taskRef.doc(req.params.id).get();
    if (!taskDoc.exists) {
      return res.status(404).json({ error: "Task not found" });
    }
    await taskRef.doc(req.params.id).update(updateData);

    // Send email notifications
    try {
      if (updateData.email) {
        await sendTaskNotification(updateData.email, updateData.assignedTo || "Employee", updateData);
      }
      if (updateData.supervisorEmail) {
        await sendTaskNotification(updateData.supervisorEmail, updateData.supervisor || "Supervisor", updateData);
      }
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Don't fail the task update if email fails
    }

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task. Please try again later." });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await taskRef.doc(req.params.id).delete();
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await taskRef.doc(req.params.id).update({ status });
    res.status(200).json({ message: 'Task status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
