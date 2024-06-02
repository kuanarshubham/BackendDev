import { Router } from "express";
import { registerUser, logInUser, logOutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    
    registerUser)

router.route("/login").post(logInUser);

router.route("./logout").post(verifyJWT, logOutUser);

export default  router;