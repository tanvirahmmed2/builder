import { cookies } from "next/headers"
import { ADMIN_TOKEN } from "../db/secret"

export async function bcrypt_token() {
    try {
        const cookie= await cookies()
        const token= await cookie.get(ADMIN_TOKEN)?.value
        if(!token){
            return {success: false, message:'Please login'}
        }
        
    } catch (error) {
        
    }
}

export async function isAdmin() {
    try {
        
    } catch (error) {
        return null
    }
    
}