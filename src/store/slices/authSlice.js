import { createSlice } from '@reduxjs/toolkit';

const savedUser = (() => {
  try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!savedUser,
    user: savedUser,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
      try { localStorage.setItem('auth_user', JSON.stringify(action.payload)); } catch { /* empty */ }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      try { localStorage.removeItem('auth_user'); } catch { /* empty */ }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
