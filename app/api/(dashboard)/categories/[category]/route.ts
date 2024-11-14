import { connect } from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/categoy";
import { NextResponse } from "next/server";
import { Types } from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = async (req: Request, context: { params: any }) => {
    const categoryId = context.params.category;

    try {
        await connect();

        const body = await req.json();
        const { title } = body;

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid category ID" }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        const formattedTitle = title
            .split(" ")
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

        // Check for duplicate category title
        const duplicateCategory = await Category.findOne({
            title: formattedTitle,
            user: userId,
            _id: { $ne: categoryId }, // Exclude the current category being updated
        });

        if (duplicateCategory) {
            return new NextResponse(JSON.stringify({ message: "Category with this title already exists" }), { status: 409 });
        }

        // Update the category with the new title
        category.title = formattedTitle;
        const updatedCategory = await category.save();

        return new NextResponse(JSON.stringify({ message: "Category updated successfully", category: updatedCategory }), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in updating category: " + error.message, { status: 500 });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = async (req: Request, context: { params: any }) => {
    const categoryId = context.params.category; 

    try {
        await connect();

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid category ID" }), { status: 400 });
        }        

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }            

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }            

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        await Category.deleteOne({ _id: categoryId });

        return new NextResponse(JSON.stringify({ message: "Category deleted successfully" }), { status: 200 });     

    // eslint-disable-next-line @typescript-eslint/no-explicit-any        
    } catch (error: any) {
        return new NextResponse("Error in deleting category: " + error.message, { status: 500 });
    }
}
