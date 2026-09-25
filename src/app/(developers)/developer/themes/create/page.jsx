'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BiArrowBack, BiPalette } from 'react-icons/bi';
import ThemeForm from '@/components/developer/forms/ThemeForm';

export default function CreateThemePage() {
  const router = useRouter();

  const handleSuccess = (created) => {
    if (created?.slug) {
      router.push(`/developer/themes/${created.slug}`);
    } else {
      router.push('/developer/themes');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/developer" className="hover:text-secondary">Dashboard</Link>
            <span>/</span>
            <Link href="/developer/themes" className="hover:text-secondary">Themes</Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200">Create</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center text-xl">
              <BiPalette />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Register New Theme
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Add a new responsive template design to the creator marketplace and theme catalog.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/developer/themes"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer w-fit"
        >
          <BiArrowBack className="text-base" />
          <span>Back to Themes</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <ThemeForm
          onSuccess={handleSuccess}
          onCancel={() => router.push('/developer/themes')}
        />
      </div>
    </div>
  );
}
