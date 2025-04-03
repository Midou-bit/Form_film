import { createSlice } from "@reduxjs/toolkit";

const commentSlice = createSlice({
  name: "comments",
  initialState: [],
  reducers: {
    addComment: (state, action) => {
      state.push({
        id: Date.now(),
        comment: action.payload.comment,
        note: action.payload.note
      });
    },
    deleteComment: (state, action) => {
      return state.filter((c) => c.id !== action.payload);
    }
  }
});

export const { addComment, deleteComment } = commentSlice.actions;
export default commentSlice.reducer;
