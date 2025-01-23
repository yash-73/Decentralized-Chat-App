import { createSlice } from "@reduxjs/toolkit";

const roomSlice = createSlice({
    name: "room",
    initialState: {
        roomData: null,
        active: false,
    },
    reducers: {
        createRoom: (state,action)=>{
                    state.active = true,
                    state.roomData = action.payload.roomData
        },
        deleteRoom: (state)=>{
            state.active = false,
            state.roomData = null
        }
    }
})

export default roomSlice.reducer;

export const {createRoom , deleteRoom} = roomSlice.actions;