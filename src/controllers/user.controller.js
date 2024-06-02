import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadResult } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAcessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const acessToken = await user.generateAcessToken();
        const refreshToken = await user.refreshAcessToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { acessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and Acess Token");
    }
}

export const registerUser = asyncHandler(async (req, res) => {

    const { email, userName, fullName, password } = req.body;

    if (
        [fullName, userName, password, email].some((feild) => {
            feild?.trim() === ""
        })
    ) {
        throw new ApiError(400, "Feilds not provided by users");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "Username or Email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(req.files);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar required");
    }

    let coverImageLocalPath = "";
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0].path) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    const uploadAvatar = await uploadResult(avatarLocalPath);
    const uploadCoverImage = await uploadResult(coverImageLocalPath);

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar required Now");
    }

    const user = await User.create({
        fullName: fullName,
        avatar: uploadAvatar.url,
        coverImage: uploadCoverImage?.url || "",
        email: email,
        userName: userName.toLowerCase(),
        password: password
    });

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(200).json(
        new ApiResponse(200, createduser, "The user has been created")
    );
})

export const logInUser = asyncHandler(async (req, res) => {
    const { email, userName, password } = req.body;
    console.log(req.body);
    console.log(`email: ${email}, useranme: ${userName}`);

    if (!email || !userName) {
        throw new ApiError(400, "Email or Username is required");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "No user found");
    }

    const checkingPassword = await user.isPasswordCorrect(password);

    if (!checkingPassword) {
        throw new ApiError(404, "Invalid user credentials");
    }

    const { acessToken, refreshToken } = await generateAcessAndRefreshToken(user._id);

    const logInUser = await User.findById(user._id).select("-password -refreshToken");

    const option = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("acessToken", acessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(
                200,
                {
                    user: logInUser, refreshToken, acessToken
                },
                "User has been sucessfully logged in"
            )
        )

});

export const logOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },

        {
            new: true
        }
    )

    const option = {
        httpOnly: true, 
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("acessToken", option)
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User logged out sucessfully"));
    
});