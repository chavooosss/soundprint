import { useState, useCallback } from "react";
import { analysisService } from "../services/api";
import type { CharacterProfile } from "../types";

interface AnalysisState {
  profile: CharacterProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAnalysis = () => {
  const [state, setState] = useState<AnalysisState>({
    profile: null,
    loading: false,
    error: null,
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

  return { ...state, fetchProfile };
};
