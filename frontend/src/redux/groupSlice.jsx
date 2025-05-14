import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { backEndURL } from "../Backendurl";

// Async thunks for fetching data
export const fetchGroups = createAsyncThunk('groups/fetchGroups', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backEndURL}/api/groups`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const fetchAnnouncements = createAsyncThunk('groups/fetchAnnouncements', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${backEndURL}/api/announcements`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    announcements: [],
    isLoading: false,
  },
  reducers: {
    addGroup(state, action) {
      state.groups.push(action.payload);
    },
    updateGroup(state, action) {
      const index = state.groups.findIndex((group) => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    deleteGroup(state, action) {
      state.groups = state.groups.filter((group) => group.id !== action.payload);
    },
    addAnnouncement(state, action) {
      state.announcements.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchGroups.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAnnouncements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAnnouncements.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { addGroup, updateGroup, deleteGroup, addAnnouncement } = groupSlice.actions;
export default groupSlice.reducer;
