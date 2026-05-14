import { createSlice } from '@reduxjs/toolkit';
import { mockEquipos } from '../../data/mockData';

const equiposSlice = createSlice({
  name: 'equipos',
  initialState: {
    list: mockEquipos,
    selected: null,
    filters: {
      sede: null,
      area: null,
      estado: null,
      tipo: null
    }
  },
  reducers: {
    addEquipo:    (state, action) => { state.list.push(action.payload); },
    updateEquipo: (state, action) => {
      const i = state.list.findIndex(e => e.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    },
    deleteEquipo: (state, action) => {
      state.list = state.list.filter(e => e.id !== action.payload);
    },
    setSelected:  (state, action) => { state.selected = action.payload; },
    setFilters:   (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { sede: null, area: null, estado: null, tipo: null }; },
  },
});

export const { addEquipo, updateEquipo, deleteEquipo, setSelected, setFilters, clearFilters } = equiposSlice.actions;
export default equiposSlice.reducer;