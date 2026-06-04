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
          const staticMap = new Map(ALL_COMPETITIONS.map(c => [c.id, c]));
          const staticUrlMap = new Map(ALL_COMPETITIONS.map(c => [c.url, c]));

          const mergedApi = data.hackathons.map((apiComp: Competition) => {
            const staticComp = staticMap.get(apiComp.id) || (apiComp.url ? staticUrlMap.get(apiComp.url) : null);
            if (staticComp) {
              return { 
                ...staticComp,
                ...apiComp, 
                // Keep static metadata that adapters might miss
                rarityScore: staticComp.rarityScore ?? apiComp.rarityScore,
                trustScore: staticComp.trustScore ?? apiComp.trustScore,
                tags: Array.from(new Set([...(staticComp.tags || []), ...(apiComp.tags || [])]))
              };
            }
            return apiComp;
          });

          const apiIds = new Set(data.hackathons.map((c: Competition) => c.id));
          const apiUrls = new Set(data.hackathons.map((c: Competition) => c.url).filter(Boolean));
          const uniqueStatic = ALL_COMPETITIONS.filter(c => !apiIds.has(c.id) && !(c.url && apiUrls.has(c.url)));

          setCompetitions([...uniqueStatic, ...mergedApi]);
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
      setError(err.message || 'Failed to refresh all sources');
    } finally {
      setIsRefreshing(false);
    }
  };

  return { competitions, loading, source, error, isRefreshing, handleRefresh };
}
