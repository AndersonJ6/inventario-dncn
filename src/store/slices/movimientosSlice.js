import { createSlice } from '@reduxjs/toolkit';
import { mockMovimientos } from '../../data/mockData';

const movimientosSlice = createSlice({
  name: 'movimientos',
  initialState: {
    list: mockMovimientos,
    filters: {
      sede: null,
      tipo: null,
      fechaDesde: null,
      fechaHasta: null
    }
  },
  reducers: {
    addMovimiento: (state, action) => { state.list.push(action.payload); },
    updateMovimiento: (state, action) => {
      const i = state.list.findIndex((m) => m.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    },
    deleteMovimiento: (state, action) => {
      state.list = state.list.filter((m) => m.id !== action.payload);
    },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { sede: null, tipo: null, fechaDesde: null, fechaHasta: null }; },
  },
});

export const { addMovimiento, updateMovimiento, deleteMovimiento, setFilters, clearFilters } = movimientosSlice.actions;
export default movimientosSlice.reducer;
