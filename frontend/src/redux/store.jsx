import { configureStore } from '@reduxjs/toolkit';
import employeeReducer from './employeeSlice';
import taskReducer from './taskSlice';
import groupReducer from './groupSlice'; // Import groupSlice

const store = configureStore({
  reducer: {
    employees: employeeReducer,
    tasks: taskReducer, 
    groups: groupReducer, // Add groupReducer
  },
});

export default store;
