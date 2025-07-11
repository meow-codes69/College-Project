const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export { asyncHandler }

// const asyncHandler= (requestHandler)=>(req, res, next)=>{
//         Promise.resolve(requestHandler(req,res,next)).catch((err)=>next (err))
//     }


// writing this code so that we don't need to use trycatch again and again