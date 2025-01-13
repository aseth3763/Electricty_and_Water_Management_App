const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const upload = require("../upload");

/* Admin Section */
// Api for admin login
router.post("/admin_login", adminController.admin_login);
// Api for admin details update
router.post("/update_admin/:adminId",upload.single("profileImage"),adminController.update_admin);
// Api for get_admin
router.get("/get_admin/:adminId", adminController.get_admin);
// Api for change_admin_password
router.post("/change_admin_password/:adminId",adminController.change_admin_password);

// forget password
// Api for generate otp
router.post("/otpGenerate", adminController.otpGenerate);
// Api for verify otp
router.post("/verify_otp", adminController.verify_otp);
// Api for reset password
router.post("/reset_password/:adminId", adminController.reset_password);

/* user Section */
// Api for get_all_user
router.get("/get_all_user", adminController.get_all_user);
// Api for get user data by id
router.get("/get_user_data_by_id/:id",adminController.get_user_data_by_id);
// Api for activate_deactivate_user
router.post("/activate_deactivate_user/:userId",adminController.activate_deactivate_user);

/* Service section */
// Api for add services
router.post("/add_service", adminController.add_service);
// Api for get_all_services
router.get("/get_all_services", adminController.get_all_services);

/* Bill section */
router.post("/Generate_Bill/:userId", adminController.Generate_Bill);

/* Service Requests sections */
// Api for get_all_request_for_address_update
router.get("/get_all_request_for_address_update",adminController.get_all_request_for_address_update);

// Api for get request for address update of particular user
router.get("/get_request_for_address_update_for_user/:userId",adminController.get_request_for_address_update_for_user);

// Api for accept_reject_user_address_update_request
router.post("/accept_reject_user_address_update_request/:req_id",adminController.accept_reject_user_address_update_request);

/* Support Requests Sections */
router.get("/get_all_support_requests",adminController.get_all_support_requests);
// Api for update_status_of_support_request
router.post("/update_status_of_support_request/:req_id",adminController.update_status_of_support_request);

/* Announcement Section */
// Api for sendNotification_to_allCustomer
router.post("/sendAnnouncement_message_to_all_user",adminController.sendAnnouncement_message_to_all_user);

/* Report Problem section */
router.get("/all_reports_for_problem", adminController.all_reports_for_problem);
// Api for resolution_of_reported_problem
router.post("/resolution_of_reported_problem/:report_id",adminController.resolution_of_reported_problem);

/* customer support section */
router.get("/email_records_for_support_team",adminController.email_records_for_support_team);
// Api for add_faq_question_for_customer_support
router.post("/add_faq_question_for_customer_support",adminController.add_faq_question_for_customer_support);

module.exports = router;
