import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
        name: "user",
        initialState: {
            status: false,
            userData: null,
        },
        reducers:{
            setUserData: (state,action)=>{
                    state.status = true;
                    state.userData = action.payload.userData
            },
            resetUser: (state)=>{
                state.status = false;
                state.userData = null;
            }
            
        }
})


export default userSlice.reducer;


export const {setUserData, resetUser} = userSlice.actions; 
