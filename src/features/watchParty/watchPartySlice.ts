import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WatchPartyState, Participant, ChatMessage } from '../../types/watchParty';

const initialState: WatchPartyState = {
  roomId: null,
  isHost: false,
  participants: [],
  currentTime: 0,
  isPlaying: false,
  movieId: null,
  connected: false,
  messages: [],
};

const watchPartySlice = createSlice({
  name: 'watchParty',
  initialState,
  reducers: {
    createRoom: (state, action: PayloadAction<{ roomId: string; movieId: number; userId: string; userName: string }>) => {
      state.roomId = action.payload.roomId;
      state.movieId = action.payload.movieId;
      state.isHost = true;
      state.connected = true;
      state.participants = [{
        id: action.payload.userId,
        name: action.payload.userName,
        isHost: true,
      }];
      state.currentTime = 0;
      state.isPlaying = false;
      state.messages = [];
    },

    joinRoom: (state, action: PayloadAction<{ roomId: string; movieId: number; userId: string; userName: string }>) => {
      state.roomId = action.payload.roomId;
      state.movieId = action.payload.movieId;
      state.isHost = false;
      state.connected = true;
      state.participants = [{
        id: action.payload.userId,
        name: action.payload.userName,
        isHost: false,
      }];
    },

    leaveRoom: (state) => {
      state.roomId = null;
      state.isHost = false;
      state.participants = [];
      state.connected = false;
      state.messages = [];
      state.currentTime = 0;
      state.isPlaying = false;
    },

    addParticipant: (state, action: PayloadAction<Participant>) => {
      const exists = state.participants.find(p => p.id === action.payload.id);
      if (!exists) {
        state.participants.push(action.payload);
      }
    },

    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },

    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },

    syncState: (state, action: PayloadAction<{ currentTime: number; isPlaying: boolean }>) => {
      state.currentTime = action.payload.currentTime;
      state.isPlaying = action.payload.isPlaying;
    },
  },
});

export const {
  createRoom,
  joinRoom,
  leaveRoom,
  addParticipant,
  removeParticipant,
  setPlaying,
  setCurrentTime,
  addMessage,
  syncState,
} = watchPartySlice.actions;

export default watchPartySlice.reducer;

