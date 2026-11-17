import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('classroom-token'),
  user: JSON.parse(localStorage.getItem('classroom-user') || 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('classroom-token', action.payload.token);
      localStorage.setItem('classroom-user', JSON.stringify(action.payload.user));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('classroom-token');
      localStorage.removeItem('classroom-user');
    },
    updateUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('classroom-user', JSON.stringify(action.payload));
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
