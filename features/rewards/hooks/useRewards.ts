"use client";

import { useState, useEffect, useCallback } from "react";
import { RewardsResumen } from "../types/rewards.types";
import { getRewardsAction } from "../actions/get-rewards.action";

export function useRewards() {
  const [rewards, setRewards] = useState<RewardsResumen | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getRewardsAction();
      if (result?.success && result.rewards) {
        setRewards(result.rewards);
      }
    } catch (error) {
      console.error("Failed to fetch rewards", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return { rewards, loading, refresh: fetchRewards };
}
