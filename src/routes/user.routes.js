import { refreshAccessToken, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields(
        [
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            },
        ]
    ),userRegister
)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJwt,userLogout)
router.route("/refresh-access-token").post(refreshAccessToken)
export default router
