'use client';

import React, { useState, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Music,
    X,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusic } from './music-context';
import { MusicTrack } from '@/src/db/schema';
import { QuickAddTracks } from './quick-add-tracks';
import { AutoMusicLoader } from './auto-music-loader';

interface MusicPlayerProps {
    className?: string;
    userId?: number;
}

// Format duration helper function.
// Note: Music UI needs mm:ss timestamps, so we keep a local formatter instead of the course helper.
const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds || typeof seconds !== 'number' || isNaN(seconds)) {
        return '--:--';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function MusicPlayer({ className = '', userId }: MusicPlayerProps) {
    const { state, playTrack, playNext, playPrevious, togglePlayPause, setVolume, toggleMute, togglePlayerVisibility } = useMusic();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showTrackList, setShowTrackList] = useState(false);

    // Format time helper
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle volume change
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    // Handle progress bar click
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!state.duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * state.duration;

        // This would need to be implemented in the context to actually seek
        console.log('Seek to:', newTime);
    };

    // Auto-expand when playing
    useEffect(() => {
        if (state.isPlaying) {
            setIsExpanded(true);
        }
    }, [state.isPlaying]);

    if (!state.showPlayer) {
        return (
            <Button
                onClick={togglePlayerVisibility}
                variant="outline"
                size="icon"
                className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
            >
                <Music className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <>
            {/* Auto-load music tracks when component mounts */}
            {userId && <AutoMusicLoader userId={userId} />}

            <Card className={`fixed bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 ${
                isExpanded ? 'w-80' : 'w-64'
            } ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                        <Music className="h-4 w-4" />
                        <span className="text-sm font-medium">Background Music</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="h-6 w-6"
                        >
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlayerVisibility}
                            className="h-6 w-6"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Current Track Info */}
                {state.currentTrack && (
                    <div className="p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium truncate">{state.currentTrack.title}</h4>
                                <p className="text-xs text-muted-foreground truncate">{state.currentTrack.artist}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <div
                                className="w-full h-2 bg-muted rounded-full cursor-pointer"
                                onClick={handleProgressClick}
                            >
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{
                                        width: state.duration ? `${(state.currentTime / state.duration) * 100}%` : '0%'
                                    }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>{formatTime(state.currentTime)}</span>
                                <span>{formatTime(state.duration)}</span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-2 mt-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={playPrevious}
                                disabled={state.userSelectedTracks.length <= 1}
                                className="h-8 w-8"
                            >
                                <SkipBack className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="default"
                                size="icon"
                                onClick={togglePlayPause}
                                disabled={state.isLoading || !state.currentTrack}
                                className="h-10 w-10"
                            >
                                {state.isLoading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : state.isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={playNext}
                                disabled={state.userSelectedTracks.length <= 1}
                                className="h-8 w-8"
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Volume Control */}
                        {isExpanded && (
                            <div className="flex items-center gap-2 mt-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="h-6 w-6"
                                >
                                    {state.isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                                </Button>
                                <div className="flex-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={state.isMuted ? 0 : state.volume}
                                        onChange={handleVolumeChange}
                                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-8">
                {Math.round((state.isMuted ? 0 : state.volume) * 100)}%
              </span>
                            </div>
                        )}

                        {/* Error Display */}
                        {state.error && (
                            <div className="mt-2 p-2 bg-destructive/10 text-destructive text-xs rounded">
                                {state.error}
                            </div>
                        )}
                    </div>
                )}

                {/* Track List */}
                {isExpanded && (
                    <div className="border-t">
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Your Tracks</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTrackList(!showTrackList)}
                                    className="h-6 text-xs"
                                >
                                    {showTrackList ? 'Hide' : 'Show'} All
                                </Button>
                            </div>

                            {state.userSelectedTracks.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-xs text-muted-foreground mb-3">
                                        No tracks selected. Add some music to get started!
                                    </p>
                                    {userId && (
                                        <QuickAddTracks
                                            userId={userId}
                                            onTracksAdded={(tracks) => {
                                                // Refresh the music context with new tracks
                                                tracks.forEach(track => {
                                                    // This would need to be implemented in the context
                                                    console.log('Track added:', track.title);
                                                });
                                            }}
                                        />
                                    )}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            window.location.href = '/settings';
                                        }}
                                        className="text-xs mt-2"
                                    >
                                        Go to Settings
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {state.userSelectedTracks.map((track, index) => (
                                        <div
                                            key={track.id}
                                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                                                index === state.currentTrackIndex ? 'bg-primary/10' : ''
                                            }`}
                                            onClick={() => playTrack(track)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">{track.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                                            </div>
                                            {index === state.currentTrackIndex && state.isPlaying && (
                                                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}

// Track Selection Component
interface TrackSelectionProps {
    availableTracks: MusicTrack[];
    selectedTracks: MusicTrack[];
    onTrackSelect: (track: MusicTrack) => void;
    onTrackDeselect: (trackId: number) => void;
    className?: string;
}

export function TrackSelection({
                                   availableTracks,
                                   selectedTracks,
                                   onTrackSelect,
                                   onTrackDeselect,
                                   className = ''
                               }: TrackSelectionProps) {
    const isSelected = (trackId: number) => selectedTracks.some(t => t.id === trackId);

    return (
        <div className={`space-y-4 ${className}`}>
            <h3 className="text-lg font-semibold">Select Background Music</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableTracks.map((track) => (
                    <Card
                        key={track.id}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                            isSelected(track.id) ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => isSelected(track.id) ? onTrackDeselect(track.id) : onTrackSelect(track)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{track.title || 'Untitled'}</h4>
                                <p className="text-sm text-muted-foreground truncate">{track.artist || 'Unknown Artist'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDuration(track.duration_sec)}
                                </p>
                            </div>
                            <div className="ml-2">
                                {isSelected(track.id) ? (
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                ) : (
                                    <div className="h-2 w-2 border border-muted-foreground rounded-full" />
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
