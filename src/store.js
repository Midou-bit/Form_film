import { configureStore } from "@reduxjs/toolkit";
import commentReducer from "./Redux/commentSlice";

const store = configureStore({
  reducer: {
    comments: commentReducer,
  },
});

export default store;
