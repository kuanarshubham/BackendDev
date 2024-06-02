//if user there or not

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.acessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        if(!token){
            throw new ApiError(404, "Token not found"); 
        }
    
        const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if(!user){
            throw new ApiError(401, "Invaliid acess token");
        }
    
        req.user =  user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid Token");
    }
})