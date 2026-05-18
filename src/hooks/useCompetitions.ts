import { useEffect, useState } from 'react';
import { fetchCompetitions } from '@/lib/api';
import { ALL_COMPETITIONS } from '@/data';
import type { Competition } from '@/lib/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>(ALL_COMPETITIONS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'static'>('static');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchCompetitions()
      .then(data => {
        if (!active) return;
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
        if (!active) return;
        setSource('static');
        setError('Live API unavailable. Showing local backup data.');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { competitions, loading, source, error };
}
