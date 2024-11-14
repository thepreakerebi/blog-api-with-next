import { connect } from "@/lib/db";
import User from "@/lib/modals/user";
import { NextResponse } from "next/server";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ObjectId = require("mongoose").Types.ObjectId;

export const GET = async (req: Request) => {
    try {
        await connect();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (userId) {
            // Fetch specific user by ID
            if (!Types.ObjectId.isValid(userId)) {
                return new NextResponse(JSON.stringify({ message: "Invalid user ID" }), { status: 400 });
            }
            
            const user = await User.findById(userId);
            if (!user) {
                return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
            }

            return new NextResponse(JSON.stringify({ username: user.username, email: user.email }), { status: 200 });
        } else {
            // Fetch all users
            const users = await User.find();
            return new NextResponse(JSON.stringify(users), { status: 200 });
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in fetching users: " + error.message, { status: 500 });
    }
};


// export const GET = async () => {
//     try {
//         await connect();
//         const users = await User.find();
//         return new NextResponse(JSON.stringify(users), { status: 200 });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in fetching users" + error.message, { status: 500 });
//     }
// };

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        await connect();

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(body.password, 10);

        // Replace the plain password with the hashed password
        const newUser = new User({
            ...body,
            password: hashedPassword
        });

        const user = await newUser.save();

        return new NextResponse(JSON.stringify({ message: "User created successfully", user }), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in creating user " + error.message, { status: 500 });
    }
};



// export const POST = async (req: Request) => {
//     try {
//         const body = await req.json();
//         await connect();
//         const newUser = new User(body);
//         const user = await newUser.save();
         
//         return new NextResponse(JSON.stringify({message: "User created successfully", user}), { status: 200 });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in creating user " + error.message, { status: 500 });
//     }
// };

export const PATCH = async (req: Request) => {
    try {
        const body = await req.json();
        const { userId, newEmail, newUsername, newPassword } = body;

        await connect();

        if (!userId) {
            return new NextResponse(JSON.stringify({ message: "User ID is required" }), { status: 400 });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({ message: "Invalid user ID" }), { status: 400 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        // Check which field to update
        if (newEmail) updateData.email = newEmail;
        if (newUsername) updateData.username = newUsername;
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: new ObjectId(userId) },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        return new NextResponse(JSON.stringify({ message: "User updated successfully", user: updatedUser }), { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in updating user: " + error.message, { status: 500 });
    }
};


// export const PATCH = async (req: Request) => {
//     try {
//         const body = await req.json();
//         const { userId, newUsername } = body;

//         await connect();

//         if (!userId || !newUsername) {
//             return new NextResponse(JSON.stringify({message: "User ID and new username are required"}), { status: 400 });
//         }

//         if (!Types.ObjectId.isValid(userId)) {
//             return new NextResponse(JSON.stringify({message: "Invalid user ID"}), { status: 400 });
//         }

//         const updateUser = await User.findOneAndUpdate(
//             { _id: new ObjectId(userId) },
//             { username: newUsername },
//             { new: true }
//         );

//         if (!updateUser) {
//             return new NextResponse(JSON.stringify({message: "User not found"}), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({message: "User updated successfully", user: updateUser}), { status: 200 });
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in updating user " + error.message, { status: 500 });
//     }
// };

export const DELETE = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        await connect();

        if (!userId) {
            return new NextResponse(JSON.stringify({message: "User ID is required"}), { status: 400 });
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(JSON.stringify({message: "Invalid user ID"}), { status: 400 }); 
        } 

        const deletedUser = await User.findByIdAndDelete( new Types.ObjectId(userId) );

        if (!deletedUser) {
            return new NextResponse(JSON.stringify({message: "User not found"}), { status: 404 });
        }

        return new NextResponse(JSON.stringify({message: "User deleted successfully", user: deletedUser}), { status: 200 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return new NextResponse("Error in deleting user " + error.message, { status: 500 });
    
    }
}
// export const DELETE = async (req: Request) => {
//     try {
//         const body = await req.json();
//         const { userId } = body;

//         await connect();

//         if (!userId) {
//             return new NextResponse(JSON.stringify({message: "User ID is required"}), { status: 400 });
//         }

//         if (!Types.ObjectId.isValid(userId)) {
//             return new NextResponse(JSON.stringify({message: "Invalid user ID"}), { status: 400 });
//         }

//         const deletedUser = await User.findOneAndDelete({ _id: new ObjectId(userId) });

//         if (!deletedUser) {
//             return new NextResponse(JSON.stringify({message: "User not found"}), { status: 404 });
//         }

//         return new NextResponse(JSON.stringify({message: "User deleted successfully", user: deletedUser}), { status: 200 });

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//         return new NextResponse("Error in deleting user " + error.message, { status: 500 });
//     }
// }