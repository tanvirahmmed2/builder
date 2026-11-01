'use client';
import React, { Suspense } from 'react';
import StoreCatalogPage from '../products/page';

export default function StoreSearchPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-slate-500">Loading search...</div>}>
      <StoreCatalogPage />
    </Suspense>
  );
}

