// const asyncHandler = (fn) => async (err, req, res, next) => {
//     try{
//         await fn(req, res, next);
//     }
//     catch(error){
//         res.send(err.code || 500).json({
//             sucess:  false,
//             message: err.message;
//         })
//     }
// }

const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((err) => next(err));
    }
}

export {asyncHandler};