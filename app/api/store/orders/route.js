import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { useAuth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


// update seller order status
export async function POST(request){
    try {
        const {userId} = useAuth(request)
        const storeId =  await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }

        const {orderId, status} = await request.json()
        await prisma.order.update({
            where: {id: orderId, storeId},
            data: {status}
        })

        return NextResponse.json({message: "Order status updated"})

    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}

// get all orders for seller 
export async function GET(request){
    try {
        const {userId} = useAuth(request)
        const storeId =  await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }

        const orders = await prisma.order.findMany({
            where: {storeId},
            include: {user: true, address: true, orderItems: {include: {product: true}}},
            orderBy: {createdAt: 'desc'}
        })

        return NextResponse.json({orders})

    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}