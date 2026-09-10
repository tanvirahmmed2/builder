import { COMPANY_NAME, COMPANY_URL, SITE_ADDRESS, SITE_CONTACT, SITE_MAIL, SITE_NAME } from '@/lib/db/secret'
import Link from 'next/link'
import React from 'react'

const Footer = () => {
  return (
    <div className='w-full bg-primary p-4 md:p-8 py-20 flex flex-col items-center justify-center gap-8 text-light'>
      <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='w-full flex flex-col gap-1'>
          <p className='text-3xl md:text-6xl font-semibold'>{SITE_NAME}</p>
          <p>Build your portfolio on web</p>
          <p>The wat you want</p>
          <p>The colour your fans love</p>
        </div>
        <div>
          <p className='text-xl font-semibold opacity-75'>Links</p>
          <div className='w-full flex flex-col gap-1'>
            <Link href={'/creator/login'}>Login</Link>
            <Link href={'https://youtube.com'}>How to build</Link>
            <Link href={'/contact'}>Contact</Link>
            <Link href={'/report'}>Report</Link>
          </div>
        </div>
        <div>
          <p className='text-xl font-semibold opacity-75'>Address</p>
          <div className='w-full flex flex-col gap-1'>
            <p>{SITE_MAIL}</p>
            <p>{SITE_CONTACT}</p>
            <p>{SITE_ADDRESS}</p>
          </div>
        </div>

      </div>
      <div className='w-full flex flex-col md:flex-row items-center justify-between gap-4 text-light font-sans'>
        <p>2026 {SITE_NAME} | Build Your Identity on Web</p>
        <p>A Product of <Link href={`${COMPANY_URL}`}>{COMPANY_NAME}</Link></p>

      </div>


    </div>
  )
}

export default Footer