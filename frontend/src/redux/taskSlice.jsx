import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { backEndURL } from "../Backendurl";
import { getAuthToken } from '../utils/auth';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async actions
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backEndURL}/api/tasks`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to fetch tasks');
  }
});

export const addTask = createAsyncThunk('tasks/addTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${backEndURL}/api/tasks`, taskData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to add task');
  }
});

export const editTask = createAsyncThunk('tasks/editTask', async ({ id, taskData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${backEndURL}/api/tasks/${id}`, taskData, {
      headers: getAuthHeaders()
    });
    return { id, ...taskData };
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to edit task');
  }
});

export const updateTaskStatus = createAsyncThunk('tasks/updateTaskStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    await axios.patch(`${backEndURL}/api/tasks/${id}`, { status }, {
      headers: getAuthHeaders()
    });
    return { id, status };
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to update task status');
  }
});

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${backEndURL}/api/tasks/${id}`, {
      headers: getAuthHeaders()
    });
    return id;
  } catch (error) {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return rejectWithValue(error.response?.data?.error || 'Failed to delete task');
  }
});

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add task
      .addCase(addTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Edit task
      .addCase(editTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index].status = action.payload.status;
        }
        state.error = null;
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;
