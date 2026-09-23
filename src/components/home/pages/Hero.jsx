import Link from 'next/link'
import React from 'react'

const Hero = () => {
  return (
    <div className='w-full  flex flex-col-reverse md:flex-row items-center justify-center gap-3 py-20 bg-primary'>
      <div className='flex flex-col gap-4 w-full'>
        <div className='flex flex-col text-4xl md:text-5xl lg:text-7xl'>
          <p>Build your identity</p>
          <p>with the best</p>
          <p>management system</p>
        </div>
        <p className='text-lg md:text-xl lg:text-2xl'>Easy build, modify and upgrade website, pages and bars beyond your dream.</p>
        <Link href={'/packages'} className=' bg-secondary px-4 p-1 rounded-sm text-light max-w-28'>Get started</Link>
      </div>

      <div className='w-full h-auto'>

      </div>

    </div>
  )
}

export default Hero