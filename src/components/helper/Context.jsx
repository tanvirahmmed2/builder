'use client'
import { createContext, useState } from "react";

export const Context = createContext()


const apps=[
  {id:1, title:'E-commerce', path:'/apps/e-commerce'},
  {id:2, title:'Restaurant', path:'/apps/restaurant'},
  {id:3, title:'Lms', path:'/apps/lms'},
  {id:4, title:'School Management', path:'/apps/school-management'}, 
  {id:5, title:'CMS', path:'/apps/cms'}, 
]


export const ContextProvider = ({ children }) => {

    const [reviews,setReviews]=useState([])


    const contextValues = {reviews, apps}


    return <Context.Provider value={contextValues}>{children}</Context.Provider>
}