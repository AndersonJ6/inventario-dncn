import { createSlice } from '@reduxjs/toolkit';
import { mockMantenimientos } from '../../data/mockData';

const getInitialMantenimientos = () => {
  try {
    const stored = localStorage.getItem('mantenimientos_list');
    return stored ? JSON.parse(stored) : mockMantenimientos;
  } catch {
    return mockMantenimientos;
  }
};

const saveMantenimientosToStorage = (mantenimientos) => {
  try {
    localStorage.setItem('mantenimientos_list', JSON.stringify(mantenimientos));
  } catch (err) {
    console.warn('No se pudo guardar mantenimientos en localStorage:', err);
  }
};

const mantenimientoSlice = createSlice({
  name: 'mantenimiento',
  initialState: {
    list: getInitialMantenimientos(),
    filters: {
      sede: null,
      estado: null,
      tipo: null
    }
  },
  reducers: {
    addRegistro:    (state, action) => {
      state.list.push(action.payload);
      saveMantenimientosToStorage(state.list);
    },
    updateRegistro: (state, action) => {
      const i = state.list.findIndex(r => r.id === action.payload.id);
      if (i !== -1) {
        state.list[i] = action.payload;
        saveMantenimientosToStorage(state.list);
      }
    },
    deleteRegistro: (state, action) => {
      state.list = state.list.filter(r => r.id !== action.payload);
      saveMantenimientosToStorage(state.list);
    },
    setFilters:     (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters:   (state) => { state.filters = { sede: null, estado: null, tipo: null }; },
  },
});

export const { addRegistro, updateRegistro, deleteRegistro, setFilters, clearFilters } = mantenimientoSlice.actions;
export default mantenimientoSlice.reducer;