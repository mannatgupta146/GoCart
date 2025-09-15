import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// approve seller
export async function POST(request){
    try {
        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error: 'not authorized'}, {status: 401})
        }

        const {storeId, status} = await request.json()

        if(status === 'approved'){
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "approved", isActive: true}
            })
        }

        else if(status === 'rejected'){
            await prisma.store.update({
                where: {id: storeId},
                data: {status: "rejected"}
            })
        }
         return NextResponse.json({message: `${status} successfully`})

    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}