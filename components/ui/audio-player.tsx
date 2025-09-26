'use client';

import { useState, useRef, useCallback } from 'react';
import { Play, Square, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  text: string;
  persona: string;
  gender?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AudioPlayer({ 
  text, 
  persona, 
  gender, 
  className = '',
  size = 'md'
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handlePlayStop = useCallback(async () => {
    if (isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      return;
    }

    // Start new audio
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          persona,
          gender
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      // Create audio element and play
      const audio = new Audio(`data:${data.format};base64,${data.audio}`);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsLoading(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, text, persona, gender]);

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="animate-spin" size={iconSizes[size]} />;
    }
    if (isPlaying) {
      return <Square size={iconSizes[size]} />;
    }
    return <Play size={iconSizes[size]} />;
  };

  const getButtonLabel = () => {
    if (isLoading) return 'Generating speech...';
    if (isPlaying) return 'Stop audio';
    return 'Play audio';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handlePlayStop}
        disabled={isLoading}
        variant="outline"
        size="icon"
        className={`${sizeClasses[size]} hover:bg-primary/10`}
        title={getButtonLabel()}
      >
        {getButtonIcon()}
      </Button>
      
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <Volume2 size={16} />
          <span className="text-xs">Audio unavailable</span>
        </div>
      )}
    </div>
  );
}
