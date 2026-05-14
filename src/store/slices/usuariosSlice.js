import { createSlice } from '@reduxjs/toolkit';
import { mockUsuarios } from '../../data/mockData';

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState: { list: mockUsuarios },
  reducers: {
    addUsuario:    (state, action) => { state.list.push(action.payload); },
    updateUsuario: (state, action) => {
      const i = state.list.findIndex(u => u.id === action.payload.id);
      if (i !== -1) state.list[i] = action.payload;
    },
    deleteUsuario: (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
    },
  },
});

export const { addUsuario, updateUsuario, deleteUsuario } = usuariosSlice.actions;
export default usuariosSlice.reducer;