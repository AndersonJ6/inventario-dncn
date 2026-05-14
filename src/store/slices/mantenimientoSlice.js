import { createSlice } from '@reduxjs/toolkit';

const mantenimientoSlice = createSlice({
  name: 'mantenimiento',
  initialState: { list: [] },
  reducers: {
    addRegistro:    (state, action) => { state.list.push(action.payload); },
    updateRegistro: (state, action) => {
      const i = state.list.findIndex(r => r.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    },
    deleteRegistro: (state, action) => {
      state.list = state.list.filter(r => r.id !== action.payload);
    },
  },
});

export const { addRegistro, updateRegistro, deleteRegistro } = mantenimientoSlice.actions;
export default mantenimientoSlice.reducer;