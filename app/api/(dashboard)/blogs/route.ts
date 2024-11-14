import { connect } from "@/lib/db";
import User from "@/lib/modals/user";
import Category from "@/lib/modals/category";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import Blog from "@/lib/modals/blog";



export const GET = async (req: Request) => {
    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");  
        const categoryId = searchParams.get("categoryId");
        // const blogId = searchParams.get("blogId");
        const search = searchParams.get("search");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "10";


        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });    
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid or missing category ID" }), { status: 400 });    
        }

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId),
        };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },    // Case-insensitive search in title
                { content: { $regex: search, $options: "i" } }   // Case-insensitive search in content
            ];
        }

        if (startDate && endDate) {
            filter.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (startDate && !endDate) {
            filter.createdAt = {
                $gte: new Date(startDate)
            };
        }

        if (!startDate && endDate) {
            filter.createdAt = {
                $lte: new Date(endDate)
            };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const limitNum = Number(limit);
        const totalBlogs = await Blog.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / limitNum);

        const blogs = await Blog.find(filter).sort({ createdAt: "desc" }).skip(skip).limit(limitNum);
        return new NextResponse(JSON.stringify({ blogs, totalBlogs, totalPages }), { status: 200 });

        // const blogs = await Blog.find(filter).sort({ createdAt: "desc" });
        // return new NextResponse(JSON.stringify({ blogs }), { status: 200 });

        // if (blogId) {
        //     // Fetch a specific blog by ID
        //     if (!Types.ObjectId.isValid(blogId)) {
        //         return new NextResponse(JSON.stringify({ message: "Invalid blog ID" }), { status: 400 });
        //     }

        //     const blog = await Blog.findOne({ _id: blogId, ...filter });
        //     if (!blog) {
        //         return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
        //     }

        //     return new NextResponse(JSON.stringify({ blog }), { status: 200 });
        // } else {
        //     // If `search` is provided, filter blogs by title or content containing the search term
            
        // }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in fetching blogs: " + error.message, { status: 500 });
    }
};



// export const GET = async (req: Request) => {
//     try {
//         await connect();
//         const { searchParams } = new URL(req.url);
//         const userId = searchParams.get("userId");  
//         const categoryId = searchParams.get("categoryId");
//         // const blogId = searchParams.get("blogId");

//         if (!userId || !Types.ObjectId.isValid(userId)) {
//             return new NextResponse(JSON.stringify({ message: "Invalid or missing user ID" }), { status: 400 });    
//         }

//         if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
//             return new NextResponse(JSON.stringify({ message: "Invalid or missing category ID" }), { status: 400 });    
//         }

//         const user = await User.findById(userId);
//         if (!user) {
//             return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
//         }

//         const category = await Category.findOne({ _id: categoryId, user: userId });
//         if (!category) {
//             return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
//         }

//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         const filter: any = {
//             user: new Types.ObjectId(userId), // userId,
//             category: new Types.ObjectId(categoryId), // categoryId,
//         }

//         const blogs = await Blog.find(filter)

//         return new NextResponse(JSON.stringify({ blogs }), {
//         status: 200,
//         });

//         // if (blogId) {
//         //     // Fetch a specific blog by ID
//         //     if (!Types.ObjectId.isValid(blogId)) {
//         //         return new NextResponse(JSON.stringify({ message: "Invalid blog ID" }), { status: 400 });
//         //     }

//         //     const blog = await Blog.findOne({ _id: blogId, user: userId, category: categoryId });
//         //     if (!blog) {
//         //         return new NextResponse(JSON.stringify({ message: "Blog not found" }), { status: 404 });
//         //     }

//         //     return new NextResponse(JSON.stringify({ blog }), { status: 200 });
//         // } else {
//         //     // Fetch all blogs for the user and category
//         //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         //     const filter: any = {
//         //                     user: new Types.ObjectId(userId), // userId,
//         //                     category: new Types.ObjectId(categoryId), // categoryId,
//         //                 }

//         //     const blogs = await Blog.find(filter)

//         //     return new NextResponse(JSON.stringify({ blogs }), {
//         //         status: 200,
//         //     });
//         // }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in fetching blogs: " + error.message, { status: 500 });
//     }
// }


export const POST = async (req: Request) => {
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

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const category = await Category.findOne({ _id: categoryId, user: userId });        
        if (!category) {
            return new NextResponse(JSON.stringify({ message: "Category not found" }), { status: 404 });
        }

        const { title, content } = await req.json();

        if (!title || !content) {
            return new NextResponse(JSON.stringify({ message: "Title and content are required" }), { status: 400 });
        }

        const body = {
            title,
            content,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId),
        };

        const existingBlog = await Blog.findOne({ title, user: userId, category: categoryId });
        if (existingBlog) {
            return new NextResponse(JSON.stringify({ message: "Blog already exists" }), { status: 409 });       
        }

        const newBlog = await Blog.create(body);
        return new NextResponse(JSON.stringify({message: "New blog created", blog: newBlog}), { status: 201 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in creating blog: " + error.message, { status: 500 });
    }
}