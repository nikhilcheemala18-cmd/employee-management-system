import { configureStore } from "@reduxjs/toolkit";
import ownerReducer from "./slices/ownerSlice";
import operatorReducer from "./slices/operatorSlice"; // Import operatorReducer

// Middleware to sync `ownerLoginReducer` state with localStorage
const saveOwnerStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state.ownerLoginReducer);
    localStorage.setItem("ownerState", serializedState);
  } catch (e) {
    console.error("Could not save owner state", e);
  }
};

// Middleware to sync `operatorLoginReducer` state with localStorage
const saveOperatorStateToLocalStorage = (state) => {
  try {
    const operatorserializedState = JSON.stringify(state.operatorLoginReducer);
    localStorage.setItem("operatorState", operatorserializedState);
  } catch (e) {
    console.error("Could not save operator state", e);
  }
};

// Load persisted state from localStorage
const loadOwnerStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("ownerState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (e) {
    console.error("Could not load owner state", e);
    return undefined;
  }
};

const loadOperatorStateFromLocalStorage = () => {
  try {
    const operatorserializedState = localStorage.getItem("operatorState");
    return operatorserializedState ? JSON.parse(operatorserializedState) : undefined;
  } catch (e) {
    console.error("Could not load operator state", e);
    return undefined;
  }
};

// Load persisted states
const ownerPersistedState = loadOwnerStateFromLocalStorage();
const operatorPersistedState = loadOperatorStateFromLocalStorage();

const store = configureStore({
  reducer: {
    ownerLoginReducer: ownerReducer,
    operatorLoginReducer: operatorReducer, // Add operator reducer
  },
  preloadedState: {
    ownerLoginReducer: ownerPersistedState,
    operatorLoginReducer: operatorPersistedState, // Preload operator state
  },
});

// Save states to localStorage on changes
store.subscribe(() => {
  saveOwnerStateToLocalStorage(store.getState());
  saveOperatorStateToLocalStorage(store.getState());
});

export default store;
