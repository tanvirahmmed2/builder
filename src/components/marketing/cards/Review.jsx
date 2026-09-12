import React from 'react'
import { BiUser } from 'react-icons/bi'

const Review = ({ review }) => {
    if (!review) null
    return (
        <div className='w-100 bg-light p-3 rounded-lg flex flex-col gap-4 shrink-0'>
            <p className='w-full min-h-40'>{review.comment}</p>
            <div className='w-full flex flex-row gap-3'>

                <p><BiUser /></p>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg font-semibold'>{review.name}</p>
                    <div className='flex flex-row items-center justify-between'>
                        <p>{review.country}</p>
                        <p>({review.rating})</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Review