import { createSlice } from '@reduxjs/toolkit';
import { mockUsuarios } from '../../data/mockData';

const getInitialUsuarios = () => {
  try {
    const stored = localStorage.getItem('usuarios_list');
    return stored ? JSON.parse(stored) : mockUsuarios;
  } catch {
    return mockUsuarios;
  }
};

const saveUsuariosToStorage = (usuarios) => {
  try {
    localStorage.setItem('usuarios_list', JSON.stringify(usuarios));
  } catch (err) {
    console.warn('No se pudo guardar usuarios en localStorage:', err);
  }
};

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState: { list: getInitialUsuarios() },
  reducers: {
    addUsuario:    (state, action) => {
      state.list.push(action.payload);
      saveUsuariosToStorage(state.list);
    },
    updateUsuario: (state, action) => {
      const i = state.list.findIndex(u => u.id === action.payload.id);
      if (i !== -1) {
        state.list[i] = action.payload;
        saveUsuariosToStorage(state.list);
      }
    },
    deleteUsuario: (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
      saveUsuariosToStorage(state.list);
    },
  },
});

export const { addUsuario, updateUsuario, deleteUsuario } = usuariosSlice.actions;
export default usuariosSlice.reducer;