import { connect } from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import { NextResponse } from "next/server";
import { Types } from "mongoose";


export const GET = async (req: Request) => {
    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if (!userId || !Types.ObjectId.isValid(userId)) { 
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        if (categoryId) {
            // Fetch a specific category by ID
            if (!Types.ObjectId.isValid(categoryId)) {
                return new NextResponse(JSON.stringify({ message: "Invalid category ID" }), { status: 400 });
            }

            const category = await Category.findOne({ _id: categoryId, user: new Types.ObjectId(userId) });
            if (!category) {
                return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
            }

            return new NextResponse(JSON.stringify(category), { status: 200 });
        } else {
            // Fetch all categories for the user
            const categories = await Category.find({ user: new Types.ObjectId(userId) });
            return new NextResponse(JSON.stringify(categories), { status: 200 });
        }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in fetching categories: " + error.message, { status: 500 });
    }
};


// export const GET = async (req: Request) => {
//     try {
//         await connect();
//         const { searchParams } = new URL(req.url);
//         const userId = searchParams.get("userId");

//         if (!userId || !Types.ObjectId.isValid(userId)) { 
//             return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
//         }

//         const categories = await Category.find({ user: new Types.ObjectId(userId) });
//         return new NextResponse(JSON.stringify(categories), { status: 200 });   

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in fetching categories: " + error.message, { status: 500 });
//     }
// }

export const POST = async (req: Request) => {
    try {
        await connect();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        const { title } = await req.json();
        const formattedTitle = title
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        // Check for duplicate category
        const existingCategory = await Category.findOne({
            title: formattedTitle,
            user: new Types.ObjectId(userId),
        });

        if (existingCategory) {
            return new NextResponse(JSON.stringify({ message: "Category already exists" }), { status: 409 });
        }

        const newCategory = new Category({ title: formattedTitle, user: new Types.ObjectId(userId) });
        const category = await newCategory.save();

        return new NextResponse(JSON.stringify({ message: "Category created successfully", category }), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in creating category: " + error.message, { status: 500 });
    }
};
