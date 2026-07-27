import { useUser } from '@app/hooks/useUser';
import type { RequestResultsResponse } from '@server/interfaces/api/requestInterfaces';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const useReadyRequestCount = () => {
  const { user } = useUser();
  const router = useRouter();
  const [seenAt, setSeenAt] = useState(0);
  const { data } = useSWR<RequestResultsResponse>(
    user
      ? `/api/v1/request?filter=available&take=50&skip=0&requestedBy=${user.id}`
      : null,
    { refreshInterval: 60000 }
  );

  useEffect(() => {
    const stored = Number(
      window.localStorage.getItem('xmage-ready-requests-seen-at') ?? 0
    );
    setSeenAt(stored);
  }, []);

  useEffect(() => {
    if (router.pathname.startsWith('/requests') && data) {
      const now = Date.now();
      window.localStorage.setItem('xmage-ready-requests-seen-at', String(now));
      setSeenAt(now);
    }
  }, [data, router.pathname]);

  return (data?.results ?? []).filter(
    (request) => new Date(request.updatedAt).getTime() > seenAt
  ).length;
};

export default useReadyRequestCount;
