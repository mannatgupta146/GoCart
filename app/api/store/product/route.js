import {getAuth} from "@clerk/nextjs/server"

// add a new product 
export async function POST(request){
    try {
        const {userId} = getAuth(request)

        
    } catch (error) {
        
    }
}