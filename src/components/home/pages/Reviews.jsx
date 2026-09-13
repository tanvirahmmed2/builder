'use client'
import { Context } from '@/components/helper/Context'
import React, { useContext } from 'react'
import Review from '../cards/Review'

const Reviews = () => {
    const {reviews}=useContext(Context)
  return (
    <div className='w-full flex flex-col items-center justify-center gap-16 rounded-2xl py-20 '>
        <p className='text-xl md:text-2xl lg:text-3xl text-center'>What our clients talking about us</p>
        {
            reviews!==null && <div className='w-full flex flex-row gap-4'>
                {
                    reviews.map((r)=>(
                        <Review key={r.id} review={r}/>
                    ))
                }
            </div>
        }
    </div>
  )
}

export default Reviews