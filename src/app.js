import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

//My middlewares
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))
// express.json lets the server use json data
app.use(express.json({limit:"16kb"}))//giving limit of 16kb json data
app.use(express.urlencoded({extended:"true", limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import userRouter from "./routes/user.routes.js"

// Router declaration
app.use("/api/v1/users",userRouter)

// http://localhost:3000/api/vi/users/register

export {app}