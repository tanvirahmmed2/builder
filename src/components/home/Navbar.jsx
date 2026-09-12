'use client';

import Link from 'next/link';
import { ShieldCheckIcon, ExternalLinkIcon } from '@/components/ui/Icons';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu } from 'react-icons/bi';

export default function HomeNavbar() {

  return (
    <nav className="w-full flex flex-row items-center justify-between bg-white px-4 shadow lg:px-8 h-14">
      <div className='w-auto flex flex-row items-center justify-center gap-2'>
        <button className='text-2xl md:hidden'><BiMenu /></button>
        <Link href={'/'} className='text-xl font-semibold'>{SITE_NAME}</Link>
      </div>

      <div className='w-auto hidden md:flex flex-row items-center justify-center gap-2'>
        <Link href={'/themes'} className='font-semibold hover:text-primary px-4'>Themes</Link>
        <Link href={'/packages'} className='font-semibold hover:text-primary px-4'>Packages</Link>
        <Link href={'/contact'} className='font-semibold hover:text-primary px-4'>Contact</Link>
        <Link href={'/about'} className='font-semibold hover:text-primary px-4'>About</Link>
      </div>
      <div>

        <Link href={'/creator/login'} className='border border-secondary text-secondary px-4 md:px-4 p-1 rounded-full font-semibold'>Start Now</Link>

      </div>
      

    </nav>
  );
}
