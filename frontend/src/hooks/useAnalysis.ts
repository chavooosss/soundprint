import { useState, useCallback } from "react";
import { analysisService } from "../services/api";
import type { CharacterProfile } from "../types";

interface AnalysisState {
  profile: CharacterProfile | null;
  loading: boolean;
  error: string | null;
  playlistUrl: string | null;
  creatingPlaylist: boolean;
}

export const useAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    profile: null,
    loading: false,
    error: null,
    playlistUrl: null,
    creatingPlaylist: false,
  });

  const fetchProfile = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data } = await analysisService.getProfile();
      setState((s) => ({ ...s, profile: data.profile, loading: false }));
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setState((s) => ({ ...s, loading: false, error: message }));
      return null;
    }
  }, []);

  const createStudyPlaylist = useCallback(
    async (seedTrackIds: string[], playlistName?: string) => {
      if (!state.profile) return;
      setState((s) => ({ ...s, creatingPlaylist: true }));
      try {
        const { data } = await analysisService.createStudyPlaylist({
          seedTrackIds,
          playlistParams: state.profile.studyPlaylistParams,
          playlistName,
        });
        setState((s) => ({
          ...s,
          creatingPlaylist: false,
          playlistUrl: data.playlist.external_urls.spotify,
        }));
        return data;
      } catch {
        setState((s) => ({ ...s, creatingPlaylist: false }));
      }
    },
    [state.profile]
  );

  return { ...state, fetchProfile, createStudyPlaylist };
};
