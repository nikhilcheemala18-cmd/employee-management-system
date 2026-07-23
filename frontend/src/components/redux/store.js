import { configureStore } from "@reduxjs/toolkit";
import ownerReducer from "./slices/ownerSlice";
import operatorReducer from "./slices/operatorSlice";

const store = configureStore({
  reducer: {
    ownerLoginReducer: ownerReducer,
    operatorLoginReducer: operatorReducer, // Add operator reducer
  },
});

export default store;
