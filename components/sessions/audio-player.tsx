"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  Download,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface AudioPlayerProps {
  fileUrl: string;
  fileName: string;
}

export function AudioPlayer({ fileUrl, fileName }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stop polling when duration is found
  useEffect(() => {
    if (duration > 0 && durationCheckIntervalRef.current) {
      console.log("Duration found, stopping polling");
      clearInterval(durationCheckIntervalRef.current);
      durationCheckIntervalRef.current = null;
    }
  }, [duration]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    setIsLoading(true);
    setError(null);

    audio.addEventListener("loadedmetadata", () => {
      console.log("Metadata loaded, duration:", audio.duration, "seekable:", audio.seekable.length);
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration from loadedmetadata:", audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable in loadedmetadata:", seekableEnd);
            setDuration(seekableEnd);
            setIsLoading(false);
          }
        } catch (e) {
          console.log("Error reading seekable in loadedmetadata:", e);
        }
      } else {
        // WebM files might not have duration in metadata, wait for other events
        console.log("Duration not available in metadata, will try other events");
      }
    });

    // Handle duration change (important for WebM files)
    audio.addEventListener("durationchange", () => {
      console.log("Duration changed event, duration:", audio.duration);
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration from durationchange:", audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable in durationchange:", seekableEnd);
            setDuration(seekableEnd);
            setIsLoading(false);
          }
        } catch (e) {
          console.log("Error reading seekable in durationchange:", e);
        }
      }
    });

    let durationSet = false;
    audio.addEventListener("timeupdate", () => {
      if (isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
      }
      
      // Continuously try to get duration for WebM files (but only log once)
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        if (!durationSet) {
          console.log("Setting duration from timeupdate:", audio.duration);
          durationSet = true;
        }
        setDuration(audio.duration);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            if (!durationSet) {
              console.log("Setting duration from seekable in timeupdate:", seekableEnd);
              durationSet = true;
            }
            setDuration(seekableEnd);
          }
        } catch (e) {
          // Ignore errors
        }
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    let hasCanPlay = false;
    let hasLoadStart = false;
    
    audio.addEventListener("loadstart", () => {
      hasLoadStart = true;
      console.log("Audio load started");
    });
    
    const errorHandler = () => {
      // WebM files often fire false error events - be very aggressive about ignoring them
      setTimeout(() => {
        // If canplay event has fired, always ignore errors
        if (hasCanPlay) {
          console.log("Error event suppressed - audio already can play");
          return;
        }
        
        // If loading has started, likely a false error
        if (hasLoadStart) {
          console.log("Error event suppressed - audio is loading");
          return;
        }
        
        // Check if audio is actually loading or can play
        const isLoading = audio.networkState === audio.NETWORK_LOADING || 
                         audio.networkState === audio.NETWORK_IDLE;
        const hasData = audio.readyState >= audio.HAVE_CURRENT_DATA;
        const hasMetadata = audio.readyState >= audio.HAVE_METADATA;
        
        // If audio has any data or is loading, ignore the error
        if (isLoading || hasData || hasMetadata) {
          console.log("Error event suppressed - audio is loading/ready", {
            networkState: audio.networkState,
            readyState: audio.readyState
          });
          return;
        }
        
        const audioError = audio.error;
        
        // No error object means false alarm
        if (!audioError) {
          console.log("Error event suppressed - no actual error object");
          return;
        }
        
        // Even with error object, if we have buffered data, ignore it
        if (audio.buffered.length > 0) {
          console.log("Error event suppressed - audio has buffered data");
          return;
        }
        
        // Only show error if it's a real blocking error after multiple checks
        console.error("Real audio error detected:", {
          code: audioError.code,
          message: audioError.message,
          readyState: audio.readyState,
          networkState: audio.networkState,
          url: fileUrl
        });
        
        let errorMessage = "Failed to load audio";
        
        switch (audioError.code) {
          case audioError.MEDIA_ERR_ABORTED:
            errorMessage = "Audio loading was aborted";
            break;
          case audioError.MEDIA_ERR_NETWORK:
            errorMessage = "Network error while loading audio";
            break;
          case audioError.MEDIA_ERR_DECODE:
            errorMessage = "Audio format not supported or file is corrupted";
            break;
          case audioError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "Audio format not supported by your browser";
            break;
          default:
            errorMessage = `Audio error: ${audioError.message || "Unknown error"}`;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }, 1000); // Long timeout to give WebM files time to initialize
    };
    
    audio.addEventListener("error", errorHandler);

    audio.addEventListener("canplay", () => {
      console.log("Audio can play, duration:", audio.duration, "seekable:", audio.seekable.length);
      hasCanPlay = true; // Mark that audio can play
      setCanPlay(true);
      setIsLoading(false);
      setError(null);
      
      // Aggressively try to get duration from all sources
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration from audio.duration:", audio.duration);
        setDuration(audio.duration);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          console.log("Seekable end:", seekableEnd);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable:", seekableEnd);
            setDuration(seekableEnd);
          }
        } catch (e) {
          console.log("Error reading seekable:", e);
        }
      }
      
      // Start polling for duration if not yet available
      if (durationCheckIntervalRef.current) {
        clearInterval(durationCheckIntervalRef.current);
      }
      
      let pollCount = 0;
      const maxPolls = 50; // Stop after 10 seconds (50 * 200ms)
      
      durationCheckIntervalRef.current = setInterval(() => {
        pollCount++;
        
        if (pollCount > maxPolls) {
          console.log("Polling: Max attempts reached, stopping");
          if (durationCheckIntervalRef.current) {
            clearInterval(durationCheckIntervalRef.current);
            durationCheckIntervalRef.current = null;
          }
          return;
        }
        
        if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
          console.log("Polling: Found duration from audio.duration:", audio.duration);
          setDuration(audio.duration);
          if (durationCheckIntervalRef.current) {
            clearInterval(durationCheckIntervalRef.current);
            durationCheckIntervalRef.current = null;
          }
        } else if (audio.seekable.length > 0) {
          try {
            const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
            if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
              console.log("Polling: Found duration from seekable:", seekableEnd);
              setDuration(seekableEnd);
              if (durationCheckIntervalRef.current) {
                clearInterval(durationCheckIntervalRef.current);
                durationCheckIntervalRef.current = null;
              }
            }
          } catch (e) {
            // Ignore errors during polling
          }
        }
      }, 200); // Check every 200ms
    });

    audio.addEventListener("loadeddata", () => {
      console.log("Audio data loaded, duration:", audio.duration, "seekable:", audio.seekable.length);
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration from loadeddata:", audio.duration);
        setDuration(audio.duration);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable in loadeddata:", seekableEnd);
            setDuration(seekableEnd);
          }
        } catch (e) {
          console.log("Error reading seekable in loadeddata:", e);
        }
      }
    });

    let progressDurationSet = false;
    audio.addEventListener("progress", () => {
      // Try to get duration during buffering (important for WebM)
      if (progressDurationSet) return;
      
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration from progress event:", audio.duration);
        setDuration(audio.duration);
        progressDurationSet = true;
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable in progress:", seekableEnd);
            setDuration(seekableEnd);
            progressDurationSet = true;
          }
        } catch (e) {
          // Ignore seekable errors during progress
        }
      }
    });

    audio.addEventListener("playing", () => {
      setError(null);
      setIsLoading(false);
      setCanPlay(true);
      
      // Final attempt to get duration when playing
      if (isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity) {
        console.log("Setting duration while playing:", audio.duration);
        setDuration(audio.duration);
      } else if (audio.seekable.length > 0) {
        try {
          const seekableEnd = audio.seekable.end(audio.seekable.length - 1);
          if (isFinite(seekableEnd) && seekableEnd > 0 && seekableEnd !== Infinity) {
            console.log("Setting duration from seekable while playing:", seekableEnd);
            setDuration(seekableEnd);
          }
        } catch (e) {
          console.log("Error reading seekable while playing:", e);
        }
      }
    });

    // Set source after all event listeners are attached
    audio.src = fileUrl;
    audio.load();

    return () => {
      // Clear polling interval
      if (durationCheckIntervalRef.current) {
        clearInterval(durationCheckIntervalRef.current);
        durationCheckIntervalRef.current = null;
      }
      
      audio.pause();
      audio.src = "";
      audio.load();
    };
  }, [fileUrl]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setError(null); // Clear any previous errors on successful play
      } catch (err) {
        console.error("Play error:", err);
        setError("Failed to play audio");
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current || !isFinite(value[0])) return;
    
    const seekTime = value[0];
    const maxTime = duration > 0 ? duration : (audioRef.current.seekable.length > 0 ? audioRef.current.seekable.end(0) : 100);
    const clampedTime = Math.max(0, Math.min(seekTime, maxTime));
    
    console.log("Seeking to:", clampedTime, "from duration:", duration);
    audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.currentTime + 10,
      duration
    );
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      audioRef.current.currentTime - 10,
      0
    );
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) {
      return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.click();
  };

  return (
    <Card
      className="rounded-3xl border shadow-sm"
      style={{ borderColor: "rgba(120, 57, 238, 0.18)" }}
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Recording
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-4 text-center">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        )}
        
        {isLoading && !error && (
          <div className="rounded-xl bg-purple-50 p-4 text-center">
            <p className="text-sm text-purple-600">Loading audio...</p>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration > 0 ? duration : 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer [&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-purple-500"
            disabled={!canPlay || error !== null}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={skipBackward}
            disabled={!canPlay || error !== null}
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            className="rounded-full w-14 h-14 text-white"
            onClick={togglePlay}
            disabled={!canPlay || error !== null}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={skipForward}
            disabled={!canPlay || error !== null}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume & Speed */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="h-4 w-4 text-slate-500" />
            <Slider
              value={[volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-purple-500"
            />
          </div>

          <div className="flex gap-1">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "outline"}
                size="sm"
                className={`rounded-lg text-xs ${playbackRate === rate ? "text-white" : ""}`}
                onClick={() => handlePlaybackRateChange(rate)}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
