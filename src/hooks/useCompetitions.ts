import { useEffect, useState, useCallback } from 'react';
import { fetchCompetitions, triggerRefresh } from '@/lib/api';
import { ALL_COMPETITIONS } from '@/data';
import type { Competition } from '@/lib/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>(ALL_COMPETITIONS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>('static');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    fetchCompetitions()
      .then(data => {
        if (Array.isArray(data.hackathons) && data.hackathons.length > 0) {
          setCompetitions(data.hackathons);
          setSource('api');
          setError(null);
          return;
        }

        setSource('static');
        setError('Live API returned no competitions. Showing local backup data.');
      })
      .catch(() => {
        setSource('static');
        setError('Live API unavailable. Showing local backup data.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await triggerRefresh();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to sync with sources');
    } finally {
      setIsRefreshing(false);
    }
  };

  return { competitions, loading, source, error, isRefreshing, handleRefresh };
}
