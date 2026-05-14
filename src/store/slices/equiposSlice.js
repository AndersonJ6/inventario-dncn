import { createSlice } from '@reduxjs/toolkit';
import { mockEquipos } from '../../data/mockData';

const equiposSlice = createSlice({
  name: 'equipos',
  initialState: { list: mockEquipos, selected: null },
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
  },
});

export const { addEquipo, updateEquipo, deleteEquipo, setSelected } = equiposSlice.actions;
export default equiposSlice.reducer;