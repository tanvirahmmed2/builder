'use client';

import Link from 'next/link';
import { SITE_NAME } from '@/lib/db/secret';
import { BiMenu } from 'react-icons/bi';
import { useContext, useState } from 'react';
import { Context } from '@/components/helper/Context';
import Sidebar from './Sidebar';

export default function HomeNavbar() {
  const { apps } = useContext(Context);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex flex-row items-center justify-between bg-white px-4 shadow-sm lg:px-8 h-14 sticky top-0 z-40">
        <div className='w-auto flex flex-row items-center justify-center gap-2'>
          <button 
            type="button"
            onClick={() => setSidebarOpen(true)}
            className='text-2xl md:hidden flex items-center justify-center p-1 text-slate-700 hover:text-primary transition-colors cursor-pointer' 
            aria-label="Toggle menu"
          >
            <BiMenu />
          </button>
          <Link href={'/'} className='text-xl font-semibold h-14 flex items-center'>{SITE_NAME}</Link>
        </div>

        <div className='w-auto hidden md:flex flex-row items-center justify-center gap-2 relative h-14'>
          <Link href={'/themes'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center transition-colors'>Themes</Link>
          <div className=' relative h-14 group'>
            <Link href={'/apps'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center transition-colors'>Apps</Link>
            {
              apps && <div className='absolute left-0 top-14 hidden group-hover:flex flex-col py-2 bg-primary text-light rounded-b-md shadow-lg w-48 z-50'>
                {
                  apps.map((a)=>(
                    <Link key={a.id} href={`${a.path}`} className='px-4 py-2 hover:bg-black/10 transition-colors text-sm font-medium'>{a.title}</Link>
                  ))
                }
              </div>
            }
          </div>
          <Link href={'/packages'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center transition-colors'>Packages</Link>
          <Link href={'/contact'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center transition-colors'>Contact</Link>
          <Link href={'/about'} className='font-semibold hover:text-primary px-4 h-14 flex items-center justify-center transition-colors'>About</Link>
        </div>
        <div>
          <Link href={'/creator/login'} className='inline-flex items-center justify-center border border-secondary text-secondary hover:bg-secondary hover:text-light px-4 py-1.5 rounded-full font-semibold transition-colors duration-200 text-sm md:text-base'>Start Now</Link>
        </div>
      </nav>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
