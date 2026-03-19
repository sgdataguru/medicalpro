import { useState, useEffect } from 'react';
import { fetchNotificationCounts } from '@/lib/recommendations/recommendations.service';

export function useRecommendationNotifications() {
  const [counts, setCounts] = useState({
    newCount: 0,
    urgentCount: 0,
    deferredExpiringCount: 0,
    outcomesReadyCount: 0,
  });

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const result = await fetchNotificationCounts();
        if (mounted) setCounts(result);
      } catch {
        /* ignore polling errors */
      }
    };

    poll();
    const interval = setInterval(poll, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return counts;
}
