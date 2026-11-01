'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UserIndexRedirect() {
  const params = useParams();
  const router = useRouter();
  const domain = params?.domain || '';

  useEffect(() => {
    router.replace(`/${domain}/user/control`);
  }, [domain, router]);

  return null;
}

