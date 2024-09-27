const express = require('express')
const router = new express.Router();
const controllers = require('../Controllers/usersController');
const upload = require('../multerconfig/storageconfig');
const { loginValidation, signupValidation } = require('../middlewares/AuthValidation');

//Login
router.post('/login',loginValidation,controllers.login)
//signup
router.post('/signup',signupValidation, controllers.signup)

router.post('/user/register',upload.single('user_profile'),controllers.userPost)
router.get('/user/details',controllers.userget)
router.get('/user/:id',controllers.singleuserget)
router.put('/user/edit/:id',upload.single("user_profile"),controllers.useredit)
router.delete('/user/delete/:id',controllers.userdelete)
router.put('/user/status/:id',controllers.userstatus)
router.get('/userexport',controllers.userExport)
module.exports = router