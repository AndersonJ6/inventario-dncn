import { createSlice } from '@reduxjs/toolkit';
import { mockMantenimientos } from '../../data/mockData';

const mantenimientoSlice = createSlice({
  name: 'mantenimiento',
  initialState: {
    list: mockMantenimientos,
    filters: {
      sede: null,
      estado: null,
      tipo: null
    }
  },
  reducers: {
    addRegistro:    (state, action) => { state.list.push(action.payload); },
    updateRegistro: (state, action) => {
      const i = state.list.findIndex(r => r.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    },
    deleteRegistro: (state, action) => {
      state.list = state.list.filter(r => r.id !== action.payload);
    },
    setFilters:     (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters:   (state) => { state.filters = { sede: null, estado: null, tipo: null }; },
  },
});

export const { addRegistro, updateRegistro, deleteRegistro, setFilters, clearFilters } = mantenimientoSlice.actions;
export default mantenimientoSlice.reducer;