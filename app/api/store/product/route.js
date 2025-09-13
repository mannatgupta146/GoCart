import imagekit from "@/configs/imageKit"
import prisma from "@/lib/prisma"
import authSeller from "@/middlewares/authSeller"
import {getAuth} from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// add a new product 
export async function POST(request){
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, {status: 400})
        }

        // get the data from form 
        const formData = await request.formData()
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const category = formData.get("category")
        const images = formData.getAll("images")

        if(!name || !description || !mrp || !price || !category || !images.length < 1){
            return NextResponse.json({error: 'messing product details'}, {status: 400})
        }

        // uploading images to imagekit
        const imagesUrl = await Promise.all(images.map(async(image)=>{
            const buffer = buffer.from(await image.arrayBuffer())
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.name,
                folder: "products"
            })
            const url = imageKit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '1024'}
                ]
            })
            return url
        }))

        // store this data in database
        await prisma.product.create({
            data:{
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId
            }
        })
        return NextResponse.json({message: "Product added successfully"})
        
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    }
}