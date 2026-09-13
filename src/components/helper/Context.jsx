'use client'
import { createContext, useState } from "react";

export const Context = createContext()


const demoReviews=[
    
  { id: 1, name: 'Sara', country: 'Bangladesh', rating: 4.5, comment: 'Absolutely wonderful experience! The service exceeded my expectations.' },
  { id: 2, name: 'Tanvir', country: 'Bangladesh', rating: 4.8, comment: 'Very professional and fast delivery. Highly recommended.' },
  { id: 3, name: 'Ahmmed', country: 'Canada', rating: 4.2, comment: 'Good quality overall, though shipping took a little longer than expected.' },
  { id: 4, name: 'Liam', country: 'Australia', rating: 5.0, comment: 'Outstanding quality and brilliant customer support. Will definitely buy again.' },
  { id: 5, name: 'Fati', country: 'UAE', rating: 4.6, comment: 'Very sleek design and easy to use. Great value for money.' },
  { id: 6, name: 'David', country: 'United Kingdom', rating: 4.3, comment: 'Solid product that performs well. Satisfied with the purchase.' }
]

const apps=[
  {id:1, title:'E-commerce', path:'/apps/e-commerce'},
  {id:2, title:'Restaurant', path:'/apps/restaurant'},
  {id:3, title:'Lms', path:'/apps/lms'},
  {id:4, title:'School Management', path:'/apps/school-management'}, 
  {id:5, title:'CMS', path:'/apps/cms'}, 
]


export const ContextProvider = ({ children }) => {

    const [reviews,setReviews]=useState(demoReviews || [])


    const contextValues = {reviews, apps}


    return <Context.Provider value={contextValues}>{children}</Context.Provider>
}