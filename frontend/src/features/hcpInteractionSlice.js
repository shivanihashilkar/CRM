import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const today = new Date();

export const initialForm = {
  hcp_name: "Dr. Meera Shah",
  interaction_type: "Meeting",
  date: today.toISOString().slice(0, 10),
  time: today.toTimeString().slice(0, 5),
  attendees: "Sales rep, MSL",
  topics_discussed: "",
  outcomes: "",
  follow_up_actions: "",
  materials_shared: [],
  samples_distributed: [],
  sentiment: "Neutral",
};

const getErrorMessage = (error) => error.response?.data?.detail || error.message;

export const fetchInteractions = createAsyncThunk(
  "hcpInteraction/fetchInteractions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/interactions`);
      return response.data.interactions;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const requestAiAssist = createAsyncThunk(
  "hcpInteraction/requestAiAssist",
  async (form, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/ai/hcp-assist`, form);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const extractInteractionFromChat = createAsyncThunk(
  "hcpInteraction/extractInteractionFromChat",
  async ({ message, form }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/ai/extract-interaction`, {
        message,
        current_interaction: form,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveInteraction = createAsyncThunk(
  "hcpInteraction/saveInteraction",
  async (form, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/interactions`, form);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateInteraction = createAsyncThunk(
  "hcpInteraction/updateInteraction",
  async ({ id, form }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/interactions/${id}`, form);
      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const hcpInteractionSlice = createSlice({
  name: "hcpInteraction",
  initialState: {
    form: initialForm,
    editingInteractionId: null,
    ai: null,
    interactions: [],
    assistantPrompt: "",
    status: "",
    isLoading: false,
    error: "",
  },
  reducers: {
    updateField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
    },
    toggleArrayItem(state, action) {
      const { field, value } = action.payload;
      const exists = state.form[field].includes(value);
      state.form[field] = exists
        ? state.form[field].filter((item) => item !== value)
        : [...state.form[field], value];
    },
    setAssistantPrompt(state, action) {
      state.assistantPrompt = action.payload;
    },
    setStatus(state, action) {
      state.status = action.payload;
      state.error = "";
    },
    loadInteractionForEdit(state, action) {
      const interaction = action.payload;
      state.editingInteractionId = interaction.id;
      state.form = {
        hcp_name: interaction.hcp_name,
        interaction_type: interaction.interaction_type,
        date: interaction.date,
        time: interaction.time,
        attendees: interaction.attendees || "",
        topics_discussed: interaction.topics_discussed || "",
        outcomes: interaction.outcomes || "",
        follow_up_actions: interaction.follow_up_actions || "",
        materials_shared: interaction.materials_shared || [],
        samples_distributed: interaction.samples_distributed || [],
        sentiment: interaction.sentiment || "Neutral",
      };
      state.ai = {
        summary: interaction.ai_summary || "",
        follow_ups: interaction.ai_follow_ups || [],
        next_best_action: interaction.ai_next_best_action || "",
      };
      state.status = `Editing interaction #${interaction.id}.`;
      state.error = "";
    },
    clearEditing(state) {
      state.editingInteractionId = null;
      state.form = initialForm;
      state.ai = null;
      state.assistantPrompt = "";
      state.status = "Ready to log a new interaction.";
      state.error = "";
    },
    resetInteractionForm(state) {
      state.form = initialForm;
      state.editingInteractionId = null;
      state.ai = null;
      state.assistantPrompt = "";
      state.status = "";
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.error = "";
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.interactions = action.payload;
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.error = action.payload;
        state.status = action.payload;
      })
      .addCase(requestAiAssist.pending, (state) => {
        state.isLoading = true;
        state.status = "Generating AI suggestions...";
        state.error = "";
      })
      .addCase(requestAiAssist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ai = action.payload;
        state.form.sentiment = action.payload.sentiment || state.form.sentiment;
        state.status = "AI suggestions ready.";
      })
      .addCase(requestAiAssist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = action.payload;
      })
      .addCase(extractInteractionFromChat.pending, (state) => {
        state.isLoading = true;
        state.status = "Extracting CRM fields from chat...";
        state.error = "";
      })
      .addCase(extractInteractionFromChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.form = { ...state.form, ...action.payload.fields };
        state.ai = action.payload.ai;
        state.assistantPrompt = "";
        state.status = "Chat note converted into structured CRM fields.";
      })
      .addCase(extractInteractionFromChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = action.payload;
      })
      .addCase(saveInteraction.pending, (state) => {
        state.isLoading = true;
        state.status = "Saving interaction...";
        state.error = "";
      })
      .addCase(saveInteraction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ai = action.payload.ai;
        state.interactions = [action.payload.interaction, ...state.interactions].slice(0, 25);
        state.status = "Interaction logged successfully.";
      })
      .addCase(saveInteraction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = action.payload;
      })
      .addCase(updateInteraction.pending, (state) => {
        state.isLoading = true;
        state.status = "Updating interaction...";
        state.error = "";
      })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ai = action.payload.ai;
        state.interactions = state.interactions.map((interaction) =>
          interaction.id === action.payload.interaction.id ? action.payload.interaction : interaction
        );
        state.editingInteractionId = null;
        state.status = "Interaction updated successfully.";
      })
      .addCase(updateInteraction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = action.payload;
      });
  },
});

export const {
  clearEditing,
  loadInteractionForEdit,
  resetInteractionForm,
  setAssistantPrompt,
  setStatus,
  toggleArrayItem,
  updateField,
} = hcpInteractionSlice.actions;

export default hcpInteractionSlice.reducer;
