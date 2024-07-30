import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";
import { jwtDecode } from 'jwt-decode';
import { socket } from "../../utils/utils";


export const user_login = createAsyncThunk(
    'auth/user_login',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/user-login', info, { withCredentials: true })
            localStorage.setItem('accessToken', data.token)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const user_register = createAsyncThunk(
    'auth/user_register',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/user-register', info)
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const get_user_info = createAsyncThunk(

    'auth/get_user_info',
    async (_, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.get('/get-user', { withCredentials: true })
            // console.log(data)
            return fulfillWithValue(data)
        } catch (error) {
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const profile_image_upload = createAsyncThunk(
    'auth/profile_image_upload',
    async (image, { rejectWithValue, fulfillWithValue }) => {

        try {
            const { data } = await api.post('/profile-image-upload', image, { withCredentials: true })
            // console.log(data)            
            return fulfillWithValue(data)
        } catch (error) {
            console.log(error)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const profile_info_add = createAsyncThunk(
    'auth/profile_info_add',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/profile-info-add', info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

export const password_update = createAsyncThunk(
    'auth/password_update',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/password-update', info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method 

const returnRole = (token) => {
    if (token) {
        const decodeToken = jwtDecode(token)
        // console.log(decodeToken)
        const expireTime = new Date(decodeToken?.exp?.exp * 1000)

        if (new Date() > expireTime) {
            localStorage.removeItem('accessToken')

        } else {
            return decodeToken.role
        }

    } else {
        return ''
    }
}

export const logout = createAsyncThunk(
    'auth/logout',
    async ({ navigate, role }, { rejectWithValue, fulfillWithValue }) => {

        try {
            socket.disconnect();
            const { data } = await api.get('/logout', { withCredentials: true })
            // localStorage.removeItem('accessToken') 

            if (role === 'admin') {
                navigate('/admin/login')
            } else {
                navigate('/login')
            }
            return fulfillWithValue(data)

        } catch (error) {
            // localStorage.removeItem('accessToken') 
            return rejectWithValue(error.response.data)
        }
    }
)
// end Method 

export const forgot_password = createAsyncThunk(
    'auth/forgot_password',
    async (info, { rejectWithValue, fulfillWithValue }) => {
        try {
            const { data } = await api.post('/forgot-password', info, { withCredentials: true })
            return fulfillWithValue(data)
        } catch (error) {
            // console.log(error.response.data)
            return rejectWithValue(error.response.data)
        }
    }
)
// end method

export const reset_password = createAsyncThunk(
    'auth/reset_password',
    async ({ new_password, token }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/reset-password/${token}`, { new_password }, { withCredentials: true });

            // Assuming your API response has a status field indicating success or failure
            if (response.status === 201) {
                return { status: 'success', message: response.data.message };
            } else {
                return rejectWithValue({ status: 'error', message: 'Unexpected response' });
            }
        } catch (error) {
            return rejectWithValue({ status: 'error', message: error.response.data.message || 'An error occurred' });
        }
    }
);
// end method 

export const verifynewuser = createAsyncThunk(
    'auth/verifynewuser',
    async ({ token }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/verifynewuser/${token}`);

            // Assuming your API response has a status field indicating success or failure
            if (response.status === 200) {
                return { status: 'success', message: response.data.message };
            } else {
                return rejectWithValue({ status: 'error', message: 'Unexpected response' });
            }
        } catch (error) {
            return rejectWithValue({
                status: 'error',
                message: (error.response && error.response.data && error.response.data.message) || 'An error occurred'
            });
        }
    }
);
// end method 


export const authReducer = createSlice({
    name: 'auth',
    initialState: {
        successMessage: '',
        errorMessage: '',
        loader: false,
        userInfo: '',
        role: returnRole(localStorage.getItem('accessToken')),
        token: localStorage.getItem('accessToken')
    },
    reducers: {
        messageClear: (state, _) => {
            state.errorMessage = ""
            state.successMessage = ""
        },
        dataClear: (state, _) => {
            state.role = ""
            state.token = ""
            state.userInfo = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(user_register.pending, (state, { payload }) => {
                state.loader = true;
            }).addCase(user_register.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            }).addCase(user_register.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
            })

            .addCase(user_login.pending, (state, { payload }) => {
                state.loader = true;
            }).addCase(user_login.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            }).addCase(user_login.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message

                state.token = payload.token
                state.role = returnRole(payload.token)
            })
            .addCase(get_user_info.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
            })

            .addCase(profile_image_upload.pending, (state, { payload }) => {
                state.loader = true;
            })
            .addCase(profile_image_upload.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(profile_image_upload.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
                state.successMessage = payload.message
            })

            .addCase(profile_info_add.pending, (state, { payload }) => {
                state.loader = true;
            })
            .addCase(profile_info_add.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(profile_info_add.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.userInfo = payload.userInfo
                state.successMessage = payload.message
            })

            .addCase(password_update.pending, (state, { payload }) => {
                state.loader = true;
            })
            .addCase(password_update.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(password_update.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
            })

            .addCase(forgot_password.pending, (state, { payload }) => {
                state.loader = true;
            })
            .addCase(forgot_password.rejected, (state, { payload }) => {
                state.loader = false;
                state.errorMessage = payload.error
            })
            .addCase(forgot_password.fulfilled, (state, { payload }) => {
                state.loader = false;
                state.successMessage = payload.message
            })
            .addCase(logout.fulfilled, (state, { payload }) => {
                state.role = "";
                state.token = "";
            })
    }
})

export const { messageClear, dataClear } = authReducer.actions
export default authReducer.reducer