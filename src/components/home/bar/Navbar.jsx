'use client';

import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu } from 'react-icons/bi';
import { useContext } from 'react';
import { Context } from '@/components/helper/Context';

export default function HomeNavbar() {

  const {apps}=useContext(Context)

  return (
    <nav className="w-full flex flex-row items-center justify-between bg-white px-4 shadow lg:px-8 h-14">
      <div className='w-auto flex flex-row items-center justify-center gap-2'>
        <button className='text-2xl md:hidden'><BiMenu /></button>
        <Link href={'/'} className='text-xl font-semibold h-14'>{SITE_NAME}</Link>
      </div>

      <div className='w-auto hidden md:flex flex-row items-center justify-center gap-2 relative h-14'>
        <Link href={'/themes'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center'>Themes</Link>
        <div className=' relative h-14 group'>
          <Link href={'/apps'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center'>Apps</Link>
          {
            apps!==null && <div className='absolute hidden group-hover:flex flex-col gap-1 top-14 bg-primary text-light w-full min-w-100'>
              {
                apps.map((a)=>(
                  <Link key={a.id} href={`${a.path}`}>{a.title}</Link>
                ))
              }
            </div>
          }
        </div>
        <Link href={'/packages'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center'>Packages</Link>
        <Link href={'/contact'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center'>Contact</Link>
        <Link href={'/about'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center'>About</Link>
      </div>
      <div>

        <Link href={'/creator/login'} className='border border-secondary text-secondary px-4 md:px-4 p-1 rounded-full font-semibold'>Start Now</Link>

      </div>
      

    </nav>
  );
}
