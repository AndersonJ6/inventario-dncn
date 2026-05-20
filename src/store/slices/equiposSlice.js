import { createSlice } from '@reduxjs/toolkit';
import { mockEquipos } from '../../data/mockData';

const getInitialEquipos = () => {
  try {
    const stored = localStorage.getItem('equipos_list');
    return stored ? JSON.parse(stored) : mockEquipos;
  } catch {
    return mockEquipos;
  }
};

const saveEquiposToStorage = (equipos) => {
  try {
    localStorage.setItem('equipos_list', JSON.stringify(equipos));
  } catch (err) {
    console.warn('No se pudo guardar equipos en localStorage:', err);
  }
};

const equiposSlice = createSlice({
  name: 'equipos',
  initialState: {
    list: getInitialEquipos(),
    selected: null,
    filters: {
      sede: null,
      area: null,
      estado: null,
      tipo: null,
    },
    // ── Excel importado — persiste entre navegaciones ──────────────────────
    excelData: null, // { rows: [...], columns: [...], filename: '' } | null
  },
  reducers: {
    addEquipo:    (state, action) => {
      state.list.push(action.payload);
      saveEquiposToStorage(state.list);
    },
    updateEquipo: (state, action) => {
      const i = state.list.findIndex(e => e.id === action.payload.id);
      if (i !== -1) {
        state.list[i] = action.payload;
        saveEquiposToStorage(state.list);
      }
    },
    deleteEquipo: (state, action) => {
      state.list = state.list.filter(e => e.id !== action.payload);
      saveEquiposToStorage(state.list);
    },
    setSelected:  (state, action) => { state.selected = action.payload; },
    setFilters:   (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { sede: null, area: null, estado: null, tipo: null }; },

    // ── Acciones Excel ─────────────────────────────────────────────────────
    setExcelData:   (state, action) => { state.excelData = action.payload; }, // { rows, columns, filename }
    clearExcelData: (state)         => { state.excelData = null; },
    updateExcelRow: (state, action) => {
      // payload: { index: number, row: {...} }
      if (state.excelData) {
        state.excelData.rows[action.payload.index] = action.payload.row;
      }
    },
    deleteExcelRow: (state, action) => {
      // payload: index number
      if (state.excelData) {
        state.excelData.rows.splice(action.payload, 1);
      }
    },
  },
});

export const {
  addEquipo, updateEquipo, deleteEquipo,
  setSelected, setFilters, clearFilters,
  setExcelData, clearExcelData, updateExcelRow, deleteExcelRow,
} = equiposSlice.actions;

export default equiposSlice.reducer;