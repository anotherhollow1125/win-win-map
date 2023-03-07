import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DragStateEnum = "dragging" | "idling";

export const dragStateSlice = createSlice({
  name: "dragState",
  initialState: {
    state: "idling" as DragStateEnum,
    handle: (st: DragStateEnum) => {},
  },
  reducers: {
    setDragging: (state) => {
      state.state = "dragging";
      state.handle(state.state);
    },
    setIdling: (state) => {
      state.state = "idling";
      state.handle(state.state);
    },
    setHandle: (state, handle: PayloadAction<(st: DragStateEnum) => void>) => {
      state.handle = handle.payload;
    },
  },
});

// TODO: app-hookの内容をこちらに一部移動する
// 正直したほうがいいかしないべきか迷ってる

export const { setDragging, setIdling, setHandle } = dragStateSlice.actions;
// export default dragStateSlice.reducer;

const store = configureStore({
  reducer: {
    dragState: dragStateSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["dragState/setHandle"],
        // ignoredActionPaths: ["payload"],
        ignoredPaths: ["dragState.handle"],
      },
    }),
});

export default store;
export type DragState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
