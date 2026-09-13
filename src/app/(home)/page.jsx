import About from '@/components/home/pages/About'
import Hero from '@/components/home/pages/Hero'
import LearnMore from '@/components/home/pages/LearnMore'
import Reviews from '@/components/home/pages/Reviews'
import Themes from '@/components/home/pages/Themes'
import React from 'react'

const page = () => {
  return (
    <div className='w-full flex flex-col p-4 md:p-8'>
      <Hero/>
      <About/>
      <LearnMore/>
      <Themes/>
      <Reviews/>
    </div>
  )
}

export default page