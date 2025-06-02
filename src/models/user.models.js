import mongoose,{Schema} from "mongoose";

const userSchema = new Schema (
    {
        username:{
            type:String,
            required: [true, "Username is required"],
            unique: true,
            lowercase:true,
            trim:true,
            index:true
        },
        password:{
            type:String,
            required: [true, "Password is required"],
        },
        email:{
            type:String,
            required: [true, "Email is required"],
            unique: true,
            lowercase:true,
            trim:true
        },
        fullName:{
            type:String,
            required: [true, "Name is must"],
            trim:true,
            index:true
        },
        avatar:{
            type: String,//Cloudinary url
            required: true
        },
        coverImage:{
            type:String
        },
        watchHistory:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        refreshToken:{
            type:String
        }
    },
    {
        timestamps: true
    }
)

// A pre hook is a function that runs before something happens(event), like saving , updating , validating , removing etc
userSchema.pre("save",function(next){
    if(!this.isModified("password")) return next()
    this.password= bcrypt.hash(this.password, 12)
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken= async function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const user = mongoose.model("User", userSchema)