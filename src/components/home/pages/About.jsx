import React from 'react'

export const data=[
    {id:1, title:'Products', number:110},
    {id:2, title:'Themes', number:56},
    {id:3, title:'Customers', number:23034},
    {id:4, title:'Reviews', number:950},
]
const About = () => {

  return (
    <div className='w-full flex flex-col items-center justify-center gap-16 max-w-4xl mx-auto py-20'>
        <p className='text-2xl md:text-4xl lg:text-5xl text-center'>Simplifying your website building experience with the most functional, ready to use, well-structured, customizable tools</p>
        <div className='w-full grid grid-cols-4 gap-2 justify-items-center'>
            {
                data.map((d)=>(
                    <div key={d.id} className='w-full flex flex-col items-center justify-center'>
                        <p className='text-xl font-semibold'>{d.number}</p>
                        <p>{d.title}</p>
                    </div>
                ))
            }
        </div>
    </div>
  )
}

export default About