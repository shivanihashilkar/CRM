import { configureStore } from "@reduxjs/toolkit";
import hcpInteractionReducer from "./features/hcpInteractionSlice";

export const store = configureStore({
  reducer: {
    hcpInteraction: hcpInteractionReducer,
  },
});
