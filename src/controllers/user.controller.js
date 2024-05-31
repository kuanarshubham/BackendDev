import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadResult} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {

    const {email, userName, fullName, password} = req.body;

    if(
        [fullName, userName, password, email].some((feild) => {
            feild?.trim() === ""
        })
    ){
        throw new ApiError(400, "Feilds not provided by users") ;
    }

    const existedUser = User.findOne({
        $or: [{userName}, {email}]
    });

    if(existedUser){
        throw new ApiError(409, "Username or Email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar required");
    }

    const coverImageLocalPath = req.files?.coverImageLocalPath[0]?.path;



    const uploadAvatar = await uploadResult(avatarLocalPath);
    const uploadCoverImage = await uploadResult(coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar required");
    }

    const user = await User.create({
        fullName, 
        avatar: uploadAvatar.url,
        coverImage: uploadCoverImage?.url,
        email,
        userName: userName.toLowercase(),
        password
    });

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!createduser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(200).json(
        new ApiResponse(200, createduser, "The user has been created")
    );


})
