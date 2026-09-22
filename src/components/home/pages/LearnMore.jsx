import Link from 'next/link'
import React from 'react'
import { CgIfDesign } from 'react-icons/cg'
import { DiDatabase } from 'react-icons/di'

const LearnMore = () => {
    return (
        <div className='w-full flex flex-col items-center justify-center gap-16 rounded-3xl py-20 px-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs transition-colors'>
            <div className='w-full flex flex-col items-center justify-center gap-6 max-w-6xl mx-auto'>
                <p className='text-2xl md:text-4xl lg:text-5xl text-center'>Drag & drop tool to build page instantly with live preview</p>
                <div className='flex flex-col w-full items-center justify-center gap-4'>
                    <div className='w-full flex flex-col md:flex-row items-center justify-center gap-4'>
                        <div className='w-full'>
                            <p className='text-lg md:text-xl font-semibold'>Design and modify everything</p>
                            <p>Make you webite with full control</p>
                        </div>
                        <div className='w-full'>
                            <p className='text-lg md:text-xl font-semibold'>Explore our enriched pre-built library</p>
                            <p>Boost your building experience with pre-built library</p>
                        </div>


                    </div>
                    <div>
                        <div>
                            <DiDatabase />
                            <p className='text-lg md:text-xl font-semibold'>Front-end to Back-end bridged</p>
                        </div>
                        <div>
                            <CgIfDesign />
                            <p>Flexible design modification</p>
                        </div>
                    </div>
                </div>
                <Link href={'/about'} className='bg-primary text-light rounded-lg p-1 px-4 text-lg'>Learn more</Link>
            </div>

        </div>
    )
}

export default LearnMore