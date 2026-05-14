import { configureStore } from '@reduxjs/toolkit';
import authReducer          from './slices/authSlice';
import equiposReducer       from './slices/equiposSlice';
import usuariosReducer      from './slices/usuariosSlice';
import mantenimientoReducer from './slices/mantenimientoSlice';

export default configureStore({
  reducer: {
    auth:          authReducer,
    equipos:       equiposReducer,
    usuarios:      usuariosReducer,
    mantenimiento: mantenimientoReducer,
  },
});