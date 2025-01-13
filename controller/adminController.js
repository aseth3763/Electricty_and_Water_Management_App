const adminModel = require("../model/admin");
const bcrypt = require("bcrypt");
const send_adminEmail = require("../utils/adminEmail");
const admin_otp_model = require("../model/admin_otp");
const userModel = require("../model/userModel");
const userNotificationModel = require("../model/user_notification");
const service_model = require("../model/Services");
const Bill_Model = require("../model/user_bill");
const user_bill_Email = require("../utils/user_bill_email");
const path = require("path");
const fs = require("fs");
const htmlPdf = require("html-pdf-node");
const address_update_model = require("../model/address_update_request");
const support_request_model = require("../model/support_request");
const announcement_Model = require("../model/announcement");
const userEmail = require("../utils/userEmail");
const report_problem_Model = require("../model/report_a_problem");
const emailSupport_model = require("../model/emailSupport");
const faq_support_Model = require("../model/faqSupport");

/* Admin Section */
const public_IP = "http://192.168.1.74:3300/";

// Api for admin login
const admin_login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for required fields
    const requiredFields = ["email", "password"];
    for (let fields of requiredFields) {
      if (!req.body[fields]) {
        return res.status(400).json({
          success: false,
          message: `Required ${fields.replace("_")(" ")}`,
        });
      }
    }

    // check for admin
    const admin = await adminModel.findOne({ email: email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin Not Found",
      });
    }

    // check if admin password is plain text
    if (admin.password && admin.password.startsWith("$2b$")) {
      // password is already bcrypt
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Password Incorrect",
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
      await admin.save();
    }

    return res.status(200).json({
      success: true,
      message: "Admin login Successfully",
      admin_details: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for update admin Details

const update_admin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    // check for admin Id
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "adminId required",
      });
    }

    const { name, email, phone_no } = req.body;

    // check for admin
    const admin = await adminModel.findOne({
      _id: adminId,
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin Details not found",
      });
    }

    // check for adminProfile
    let profileImage = admin.profileImage;
    if (req.file) {
      admin.profileImage = req.file.filename;
    }
    admin.name = name;
    admin.email = email;
    admin.phone_no = phone_no;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin Details Update Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for get admin Details
const get_admin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    // check for adminId
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "adminId Required",
      });
    }

    // check for admin
    const admin = await adminModel.findOne({ _id: adminId });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin Not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin Details",
      admin_details: admin,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for admin change password

const change_admin_password = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // check for adminId
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "admin id required",
      });
    }

    // check for admin
    const admin = await adminModel.findOne({ _id: adminId });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    // check for required fields

    const requiredFields = ["oldPassword", "newPassword", "confirmPassword"];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Required ${field.replace("_", " ")} `,
        });
      }
    }

    // check for newPassword and confirmPassword is matched or not
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm Password not matched",
      });
    }

    // check for old password , is oldpassword is matched with stored password

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      admin.password
    );

    if (!isOldPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "old password is not valid",
      });
    }

    // bcrypt new password

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedNewPassword;
    const adminEmailContent = `
                <p style="text-align: center; font-size: 20px; color: #333; font-weight: 600; margin-bottom: 30px;">Congratulations! Your Password Has Been Changed</p>
                <p style="text-align: center; font-size: 16px; color: #666; margin-bottom: 20px;">Here are your account details:</p>

                <div style="display: flex; justify-content: center; align-items: center;">
                <div style="width: auto; max-width: 500px; background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #fff;">
                <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px; border-bottom: 1px solid #e0e0e0;">Email:</td>
                <td style="padding: 14px 20px; text-align: left; font-size: 16px; border-bottom: 1px solid #e0e0e0;">${admin.email}</td>
                </tr>
                <tr style="background-color: #fff;">
                <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px;">Password:</td>
                <td style="padding: 14px 20px; text-align: left; font-size: 16px;">${newPassword}</td>
                </tr>
                </table>
                </div>
                </div>
`;

    // Send email to the admin
    await send_adminEmail(
      admin.email,
      `Password Changed successfully ..!`,
      adminEmailContent
    );
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin Password Changed Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error_message: error.message,
    });
  }
};

/* admin forget password */

function isValidEmail(email) {
  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp.slice(0, 6);
}

// Api for opt generate
const otpGenerate = async (req, res) => {
  try {
    const { email } = req.body;
    // check for email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // check for admin
    const admin = await adminModel.findOne({ email: email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "admin not found",
      });
    }

    const otp = generateOTP();

    // Save the OTP in the otpModel
    const otpData = {
      adminId: admin._id,
      otp: otp,
    };
    await admin_otp_model.create(otpData);
    const adminEmailContent = `<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Forgot Password - Reset Your Password</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                                <div style="width: 80%; max-width: 600px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                    <section>
                                        <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px; font-weight: normal;">Dear ${admin.name}</h2>
                                        <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px; line-height: 1.5;">We received a request to reset your password. To proceed, please use the following One-Time Password (OTP):</p>
                                        <div style="background-color: #f9f9f9; text-align: center; padding: 20px; border-radius: 8px; margin: 0 auto 30px; max-width: 200px; border: 5px groove black;">
                                            <div style="font-size: 36px; font-weight: bold; color: #333; letter-spacing: 2px;">${otp}</div>
                                        </div>
                                        <p style="color: #666; font-size: 14px; text-align: center; margin-bottom: 20px;">This OTP will expire in 2 minutes.</p>
                                        <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">If you didn't request a password reset, you can ignore this email.</p>
                                        <p style="color: #666; font-size: 16px; text-align: center; margin-bottom: 20px;">Thank you!</p>
                                        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;"> All rights reserved.</div>
                                    </section>
                                </div>
                            </body>
                            </html>
                            `;
    await send_adminEmail(admin.email, `OTP Email`, adminEmailContent);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: `An Otp has been send to your email`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error_message: error.message,
    });
  }
};

// Api for otp verification
const verify_otp = async (req, res) => {
  try {
    const { otp } = req.body;
    // check for otp required
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "opt Required",
      });
    }

    // check for otp

    const check_otp = await admin_otp_model.findOne({
      otp: otp,
    });

    if (!check_otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp or expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP Verified Successfully",
      adminId: check_otp.adminId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error_message: error.message,
    });
  }
};

// Api for recet password

const reset_password = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const { newPassword, confirmPassword } = req.body;

    // check for required fileds
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "adminId required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "new Password required",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm password required",
      });
    }

    // check for admin
    const admin = await adminModel.findOne({ _id: adminId });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Admin not found",
      });
    }

    // check for otp
    const otp = await admin_otp_model.findOne({
      adminId: admin._id,
    });
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // check for confirmPassword
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm Password is not matched",
      });
    }

    // bcrypt the new password

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;

    // check for otp
    await admin_otp_model.deleteOne({ adminId: adminId });

    const adminEmailContent = `<p style="text-align: center; font-size: 20px; color: #333; font-weight: 600; margin-bottom: 30px;">Congratulations! Your Password Has Been Reset</p>
                            <p style="text-align: center; font-size: 16px; color: #666; margin-bottom: 20px;">Here are your account details:</p>

                            <div style="display: flex; justify-content: center; align-items: center;">
                                <div style="width: auto; max-width: 500px; background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); padding: 20px;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <tr style="background-color: #fff;">
                                            <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px; border-bottom: 1px solid #e0e0e0;">Email:</td>
                                            <td style="padding: 14px 20px; text-align: left; font-size: 16px; border-bottom: 1px solid #e0e0e0;">${admin.email}</td>
                                        </tr>
                                        <tr style="background-color: #fff;">
                                            <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px;">Password:</td>
                                            <td style="padding: 14px 20px; text-align: left; font-size: 16px;">${newPassword}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                                        `;

    await send_adminEmail(admin.email, `Reset Password`, adminEmailContent);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error_message: error.message,
    });
  }
};

/* User Section */
// Api for get all the users
const get_all_user = async (req, res) => {
  try {
    // check for all users
    const all_user = await userModel.find({}).sort({ createdAt: -1 });
    if (!all_user) {
      return res.status(400).json({
        success: false,
        message: "No User found",
      });
    }

    console.log(req._parsedOriginalUrl)


    return res.status(200).json({
      success: true,
      message: "All User",
      all_user: all_user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server errror",
      error_message: error.message,
    });
  }
};

// get user data by id
const get_user_data_by_id = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }
    const userData = await userModel.findById(id);
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: `user not found with this id  :${id}`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "User data retrieved successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Api for active Inactive user
const activate_deactivate_user = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId Required",
      });
    }

    // check for user
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }

    let newStatus = user.status === 1 ? 0 : 1;
    user.status = newStatus;
    await user.save();
    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `Your account ${
          newStatus ? "Activated" : "Deactivated"
        } By providers `,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      // Handle notification creation error
      console.error("Error creating notification:", notificationError);
      // Optionally, you can choose to return an error response here or handle it in another way
    }

    return res.status(200).json({
      success: true,
      message: `${newStatus ? "Activated" : "Deactivated"} Successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Services Section */
// Api for add service
const add_service = async (req, res) => {
  try {
    const { service_type, rate_per_unit, flat_rate } = req.body;

    if (!service_type) {
      return res.status(400).json({
        success: false,
        message: "serive type required",
      });
    }
    if (!rate_per_unit) {
      return res.status(400).json({
        success: false,
        message: "rate_per_unit required",
      });
    }

    // check for exist service
    const exist_service = await service_model.findOne({
      service_type,
    });
    if (exist_service) {
      return res.status(400).json({
        success: false,
        message: "Service already exist",
      });
    }

    // Create the new service entry
    const newService = new service_model({
      service_type,
      rate_per_unit,
      flat_rate,
    });
    await newService.save();

    return res.status(200).json({
      success: true,
      message: "Service added successfully",
      data: newService,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for get all services
const get_all_services = async (req, res) => {
  try {
    // check for all services
    const all_services = await service_model.find({}).sort({ createdAt: -1 });
    if (!all_services) {
      return res.status(200).json({
        success: false,
        message: "No Service Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All Services",
      All_Services: all_services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* User Bill */
// Api for generate Bill
const Generate_Bill = async (req, res) => {
  try {
    const userId = req.params.userId;
    const {
      service_id,
      unit_consumed,
      start_Date,
      end_Date,
      due_date,
      bill_status,
    } = req.body;

    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    // check for user
    const user = await userModel.findOne({
      _id: userId,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    // Fetch service information for price calculation
    const service = await service_model.findOne({ _id: service_id });
    if (!service) {
      return res.status(400).json({
        success: false,
        message: "Service not found",
      });
    }

    // check for exist bill
    const existingBill = await Bill_Model.findOne({
      userId: userId,
      service: service_id,
      "billing_period.start_date": new Date(start_Date),
    });
    if (existingBill) {
      return res.status(400).json({
        success: false,
        message: `User ${service.service_type} Bill already generated for the month`,
      });
    }

    // Calculate total amount based on unit consumed and service price
    const total_amount = unit_consumed * service.rate_per_unit;
    // Create new bill
    const newBill = new Bill_Model({
      userId: userId,
      service: service_id,
      service_type: service.service_type,
      unit_consumed: unit_consumed,
      billing_period: {
        start_date: new Date(start_Date),
        end_date: new Date(end_Date),
      },
      total_amount: total_amount,
      due_date: new Date(due_date),

      bill_status: "pending",
    });
    const generateDate = new Date().toLocaleDateString();
    // Save bill to the database

    await newBill.save();

    // Define directory and ensure it exists
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const emailcontent = `
                    <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Bill Invoice</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

                            <div style="max-width: 800px; margin: 20px auto; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); padding: 20px; border: 1px solid #ddd;">
                                <div style="text-align: center; margin-bottom: 40px;">
                                    <h1 style="font-size: 28px; color: #333;">Billing Invoice</h1>
                                    <p style="font-size: 14px; color: #666;">Invoice Date: ${generateDate}</p>
                                </div>

                                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                                    <!-- User Details Section -->
                                    <div style="width: 45%;">
                                        <h3 style="font-size: 18px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">User Information</h3>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Name:</strong> ${
                                          user.user_name
                                        }</p>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Email:</strong> ${
                                          user.user_email
                                        }</p>                
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Phone:</strong> ${
                                          user.phone_no
                                        }</p>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Address:</strong> ${
                                          user.address.street
                                        },${user.address.city},${
      user.address.zip
    }</p>
                                    </div>
                                    <!-- Service Details Section -->
                                    <div style="width: 45%;">
                                        <h3 style="font-size: 18px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Service Information</h3>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Service Type:</strong> ${
                                          service.service_type
                                        }</p>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Rate per Unit:</strong> ${
                                          service.rate_per_unit
                                        }</p>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Units Consumed:</strong> ${unit_consumed}</p>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Billing Period:</strong> ${start_Date}} to ${end_Date}}</p>
                                    </div>
                                </div>

                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #ddd;">
                                    <thead>
                                        <tr style="background-color: #f0f0f0;">
                                            <th style="padding: 15px; border: 1px solid #ddd; font-size: 16px; text-align: left; color: #333;">Description</th>
                                            <th style="padding: 15px; border: 1px solid #ddd; font-size: 16px; text-align: left; color: #333;">Units</th>
                                            <th style="padding: 15px; border: 1px solid #ddd; font-size: 16px; text-align: left; color: #333;">Rate per Unit</th>
                                            <th style="padding: 15px; border: 1px solid #ddd; font-size: 16px; text-align: left; color: #333;">Total Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style="padding: 15px; border: 1px solid #ddd; font-size: 14px; color: #555;">${
                                              service.service_type
                                            } Service</td>
                                            <td style="padding: 15px; border: 1px solid #ddd; font-size: 14px; color: #555;">${unit_consumed}</td>
                                            <td style="padding: 15px; border: 1px solid #ddd; font-size: 14px; color: #555;">${
                                              service.rate_per_unit
                                            }</td>
                                            <td style="padding: 15px; border: 1px solid #ddd; font-size: 14px; color: #555;">${
                                              unit_consumed *
                                              service.rate_per_unit
                                            }</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div style="text-align: right; margin-bottom: 30px;">
                                    <h2 style="font-size: 22px; color: #333;">Total Amount: ${
                                      unit_consumed * service.rate_per_unit
                                    }</h2>
                                </div>

                                <div style="display: flex; justify-content: space-between;">
                                    <div style="width: 45%;">
                                        <h3 style="font-size: 18px; margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Payment Information</h3>
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Due Date:</strong> ${due_date}</p>                                     
                                        <p style="font-size: 14px; margin-bottom: 5px; color: #555;"><strong>Status:</strong> 
                                            <span style="padding: 5px 10px; color: #fff; border-radius: 5px; font-size: 12px; display: inline-block; background-color: <strong> pending </strong>  ">
                                            
                                            </span>
                                        </p>
                                        
                                    </div>
                                </div>

                                <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                                    <p style="font-size: 12px; color: #999;">This is a computer-generated bill, no signature required.</p>
                                    <p style="font-size: 12px; color: #999;">Thank you for using our service.</p>
                                </div>
                            </div>

                        </body>
                        </html>

                                                `;
    const htmlContent = `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Bill Generation Notification</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f5f5f5;">
                            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                <h1 style="color: #333333; font-size: 22px; margin-bottom: 20px; text-align: center;">Bill Generated</h1>

                                <p style="color: #666666; font-size: 16px; margin-bottom: 10px;">Dear ${user.user_name},</p>

                                <p style="color: #666666; font-size: 16px; margin-bottom: 10px;">
                                    Your bill has been generated. Please ensure to pay your bill before the due date.
                                    Paying on time will help avoid any inconvenience in the future.
                                </p>

                                <p style="color: #666666; font-size: 16px; margin-bottom: 10px;">
                                    Full details of the bill and a PDF attachment are included in this email. If you have any questions or need assistance, please contact our customer support.
                                </p>

                                <div style="margin-top: 20px; border-top: 1px solid #dddddd; padding-top: 20px;">
                                    <p style="color: #666666; font-size: 16px; margin-bottom: 5px;">Best regards, <br>
                                
                                    <a href="mailto:support@yourcompany.com" style="color: #007bff; text-decoration: none;">support@yourcompany.com</a><br>
                                    <a href="tel:+1234567890" style="color: #007bff; text-decoration: none;">+1234567890</a></p>
                                </div>
                            </div>
                        </body>
                        </html>
                        `;
    const pdfFilename = `bill_${newBill._id}.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);

    // Convert HTML to PDF
    const pdfBuffer = await htmlPdf.generatePdf(
      { content: emailcontent },
      { format: "A4" }
    );
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Attach PDF path to the new bill
    newBill.bill_pdf = `bill_${newBill._id}.pdf`;
    await newBill.save();

    await user_bill_Email(
      user.user_email,
      "INVOICE DETAILS",
      emailcontent,
      htmlContent
    );
    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `New ${service.service_type} Bill , Generated by Service Provider`,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      // Handle notification creation error
      console.error("Error creating notification:", notificationError);
      // Optionally, you can choose to return an error response here or handle it in another way
    }

    // Return the newly created bill
    return res.status(200).json({
      success: true,
      message: ` User ${service.service_type} Generated Successfully for the month`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Service Requests Section */
// Api for GEt all Service Requests
const get_all_request_for_address_update = async (req, res) => {
  try {
    const all_address_update_requests = await address_update_model
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    if (
      !all_address_update_requests ||
      all_address_update_requests.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No Requests Found",
      });
    }

    const unique_user_ids = [
      ...new Set(all_address_update_requests.map((request) => request.userId)),
    ];

    const users = await userModel
      .find({ _id: { $in: unique_user_ids } }, "user_name user_email")
      .lean();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id] = {
        user_name: user.user_name,
        user_email: user.user_email,
      };
    });

    const requests_with_user_details = all_address_update_requests.map(
      (request) => ({
        ...request,
        user_name: userMap[request.userId]?.user_name || "Unknown User",
        user_email: userMap[request.userId]?.user_email || "Unknown Email",
      })
    );

    // Step 5: Return the result with all details including user_name and user_email
    return res.status(200).json({
      success: true,
      message: "All Requests",
      all_requests: requests_with_user_details,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for get request for address update of particular user

const get_request_for_address_update_for_user = async(req,res)=>{
  try {
    const userId = req.params.userId
    if(!userId){
      return res.status(400).json({
        success : false,
        message : "User id is required"
      })
    }

    const userData = await address_update_model.findById(userId)
    if(!userData){
      return res.status(400).json({
        success : false,
        message : `no user data found with this id : ${userId}`
      })
    }

    return res.status(200).json({
      success : true,
      message : "User data retrieved successfully",
      data : userData
    })

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "Internal Server Error",
      error :  error.message
    })
  }
}

// Api for accept the address Request
const accept_reject_user_address_update_request = async (req, res) => {
  try {
    const req_id = req.params.req_id;
    const { request_status } = req.body;
    // check for userId
    if (!req_id) {
      return res.status(400).json({
        success: false,
        message: "req_id Required",
      });
    }

    // check for request data
    const user_request = await address_update_model.findOne({ _id: req_id });
    if (!user_request) {
      return res.status(400).json({
        success: false,
        message: "No Request found for the user",
      });
    }

    // check for user

    const user = await userModel.findOne({
      _id: user_request.userId,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Update request status based on request_status value
    if (request_status === 1) {
      user_request.status = "Processed";
      user.address = {
        street: user_request.newAddress.street,
        city: user_request.newAddress.city,
        zip: user_request.newAddress.zip,
      };
      try {
        var newNotification = new userNotificationModel({
          userId: user_request.userId,
          message: `Your Request for Address Update is Processed by Provider`,
          date: new Date(),
          status: 1,
        });

        await newNotification.save();
      } catch (notificationError) {
        // Handle notification creation error
        console.error("Error creating notification:", notificationError);
        // Optionally, you can choose to return an error response here or handle it in another way
      }
    } else if (request_status === 0) {
      user_request.status = "Rejected";

      try {
        var newNotification = new userNotificationModel({
          userId: user_request.userId,
          message: `Your Request for Address Update is Rejected. please contect to Provider`,
          date: new Date(),
          status: 1,
        });

        await newNotification.save();
      } catch (notificationError) {
        // Handle notification creation error
        console.error("Error creating notification:", notificationError);
        // Optionally, you can choose to return an error response here or handle it in another way
      }
    }

    await user_request.save();
    await user.save();
    return res.status(200).json({
      success: true,
      message: `User Request for Adress Update is ${user_request.status}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Support Request section */
// Api for get all support requests
const get_all_support_requests = async (req, res) => {
  try {
    // check for all requests
    const all_requests = await support_request_model
      .find({})
      .sort({ createdAt: -1 })
      .lean();
    if (!all_requests) {
      return res.status(400).json({
        success: false,
        message: "No requests recived yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All Requests of support",
      all_requests: all_requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// update status of the user request for the support
const update_status_of_support_request = async (req, res) => {
  try {
    const req_id = req.params.req_id;
    const { new_status } = req.body;

    // Check for req_id
    if (!req_id) {
      return res.status(400).json({
        success: false,
        message: "Request Id required",
      });
    }

    // Check for the request
    const request = await support_request_model.findOne({ request_id: req_id });
    if (!request) {
      return res.status(400).json({
        success: false,
        message: "No Request found",
      });
    }

    // Validate new_status
    if (![1, 2, 3].includes(new_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid choice of new_status",
      });
    }

    // Helper function to create and save notifications
    const createNotification = async (userId, message) => {
      try {
        const newNotification = new userNotificationModel({
          userId: userId,
          message: message,
          date: new Date(),
          status: 1,
        });
        await newNotification.save();
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    };

    // Update request status based on new_status value
    switch (new_status) {
      case 1:
        request.status = "In Progress";
        await createNotification(
          request.userId,
          `Your Request for ${request.serviceName} is In Progress`
        );
        break;

      case 2:
        request.status = "Completed";
        await createNotification(
          request.userId,
          `Your Request for ${request.serviceName} is Completed`
        );
        break;

      case 3:
        request.status = "Cancelled";
        await createNotification(
          request.userId,
          `Your Request for ${request.serviceName} has been Rejected by the provider`
        );
        break;
    }

    // Save the updated request
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Request ${request.status} by Provider`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Announcement Sections */
// Api for send announcment to all user
const sendAnnouncement_message_to_all_user = async (req, res) => {
  try {
    const { title, message } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: `Missing title`,
      });
    }
    if (!message) {
      return res.status(400).json({
        success: false,
        message: `Missing message`,
      });
    }

    // Fetch all users
    const users = await userModel.find({});

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: "No users found",
      });
    }

    const userIds = [];
    const notifications = [];

    // Send the announcement email to all users
    await Promise.all(
      users.map(async (user) => {
        try {
          userIds.push(user._id);

          // Prepare email content
          const messageContent = `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>${title}</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; background-color: #f2f2f2; padding: 20px;">
                                <div style="background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">${title}</h2>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;">Dear ${user.user_name},</p>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;">Greetings of the Day,</p>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;"><strong>Title:</strong> <span style="color: #FF5733;">${title}</span></p>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;"><strong>Message:</strong> <span style="color: #3366FF;">${message}</span></p>
                                    <p style="color: #555; font-size: 16px; line-height: 1.6;">If you have any questions, feel free to contact us.</p>
                                </div>
                            </body>
                            </html>`;

          // Send email notification
          await userEmail(user.user_email, "Announcement", messageContent);

          // Collect notification data
          notifications.push({
            userId: user._id,
            title,
            message,
            user_email: user.user_email,
            user_name: user.user_name,
            status: 1,
          });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${user.user_email}: ${emailError.message}`
          );
          // Log or handle failed email notifications if necessary
          notifications.push({
            userId: user._id,
            title,
            message,
            user_email: user.user_email,
            user_name: user.user_name,
            status: 0,
            error_message: emailError.message,
          });
        }
      })
    );

    // Save the notification record
    const savedNotification = await announcement_Model.create({
      title,
      message,
      date: new Date(),
      userIds,
    });

    await savedNotification.save();

    return res.status(200).json({
      success: true,
      message: "Announcement create successfully",
      notification_details: savedNotification,
      failed_notifications: notifications.filter((n) => n.status === 0),
    });
  } catch (error) {
    console.error("Error sending announcements:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
      error_message: error.message,
    });
  }
};

/* Report of Problem section */

// Api for get all the reports of the problem arrise by users
const all_reports_for_problem = async (req, res) => {
  try {
    // check for all reports
    const all_reports = await report_problem_Model
      .find({})
      .sort({ createdAt: -1 })
      .lean();
    if (!all_reports) {
      return res.status(400).json({
        success: false,
        message: "No Proble reports found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All problem reports",
      all_problem_reports: all_reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for resolution of reported problem
const resolution_of_reported_problem = async (req, res) => {
  try {
    const report_id = req.params.report_id;
    const status = req.body.status;

    // Check for report id
    if (!report_id) {
      return res.status(400).json({
        success: false,
        message: "Report Id Required",
      });
    }

    // Check for report for problem
    const report = await report_problem_Model.findOne({ _id: report_id });
    if (!report) {
      return res.status(400).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check for valid status values
    if (![1, 2, 3].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid choice of status",
      });
    }

    // Helper function to create and save notifications
    const createNotification = async (userId, message) => {
      try {
        const newNotification = new userNotificationModel({
          userId: userId,
          message: message,
          date: new Date(),
          status: 1,
        });
        await newNotification.save();
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError);
      }
    };

    // Update report status based on new status value
    switch (status) {
      case 1:
        report.status = "In Progress";
        await createNotification(
          report.userId,
          `Your Request for ${report.problemType} is In Progress`
        );
        break;

      case 2:
        report.status = "Resolved";
        await createNotification(
          report.userId,
          `Your Request for ${report.problemType} is Completed`
        );
        break;

      case 3:
        report.status = "Rejected";
        await createNotification(
          report.userId,
          `Your Request for ${report.problemType} has been Rejected by the provider`
        );
        break;
    }

    // Save the updated report
    await report.save();

    return res.status(200).json({
      success: true,
      message: `Your Report for ${report.problemType} is ${report.status} by the Provider`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* customer support section */

// Api for get all email records for the support team

const email_records_for_support_team = async (req, res) => {
  try {
    // check for all email records of the support team
    const all_email_records = await emailSupport_model
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!all_email_records) {
      return res.status(400).json({
        success: false,
        message: "No email recived from the user yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All Emails",
      record: all_email_records.map((r) => ({
        from: r.from,
        subject: r.subject,
        email_message: r.email_message,
        to: r.to[0],
        attachment: r.attachment,
        status: r.status,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for FAQ
const add_faq_question_for_customer_support = async (req, res) => {
  try {
    const { question, answer } = req.body;
    // check for required fields

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question Required",
      });
    }
    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer Required",
      });
    }

    // check for already exist question
    const exist_ques = await faq_support_Model.findOne({ question });
    if (exist_ques) {
      return res.status(400).json({
        success: false,
        message: "Question Already exist",
      });
    }

    // add new question
    const add_new_question = await new faq_support_Model({
      question,
      answer,
      status: 1,
    });

    await add_new_question.save();

    return res.status(200).json({
      success: true,
      message: "New FAQ Question added",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

module.exports = {
  admin_login,
  update_admin,
  get_admin,
  change_admin_password,
  // forget password
  otpGenerate,
  verify_otp,
  reset_password,
  // user section
  get_all_user,
  get_user_data_by_id,
  activate_deactivate_user,
  add_service,
  get_all_services,
  Generate_Bill,
  get_all_request_for_address_update,
  get_request_for_address_update_for_user,
  accept_reject_user_address_update_request,
  get_all_support_requests,
  update_status_of_support_request,
  sendAnnouncement_message_to_all_user,
  all_reports_for_problem,
  resolution_of_reported_problem,
  email_records_for_support_team,
  add_faq_question_for_customer_support,
};

