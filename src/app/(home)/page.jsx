import About from '@/components/marketing/pages/About'
import Hero from '@/components/marketing/pages/Hero'
import LearnMore from '@/components/marketing/pages/LearnMore'
import Reviews from '@/components/marketing/pages/Reviews'
import Themes from '@/components/marketing/pages/Themes'
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