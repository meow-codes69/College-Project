import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        // access token is given to the user but we need to save refresh token in database aswell so that we can timely validate with it
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { refreshToken, accessToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token !")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // validation- not empty
    // check if user already exists: username, email
    // check for images , check for avatar
    // upload them to cloudinary-avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullName, email, username, password } = req.body

    // The .some() method in JavaScript is a very useful array method that helps you check whether at least one element in an array passes a specific condition.
    if (
        [fullName, email, username, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required !!!")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser)
        throw new ApiError(409, "User with email or username already exists")

    // If a file was uploaded in the avatar field ,get the path of the first file and store it in createdLocalPath
    const avatarLocalPath = req.files?.avatar[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required !!!")
    }

    // Upload on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar)
        throw new ApiError(400, "Avatar image is required !!!")

    const user = await User.create({
        fullName,
        email,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser)
        throw new ApiError(500, "Something went wrong while registering the user")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully !!!")
    )
})

const userLogin = asyncHandler(async (req, res) => {
    // req.body -> data
    const { username, email, password } = req.body

    // Check username, email
    if (!username || !email) {
        throw new ApiError(400, "Username or email is required !")
    }

    // Find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    // Password Check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid)
        throw new ApiError(401, "Invalid user credentials")

    const { refreshToken, accessToken } = await user.generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = user.findById(user._id).select(
        "-password -refreshToken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged in successfully !"
            )
        )
})

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
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
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

export {
    registerUser,
    userLogin,
    userLogout
}
