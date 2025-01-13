const express = require("express");
const router = express.Router();
const upload = require("../upload");
const userController = require("../controller/userController");
// const { Admin } = require("mongodb");

/*  User panel */

// Api for user signup
router.post("/user_signup",upload.single("profileImage"),userController.user_signup);
// Api for update 
router.put("/update_user_details/:userId",upload.single("profileImage"),userController.update_user_details);
// Api for user_login
router.post("/user_login", userController.user_login);
// Api for user_change_password
router.post("/user_change_password/:userId", userController.user_change_password);


/* forget password */

// Api for otp generate
router.post("/user_otpGenerate", userController.user_otpGenerate);
// Api for verify otp
router.post("/user_verify_otp", userController.user_verify_otp);
// Api for user_reset_password
router.post("/user_reset_password/:userId", userController.user_reset_password);

/* Bill Section */

// Api for get_user_bills

router.get("/get_user_bills/:userId", userController.get_user_bills);
router.get("/agg", userController.agg);

/* Service Request Section */

router.post("/request_for_address_update/:userId",upload.single("id_proof"),userController.request_for_address_update);

/* Support Request */
router.post("/request_for_support/:userId",upload.array("images"),userController.request_for_support);
// Api for get my support requests
router.get("/get_user_requests_for_support/:userId",userController.get_user_requests_for_support);

/* Notification and announcement  */
router.get("/get_all_announcemnets", userController.get_all_announcemnets);

// Api for all_notification_of_user
router.get("/all_notification_of_user/:userId",userController.all_notification_of_user);
// Api for all_notification_count_of_user
router.get("/all_notification_count_of_user/:userId",userController.all_notification_count_of_user);
// Api for seen_notification
router.get("/seen_notification/:notification_id",userController.seen_notification);
// Api for delete any particular notification
router.delete("/delete_notification/:notificationId",userController.delete_notification)
// Api for delete all  notification
router.delete("/delete_all_notification_by_userId/:userId", userController.delete_all_notification_by_userId);

/* Report a problem section */

// Api for report_problem
router.post("/report_problem/:userId",upload.array("reportImages"),userController.report_problem);
// Api for get my all reports for problem
router.get("/get_user_all_reports_for_problem/:userId",userController.get_user_all_reports_for_problem);

/* customer Support */

// Api for send_email_to_support_team
router.post("/send_email_to_support_team/:userId",upload.array("attachmentFiles"),userController.send_email_to_support_team);
// Api for get_all_FAQ
router.get("/get_all_FAQ", userController.get_all_FAQ);

// Api for add balance 
router.post("/add_balance/:userId",userController.add_balance)
router.post("/pay_bill/:billId",userController.pay_bill)

// Api for chat
router.post("/chat_support",upload.array("attachment"),userController.chat_support)
router.get("/get_chat_support_by_id/:userId",userController.get_chat_support_by_id)

// Api for delete chat
router.delete("/delete_single_chat/:chatId",userController.delete_single_chat)
router.delete("/delete_all_chat/:userId",userController.delete_all_chat)


router.post("/transactionHistory/:userId",userController.transactionHistory)

module.exports = router;

