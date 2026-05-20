import { createSlice } from '@reduxjs/toolkit';
import { mockMovimientos } from '../../data/mockData';

const getInitialMovimientos = () => {
  try {
    const stored = localStorage.getItem('movimientos_list');
    return stored ? JSON.parse(stored) : mockMovimientos;
  } catch {
    return mockMovimientos;
  }
};

const saveMovimientosToStorage = (movimientos) => {
  try {
    localStorage.setItem('movimientos_list', JSON.stringify(movimientos));
  } catch (err) {
    console.warn('No se pudo guardar movimientos en localStorage:', err);
  }
};

const movimientosSlice = createSlice({
  name: 'movimientos',
  initialState: {
    list: getInitialMovimientos(),
    filters: {
      sede: null,
      tipo: null,
      fechaDesde: null,
      fechaHasta: null
    }
  },
  reducers: {
    addMovimiento: (state, action) => {
      state.list.push(action.payload);
      saveMovimientosToStorage(state.list);
    },
    updateMovimiento: (state, action) => {
      const i = state.list.findIndex((m) => m.id === action.payload.id);
      if (i !== -1) {
        state.list[i] = action.payload;
        saveMovimientosToStorage(state.list);
      }
    },
    deleteMovimiento: (state, action) => {
      state.list = state.list.filter((m) => m.id !== action.payload);
      saveMovimientosToStorage(state.list);
    },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { sede: null, tipo: null, fechaDesde: null, fechaHasta: null }; },
  },
});

export const { addMovimiento, updateMovimiento, deleteMovimiento, setFilters, clearFilters } = movimientosSlice.actions;
export default movimientosSlice.reducer;
