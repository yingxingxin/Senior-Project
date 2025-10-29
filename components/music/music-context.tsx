'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { MusicTrack } from '@/src/db/schema';

// ============ TYPES ============

interface MusicState {
  // Current track info
  currentTrack: MusicTrack | null;
  currentTrackIndex: number;
  availableTracks: MusicTrack[];
  userSelectedTracks: MusicTrack[];
  
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showPlayer: boolean;
}

type MusicAction =
  | { type: 'SET_TRACKS'; payload: { available: MusicTrack[]; userSelected: MusicTrack[] } }
  | { type: 'SET_CURRENT_TRACK'; payload: MusicTrack }
  | { type: 'SET_CURRENT_TRACK_INDEX'; payload: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREVIOUS_TRACK' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_PLAYER_VISIBILITY' }
  | { type: 'ADD_USER_TRACK'; payload: MusicTrack }
  | { type: 'REMOVE_USER_TRACK'; payload: number };

interface MusicContextType {
  state: MusicState;
  dispatch: React.Dispatch<MusicAction>;
  // Actions
  playTrack: (track: MusicTrack) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  addToUserTracks: (track: MusicTrack) => void;
  removeFromUserTracks: (trackId: number) => void;
  togglePlayerVisibility: () => void;
}

// ============ INITIAL STATE ============

const initialState: MusicState = {
  currentTrack: null,
  currentTrackIndex: -1,
  availableTracks: [],
  userSelectedTracks: [],
  isPlaying: false,
  isPaused: false,
  isMuted: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  showPlayer: false,
};

// Reducer

function musicReducer(state: MusicState, action: MusicAction): MusicState {
  switch (action.type) {
    case 'SET_TRACKS':
      return {
        ...state,
        availableTracks: action.payload.available,
        userSelectedTracks: action.payload.userSelected,
      };

    case 'SET_CURRENT_TRACK':
      const trackIndex = state.userSelectedTracks.findIndex(t => t.id === action.payload.id);
      return {
        ...state,
        currentTrack: action.payload,
        currentTrackIndex: trackIndex,
        error: null,
        // Auto-start playing when a track is set
        isPlaying: true,
        isPaused: false,
      };

    case 'SET_CURRENT_TRACK_INDEX':
      const track = state.userSelectedTracks[action.payload];
      return {
        ...state,
        currentTrackIndex: action.payload,
        currentTrack: track || null,
      };

    case 'PLAY':
      return {
        ...state,
        isPlaying: true,
        isPaused: false,
        error: null,
      };

    case 'PAUSE':
      return {
        ...state,
        isPlaying: false,
        isPaused: true,
      };

    case 'STOP':
      return {
        ...state,
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
      };

    case 'NEXT_TRACK':
      const nextIndex = (state.currentTrackIndex + 1) % state.userSelectedTracks.length;
      const nextTrack = state.userSelectedTracks[nextIndex];
      return {
        ...state,
        currentTrackIndex: nextIndex,
        currentTrack: nextTrack || null,
        currentTime: 0,
      };

    case 'PREVIOUS_TRACK':
      const prevIndex = state.currentTrackIndex <= 0 
        ? state.userSelectedTracks.length - 1 
        : state.currentTrackIndex - 1;
      const prevTrack = state.userSelectedTracks[prevIndex];
      return {
        ...state,
        currentTrackIndex: prevIndex,
        currentTrack: prevTrack || null,
        currentTime: 0,
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: Math.max(0, Math.min(1, action.payload)),
        isMuted: action.payload === 0,
      };

    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted,
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload,
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isPlaying: false,
      };

    case 'TOGGLE_PLAYER_VISIBILITY':
      return {
        ...state,
        showPlayer: !state.showPlayer,
      };

    case 'ADD_USER_TRACK':
      const newUserTracks = [...state.userSelectedTracks, action.payload];
      return {
        ...state,
        userSelectedTracks: newUserTracks,
      };

    case 'REMOVE_USER_TRACK':
      const filteredTracks = state.userSelectedTracks.filter(t => t.id !== action.payload);
      const newIndex = state.currentTrackIndex >= filteredTracks.length 
        ? Math.max(0, filteredTracks.length - 1)
        : state.currentTrackIndex;
      return {
        ...state,
        userSelectedTracks: filteredTracks,
        currentTrackIndex: newIndex,
        currentTrack: filteredTracks[newIndex] || null,
      };

    default:
      return state;
  }
}

// Context

const MusicContext = createContext<MusicContextType | null>(null);

// Provider

interface MusicProviderProps {
  children: React.ReactNode;
}

export function MusicProvider({ children }: MusicProviderProps) {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Handler

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const handlePlay = () => {
      dispatch({ type: 'PLAY' });
    };

    const handlePause = () => {
      dispatch({ type: 'PAUSE' });
    };

    const handleEnded = () => {
      // Auto-advance to next track (looping)
      dispatch({ type: 'NEXT_TRACK' });
      // Auto-play the next track
      if (audioRef.current) {
        audioRef.current.play().catch(error => {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to play next track' });
        });
      }
    };

    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };

    const handleDurationChange = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    };

    const handleError = () => {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Audio Control Effects

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

    useEffect(() => {
        if (!audioRef.current || !state.currentTrack) return;

        const audio = audioRef.current;
        const fileUrl = state.currentTrack.file_url;

        // Validate URL exists
        if (!fileUrl || typeof fileUrl !== 'string' || fileUrl.trim() === '') {
            dispatch({ type: 'SET_ERROR', payload: 'Invalid audio URL' });
            return;
        }

        // Reset previous src to avoid conflicts
        audio.pause();
        audio.src = '';

        // Set new source
        audio.src = fileUrl;
        audio.load();
    }, [state.currentTrack]);

  // Actions

  const playTrack = (track: MusicTrack) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
      });
    }
  };

  // Auto-load and select all available tracks on mount
  useEffect(() => {
    const loadAndSelectAllTracks = async () => {
      try {
        // This will be handled by the component that uses this context
        // The component will call setUserMusicTracks with all available tracks
      } catch (error) {
        console.error('Failed to load available tracks:', error);
      }
    };
    
    loadAndSelectAllTracks();
  }, []);

  const playNext = () => {
    dispatch({ type: 'NEXT_TRACK' });
    if (audioRef.current && state.userSelectedTracks.length > 0) {
      audioRef.current.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
      });
    }
  };

  const playPrevious = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
    if (audioRef.current && state.userSelectedTracks.length > 0) {
      audioRef.current.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
      });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to play audio' });
      });
    }
  };

  const setVolume = (volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const addToUserTracks = (track: MusicTrack) => {
    dispatch({ type: 'ADD_USER_TRACK', payload: track });
  };

  const removeFromUserTracks = (trackId: number) => {
    dispatch({ type: 'REMOVE_USER_TRACK', payload: trackId });
  };

  const togglePlayerVisibility = () => {
    dispatch({ type: 'TOGGLE_PLAYER_VISIBILITY' });
  };

  // Context Value

  const contextValue: MusicContextType = {
    state,
    dispatch,
    playTrack,
    playNext,
    playPrevious,
    togglePlayPause,
    setVolume,
    toggleMute,
    addToUserTracks,
    removeFromUserTracks,
    togglePlayerVisibility,
  };

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

// Hook

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

