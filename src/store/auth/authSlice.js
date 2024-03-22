import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

const initialState = {
  user: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: "",
  lang: null,
};

// Check user by phone
export const getUserByPhone = createAsyncThunk(
  "auth/phone",
  async (userData, thunkAPI) => {
    try {
      await authService.getUserByPhone(userData);
      return await authService.login(userData);
    } catch (error) {
      if (error.response.status == 404) {
        try {
          return await authService.register(userData);
        } catch (error) {
          const message =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          return thunkAPI.rejectWithValue(message);
        }
      }
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (user, thunkAPI) => {
    try {
      return await authService.register(user);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register confirm
export const codeConfirm = createAsyncThunk(
  "auth/confirm",
  async (userData, thunkAPI) => {
    try {
      return await authService.loginConfirm(userData);
    } catch (err) {
      try {
        return await authService.registerConfirm(userData);
      } catch (error) {
        const message =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        return thunkAPI.rejectWithValue(message);
      }
    }
  }
);

// Login user
export const login = createAsyncThunk("auth/login", async (user, thunkAPI) => {
  try {
    return await authService.login(user);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

// Update user details
export const updateUserDetails = createAsyncThunk(
  "auth/update",
  async (userData, thunkAPI) => {
    try {
      return await authService.updateUserDetails(userData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    logout: (state) => initialState,
    updateName: (state, action) => {
      state.user.name = action.payload;
    },
    updateLang: (state, action) => {
      state.lang = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserByPhone.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserByPhone.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'phone number is submitted';
      })
      .addCase(getUserByPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(codeConfirm.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(codeConfirm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(codeConfirm.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(updateUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, logout, updateName, updateLang } = authSlice.actions;
export default authSlice.reducer;
