'use client';

import { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<'youtube' | 'drive' | 'direct' | 'unsupported' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!videoUrl) {
      setEmbedUrl(null);
      setPlayerType(null);
      setLoading(false);
      return;
    }

    // 1. YouTube check
    const ytReg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = videoUrl.match(ytReg);
    if (ytMatch && ytMatch[2].length === 11) {
      setEmbedUrl(`https://www.youtube.com/embed/${ytMatch[2]}?autoplay=1&rel=0`);
      setPlayerType('youtube');
      return;
    }

    // 2. Google Drive check
    if (videoUrl.includes('drive.google.com')) {
      const driveMatch = videoUrl.match(/\/file\/d\/([^\/]+)/);
      if (driveMatch && driveMatch[1]) {
        setEmbedUrl(`https://drive.google.com/file/d/${driveMatch[1]}/preview`);
        setPlayerType('drive');
        return;
      }
    }

    // 3. Direct video check (mp4, webm, ogg)
    if (/\.(mp4|webm|ogg)($|\?)/i.test(videoUrl)) {
      setEmbedUrl(videoUrl);
      setPlayerType('direct');
      return;
    }

    // Fallback: Try displaying inside iframe
    setEmbedUrl(videoUrl);
    setPlayerType('unsupported');
  }, [videoUrl]);

  const handleLoad = () => {
    setLoading(false);
  };

  if (!videoUrl) {
    return (
      <div className="aspect-[16/9] w-full rounded-2xl bg-card border border-card-border flex flex-col items-center justify-center text-text-muted gap-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
          <Play className="w-8 h-8 fill-accent translate-x-[2px]" />
        </div>
        <p className="text-sm font-mono tracking-wide uppercase">Select a lesson to start learning</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black border border-card-border shadow-2xl group">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-text-muted gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <span className="text-xs font-mono tracking-widest uppercase">Buffering stream...</span>
        </div>
      )}

      {playerType === 'direct' ? (
        <video
          src={embedUrl || ''}
          controls
          autoPlay
          onLoadedData={handleLoad}
          className="w-full h-full object-contain"
        />
      ) : playerType === 'youtube' || playerType === 'drive' || playerType === 'unsupported' ? (
        <iframe
          src={embedUrl || ''}
          title="Course Video Player"
          onLoad={handleLoad}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-400 p-6 gap-3">
          <AlertCircle className="w-12 h-12" />
          <h4 className="font-bold">Playback Error</h4>
          <p className="text-xs text-text-muted text-center max-w-md">
            The video link format is not supported or could not be parsed correctly. URL: <span className="font-mono text-[10px] break-all">{videoUrl}</span>
          </p>
        </div>
      )}
    </div>
  );
}
