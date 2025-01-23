import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice'; 
import roomReducer  from './roomSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        room: roomReducer
    },
});

export default store;
