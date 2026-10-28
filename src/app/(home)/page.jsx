import About from '@/components/saas/home/pages/About'
import Ecommerce from '@/components/saas/home/pages/E-commerce'
import Restaurant from '@/components/saas/home/pages/Restaurant'
import Hero from '@/components/saas/home/pages/Hero'
import LearnMore from '@/components/saas/home/pages/LearnMore'
import Portfolio from '@/components/saas/home/pages/Portfolio'
import Reviews from '@/components/saas/home/pages/Reviews'
import SystemManagement from '@/components/saas/home/pages/SystemManagement'
import Themes from '@/components/saas/home/pages/Themes'
import React from 'react'

const page = () => {
  return (
    <div className='w-full flex flex-col'>
      <Hero/>
      <About/>
      <LearnMore/>
      <Ecommerce/>
      <Restaurant/>
      <Portfolio/>
      <SystemManagement/>
      <Themes/>
      <Reviews/>
    </div>
  )
}

export default page