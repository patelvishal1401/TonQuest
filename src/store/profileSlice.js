import { createSlice } from "@reduxjs/toolkit";
import { logoutFn } from "./logoutSlice";

const initialState = {
  username: '',
  userId: '',
  wallet:''
};

const profileSlice = createSlice({
  name: "Profile",
  initialState,
  reducers: {
    profileFn: (state, action) => {
      for (let key in state) {
        if (action.payload.hasOwnProperty(key)) {
          state[key] = action.payload[key];
        }
      }
    },
    onlineCoinsFn: (state, action) => {
      state.onlineCoins = state.onlineCoins + action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutFn, (state) => {
      return { ...initialState };
    });
  },
});

const profileReducer = profileSlice.reducer;
const profileState = (state) => state.profile;
const { profileFn, onlineCoinsFn } = profileSlice.actions;

export { profileReducer, profileState, profileFn, onlineCoinsFn };
