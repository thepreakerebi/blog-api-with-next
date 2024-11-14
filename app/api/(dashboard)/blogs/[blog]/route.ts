import { connect } from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import Blog from "@/lib/modals/blog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = async (req: Request, context: { params: any }) => {

    const blogId = context.params.blog;

    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if (!userId || !Types.ObjectId.isValid(userId)) { 
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing category ID" }), { status: 400 });
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blog ID" }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }            

        const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId });
        if (!blog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ title: blog.title, content: blog.content }), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in fetching blog: " + error.message, { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = async (req: Request, context: { params: any }) => {
    const blogId = context.params.blog;
    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing category ID" }), { status: 400 });        
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blog ID" }), { status: 400 });
        }            

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }            

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId });
        if (!blog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        }

        const { title, content } = await req.json();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (title) updateData.title = title;
        if (content) updateData.content = content;

        const updatedBlog = await Blog.findOneAndUpdate({ _id: blogId }, updateData, { new: true });

        if (!updatedBlog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: "Blog updated", blog: updatedBlog }), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in updating blog: " + error.message, { status: 500 });
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = async (req: Request, context: { params: any }) => {
    const blogId = context.params.blog;
    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing category ID" }), { status: 400 });
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing blog ID" }), { status: 400 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId });
        if (!blog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        }

        const deletedBlog = await Blog.findOneAndDelete({ _id: blogId });

        if (!deletedBlog) {
            return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: "Blog deleted", blog: deletedBlog }), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in deleting blog: " + error.message, { status: 500 });
    }
}