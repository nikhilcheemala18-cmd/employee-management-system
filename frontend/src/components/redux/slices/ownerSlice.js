import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { apiUrl } from "../../../config/api";
import { clearAuthSession, getAuthSession, saveAuthSession } from "../../../utils/authSession";

export const ownerLoginThunk = createAsyncThunk(
  "owner-login",
  async (ownerCredObj, thunkApi) => {
    try {
      const res = await axios.post(
        apiUrl("/owner-api/login"),
        ownerCredObj
      );
      if (res.data.message === "Login success") {
        saveAuthSession({ role: "owner", token: res.data.token, user: res.data.owner });
        return res.data;
      } else {
        return thunkApi.rejectWithValue(res.data.message);
      }
    } catch (err) {
      return thunkApi.rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const loadOwnerStateFromLocalStorage = () => {
  const session = getAuthSession("owner");
  return {
    isPending: false,
    loginOwnerStatus: Boolean(session),
    currentOwner: session?.user || {},
    errorOccurred: false,
    errMsg: "",
  };
};

export const ownerSlice = createSlice({
  name: "owner-login",
  initialState: loadOwnerStateFromLocalStorage(),
  reducers: {
    resetState: (state) => {
      state.isPending = false;
      state.currentOwner = {};
      state.loginOwnerStatus = false;
      state.errorOccurred = false;
      state.errMsg = "";
      clearAuthSession();
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(ownerLoginThunk.pending, (state) => {
        state.isPending = true;
      })
      .addCase(ownerLoginThunk.fulfilled, (state, action) => {
        state.isPending = false;
        state.currentOwner = action.payload.owner;
        state.loginOwnerStatus = true;
        state.errorOccurred = false;
        state.errMsg = "";
      })
      .addCase(ownerLoginThunk.rejected, (state, action) => {
        state.isPending = false;
        state.currentOwner = {};
        state.loginOwnerStatus = false;
        state.errorOccurred = true;
        state.errMsg = action.payload;
      }),
});

export const { resetState } = ownerSlice.actions;

export default ownerSlice.reducer;
