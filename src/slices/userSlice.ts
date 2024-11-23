import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleActionManageUser, handleLogin } from '../services/userService';
import { RequestActionUser, User, UserState } from '../types/userTypes';

const initialState: UserState = {
    userDetails : null,
    loading     : false,
    error       : null,
};

export const sendLogin = createAsyncThunk<User, { email: string; password: string }>(
    'users/login',
    async (newUser) => {
        const response = await handleLogin(newUser);
        return response;
    }
);

export const sendActionManageUser = createAsyncThunk<User, RequestActionUser>(
    'users/register',
    async (payload) => {
        const response = await handleActionManageUser(payload);
        return response;
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        resetUserDetails(state) {
            state.userDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.userDetails = action.payload;
                localStorage.setItem('userToken', action.payload.token);
            })
            .addCase(sendLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to login';
            })

            .addCase(sendActionManageUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendActionManageUser.fulfilled, (state, action) => {
                state.loading = false;
                state.userDetails = action.payload;
            })
            .addCase(sendActionManageUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to register';
            })
    },
});

export const { resetUserDetails } = userSlice.actions;

export default userSlice.reducer;
