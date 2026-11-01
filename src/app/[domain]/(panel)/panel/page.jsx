'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PanelIndexRedirect() {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';

  useEffect(() => {
    router.replace(`/${domain}/panel/control/overview`);
  }, [domain, router]);

  return null;
}

