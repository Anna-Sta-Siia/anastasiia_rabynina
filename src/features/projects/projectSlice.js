import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  projectFilters: [],
  // pour  y ajouter ta liste de projets, etc.
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    toggleFilter(state, action) {
      const tech = action.payload;
      state.projectFilters = state.projectFilters.includes(tech)
        ? state.projectFilters.filter((t) => t !== tech)
        : [...state.projectFilters, tech];
    },
    clearFilters(state) {
      state.projectFilters = [];
    },
  },
});

export const { toggleFilter, clearFilters } = projectSlice.actions;
export default projectSlice.reducer;
