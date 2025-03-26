// Type definitions for YouTube iframe API
interface YT {
  Player: {
    new (
      elementId: string,
      options: {
        events?: {
          onReady?: (event: { target: YTPlayer }) => void;
          onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          onPlaybackQualityChange?: (event: { data: string; target: YTPlayer }) => void;
          onPlaybackRateChange?: (event: { data: number; target: YTPlayer }) => void;
          onError?: (event: { data: number; target: YTPlayer }) => void;
          onApiChange?: (event: { target: YTPlayer }) => void;
        };
        height?: number | string;
        width?: number | string;
        videoId?: string;
        playerVars?: {
          autoplay?: 0 | 1;
          cc_load_policy?: 0 | 1;
          color?: 'red' | 'white';
          controls?: 0 | 1 | 2;
          disablekb?: 0 | 1;
          enablejsapi?: 0 | 1;
          end?: number;
          fs?: 0 | 1;
          hl?: string;
          iv_load_policy?: 1 | 3;
          list?: string;
          listType?: 'playlist' | 'search' | 'user_uploads';
          loop?: 0 | 1;
          modestbranding?: 0 | 1;
          origin?: string;
          playlist?: string;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          start?: number;
          mute?: 0 | 1;
        };
      }
    ): YTPlayer;
  };
  
  // Get a player instance by element ID
  get(elementId: string): YTPlayer | undefined;
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  clearVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;
  setSize(width: number, height: number): void;
  getPlaybackRate(): number;
  setPlaybackRate(suggestedRate: number): void;
  getAvailablePlaybackRates(): number[];
  setLoop(loopPlaylists: boolean): void;
  setShuffle(shufflePlaylist: boolean): void;
  getVideoLoadedFraction(): number;
  getPlayerState(): number;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoUrl(): string;
  getVideoEmbedCode(): string;
  getPlaylist(): string[];
  getPlaylistIndex(): number;
  addEventListener(event: string, listener: (event: any) => void): void;
  removeEventListener(event: string, listener: (event: any) => void): void;
  getIframe(): HTMLIFrameElement;
  destroy(): void;
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}
