"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

export function CaptionFetcherModal() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[] | null>(null);

  const handleFetchTranscript = async () => {
    setIsLoading(true);
    setError(null);
    setTranscript(null);
    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      // Check if transcript exists in Supabase
      const { data, error } = await supabase
        .from('video_transcripts')
        .select('transcript')
        .eq('video_id', videoId)
        .single();

      if (data) {
        setTranscript(data.transcript);
      } else {
        // If not in Supabase, fetch from Python backend
        const response = await fetch(`http://localhost:8000/api/transcript/${videoId}`);
        const fetchedData = await response.json();

        if (!response.ok) {
          throw new Error(fetchedData.detail || "Failed to fetch transcript");
        }

        setTranscript(fetchedData.transcript);
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();

    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    }
    return `${mm}:${ss.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Fetch Video Transcript</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fetch Video Transcript</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter YouTube video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <Button onClick={handleFetchTranscript} disabled={isLoading}>
            {isLoading ? "Fetching..." : "Fetch Transcript"}
          </Button>
          {error && <p className="text-red-500">{error}</p>}
          {transcript && (
            <div className="max-h-60 overflow-y-auto">
              {transcript.map((entry, index) => (
                <div key={index} className="mb-2">
                  <span className="font-bold">{formatTime(entry.start)}</span>: {entry.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}