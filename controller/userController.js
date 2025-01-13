const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const userEmail = require("../utils/userEmail");
const user_otp_model = require("../model/user_otp");
const userNotificationModel = require("../model/user_notification");
const chatSupportModel = require("../model/chat_support");
const htmlPdf = require("html-pdf-node");
const Bill_Model = require("../model/user_bill");
const address_update_model = require("../model/address_update_request");
const adminNotificationModel = require("../model/admin_notification");
const support_request_model = require("../model/support_request");
const announcement_Model = require("../model/announcement");
const report_problem_Model = require("../model/report_a_problem");
const emailSupport_model = require("../model/emailSupport");
const faq_support_Model = require("../model/faqSupport");
const TransactionModel = require("../model/transactionModel");
const validator = require("validator");
const nodemailer = require("nodemailer");
const adminModel = require("../model/admin");
const mongoose = require("mongoose");
const { request } = require("express");

/*  User panel */

// Api for signup User

const user_signup = async (req, res) => {
  try {
    const { user_name, user_email, password, phone_no, street, city, zip , current_balance_electricity,current_balance_water } =
      req.body;

    // Check for required fields
    const requiredFields = [
      "user_name",
      "user_email",
      "password",
      "phone_no",
      "street",
      "city",
      "zip",
    ];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Required ${field.replace("_", " ")}`,
        });
      }
    }

    // Check if user already exists
    const exist_user = await userModel.findOne({ user_email });
    if (exist_user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Check if profile image is uploaded
    if (!req.file || !req.file.filename) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }
    const profileImage = req.file.filename;

    // Secure the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add new user
    const new_user = new userModel({
      user_name,
      user_email,
      phone_no,
      profileImage,
      password: hashedPassword,
      address: {
        street,
        city,
        zip,
      },
      current_balance_electricity,
      current_balance_water
    });

    await new_user.save();

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// update user details

const update_user_details = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id required",
      });
    }

    const { user_name, user_email, phone_no ,current_balance_electricity,current_balance_water } = req.body;

    const userData = await userModel.findOne({ _id: userId });

    if (!userData) {
      return res.status(400).json({
        success: false,
        message: `user data not found with this id :${userId}`,
      });
    }

    if (req.file) {
      let allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Image type should be in the format jpeg, jpg,png and gif",
        });
      }
      userData.profileImage = req.file.filename || userData.profileImage;
    }

    userData.user_name = user_name || userData.user_name;
    userData.user_email = user_email || userData.user_email;
    userData.phone_no = phone_no || userData.phone_no;
    userData.current_balance_electricity = current_balance_electricity || userData.current_balance_electricity;
    userData.current_balance_water = current_balance_water || userData.current_balance_water;

    await userData.save();
    return res.status(200).json({
      success: true,
      message: "User data updated successfully",
      data: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};

// Api for user login

// const user_login = async (req, res) => {
//   try {
//     const { user_email, password } = req.body;
//     // check for required fields

//     const requiredFields = ["user_email", "password"];
//     for (let field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({
//           success: false,
//           message: `Required ${field.replace("_")(" ")}`,
//         });
//       }

//       // check for user
//       const user = await userModel.findOne({ user_email });
//       if (!user) {
//         return res.status(400).json({
//           success: false,
//           message: "User Not found",
//         });
//       }
//       if (user.status === 0) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Your account is suspended , please content to service provider ",
//         });
//       }
//       // check for user password
//       const ispasswordValid = await bcrypt.compare(password, user.password);
//       if (!ispasswordValid) {
//         return res.status(400).json({
//           success: false,
//           message: "Password Incorrect",
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         message: "User login Successfully",
//         user_details: {
//           id: user._id,
//           user_name: user.user_name,
//           user_email: user.user_email,
//           password: user.password,
//           phone_no: user.phone_no,
//           profileImage: user.profileImage,
//           status: user.status,
//           address: user.address,
//         },
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error_message: error.message,
//     });
//   }
// };

const user_login = async (req, res) => {
  try {
    const { user_email, password } = req.body;

    // Check for required fields
    const requiredFields = ["user_email", "password"];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Required field: ${field.replace("_", " ")}`,
        });
      }
    }

    // Check if user exists
    const user = await userModel.findOne({ user_email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const admin = await adminModel.find();
    console.log(admin);

    // Check if the account is suspended
    if (user.status === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is suspended. Please contact the service provider.",
      });
    }

    // Verify password
    if (user.password && user.password.startsWith("$2b$")) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          success: false,
          message: "Password is incorrect",
        });
      }
    } else {
      // If the password is not hashed, hash and save it for security
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
      await user.save();
    }

    // Prepare user details for response
    const userDetails = {
      id: user._id,
      user_name: user.user_name,
      user_email: user.user_email,
      phone_no: user.phone_no,
      profileImage: user.profileImage,
      status: user.status,
      address: user.address,
      adminId: admin[0]._id,
    };

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user_details: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// user change password
const user_change_password = async (req, res) => {
  try {
    console.log("gjg");

    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide old password",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide new password",
      });
    }

    if (!confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide confirm new password",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password can't be the same",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message:
          "The passwords do not match. Please ensure your new passwords match.",
      });
    }

    const userData = await userModel.findOne({ _id: userId });
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: `User data not found with this id  : ${userId}`,
      });
    }

    const comparePassword = await bcrypt.compare(
      oldPassword,
      userData.password
    );
    if (!comparePassword) {
      return res.status(400).json({
        success: false,
        message: "Your old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = hashedPassword;
    userData.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Api for forget password
function isValidEmail(user_email) {
  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(user_email);
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp.slice(0, 6);
}

// Api for opt generate
const user_otpGenerate = async (req, res) => {
  try {
    const { user_email } = req.body;
    // check for email
    if (!user_email || !isValidEmail(user_email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    // check for user
    const user = await userModel.findOne({ user_email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    // Save the OTP in the otpModel
    const otpData = {
      userId: user._id,
      otp: otp,
    };
    await user_otp_model.create(otpData);
    const userEmailContent = `<!DOCTYPE html>
                             <html lang="en">
                             <head>
                                 <meta charset="UTF-8">
                                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                 <title>Forgot Password - Reset Your Password</title>
                             </head>
                             <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                                 <div style="width: 80%; max-width: 600px; margin: 40px auto; padding: 30px; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                                     <section>
                                         <h2 style="color: #333; font-size: 24px; text-align: center; margin-bottom: 20px; font-weight: normal;">Dear ${user.user_name}</h2>
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
    await userEmail(user.user_email, `OTP Email`, userEmailContent);
    await user.save();

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
const user_verify_otp = async (req, res) => {
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

    const check_otp = await user_otp_model.findOne({
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
      userId: check_otp.userId,
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

const user_reset_password = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { newPassword, confirmPassword } = req.body;

    // check for required fileds
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
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

    // check for user
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
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
    user.password = hashedNewPassword;

    // check for otp
    await user_otp_model.deleteOne({ userId: userId });

    const userEmailContent = `<p style="text-align: center; font-size: 20px; color: #333; font-weight: 600; margin-bottom: 30px;">Congratulations! Your Password Has Been Reset</p>
                             <p style="text-align: center; font-size: 16px; color: #666; margin-bottom: 20px;">Here are your account details:</p>
 
                             <div style="display: flex; justify-content: center; align-items: center;">
                                 <div style="width: auto; max-width: 500px; background-color: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); padding: 20px;">
                                     <table style="width: 100%; border-collapse: collapse;">
                                         <tr style="background-color: #fff;">
                                             <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px; border-bottom: 1px solid #e0e0e0;">Email:</td>
                                             <td style="padding: 14px 20px; text-align: left; font-size: 16px; border-bottom: 1px solid #e0e0e0;">${user.user_email}</td>
                                         </tr>
                                         <tr style="background-color: #fff;">
                                             <td style="padding: 14px 20px; text-align: left; font-weight: 600; font-size: 16px;">Password:</td>
                                             <td style="padding: 14px 20px; text-align: left; font-size: 16px;">${newPassword}</td>
                                         </tr>
                                     </table>
                                 </div>
                             </div>
                                         `;

    await userEmail(user.user_email, `Reset Password`, userEmailContent);
    await user.save();
    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `Your Password Reset Successfully `,
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
      message: "User Password reset successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      error_message: error.message,
    });
  }
};

/* Bill Section */
// Api for get user bills
const get_user_bills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { service_type } = req.query;

    // Check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    // Check for user
    const user = await userModel.findOne({ _id: userId }).lean();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Build the query filter based on service_type
    let query = { userId };
    if (service_type) {
      query.service_type = service_type;
    }

    // Fetch the user bills based on the query
    const user_bills = await Bill_Model.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Check if there are no bills
    if (!user_bills || user_bills.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No bills found for ${service_type || "all services"}`,
      });
    }

    // Return the user bills
    return res.status(200).json({
      success: true,
      message: `Your ${service_type || "all"} bills`,
      Bill: user_bills.map((s) => ({
        service_type: s.service_type,
        Bill_period: s.billing_period,
        unit_consumed: s.unit_consumed,
        total_amount: s.total_amount,
        due_date: s.due_date,
        bill_status: s.bill_status,
        Bill: s.bill_pdf,
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

/* Service request Section  */
const request_for_address_update = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { street, city, zip, status } = req.body;

    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user Id required",
      });
    }

    // check for user
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    // check for required fields
    const requiredFields = ["street", "city", "zip"];
    for (let fields of requiredFields) {
      if (!req.body[fields]) {
        return res.status(400).json({
          success: false,
          message: `Required ${fields.replace("_")(" ")}`,
        });
      }
    }

    // check for already exist request
    const exist_req = await address_update_model.findOne({
      userId,
      status: "Pending",
    });
    if (exist_req) {
      return res.status(400).json({
        success: false,
        message: "Request already send",
      });
    }
    // Add ID proof
    const id_proof = req.file.filename;

    if (!id_proof) {
      return res.status(400).json({
        success: false,
        message: "Id proof required",
      });
    }
    // send request
    const sendReq = new address_update_model({
      userId,
      newAddress: {
        street,
        city,
        zip,
      },
      idProof: id_proof,
      status: "Pending",
    });
    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `We have received your request, will get to work on it shortly.`,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      // Handle notification creation error
      console.error("Error creating notification:", notificationError);
      // Optionally, you can choose to return an error response here or handle it in another way
    }
    try {
      var newNotification = new adminNotificationModel({
        message: `Request Recieved from user , for address update`,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      // Handle notification creation error
      console.error("Error creating notification:", notificationError);
    }

    await sendReq.save();
    res.status(200).json({
      success: true,
      message: "Request Send Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

function generateRandomNumber(length) {
  let result = "";
  const characters = "0123456789";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

/* support request Section */

const request_for_support = async (req, res) => {
  try {
    const { userId } = req.params;
    const { serviceName, issue_message, street, city, zip } = req.body;

    // Check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id required",
      });
    }

    // Check for user
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for required fields
    const requiredFields = [
      "serviceName",
      "issue_message",
      "street",
      "city",
      "zip",
    ];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `Required ${field.replace("_", " ")}`,
        });
      }
    }

    // Add photos of the issue if they exist
    const images = req.files ? req.files.map((file) => file.filename) : [];
    const randomNumber = generateRandomNumber(6);
    const request_id = `REQ${randomNumber}`;
    // Create new support request
    const newRequest = new support_request_model({
      userId,
      request_id,
      serviceName,
      user_name: user.user_name,
      issue_message,
      address: {
        street,
        city,
        zip,
      },
      upload_photos: images,
      request_Date: Date.now(),
      status: "Pending",
      contactDetails: {
        email: user.user_email,
        phoneNumber: user.phone_no,
      },
    });

    // Save the new request
    await newRequest.save();
    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `Your request for ${serviceName}, recieved Successfully , our team will get to work on it shortly `,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    try {
      var newNotification = new adminNotificationModel({
        message: `Request Recieved from user , for ${serviceName}`,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return res.status(200).json({
      success: true,
      message: "Your request has been added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// check for user request for support
const get_user_requests_for_support = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check for userID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    // check for user requests for support
    const user_requests = await support_request_model
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    if (!user_requests) {
      return res.status(400).json({
        success: false,
        message: "No Support Request found for the user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Requests for Support",
      user_requests: user_requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Notifications & Annoucement section */
// Api for get all announcements
const get_all_announcemnets = async (req, res) => {
  try {
    const all_announcemnets = await announcement_Model
      .find({})
      .sort({ createdAt: -1 })
      .lean();
    if (!all_announcemnets) {
      return res.status(400).json({
        success: false,
        message: "No announcment yet",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All Announcement",
      data: all_announcemnets.map((m) => ({
        title: m.title,
        message: m.message,
        anncuncement_date: m.date,
        status: m.status,
        anncuncementId: m._id,
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

// get all Notification of the user

const all_notification_of_user = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    // check for notification
    const user_notification = await userNotificationModel
      .find({ userId, status: 1 })
      .sort({ createdAt: -1 })
      .lean();
    if (!user_notification) {
      return res.status(400).json({
        success: false,
        message: "No notification recived yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All Notification",
      all_notification: user_notification.map((noti) => ({
        message: noti.message,
        status: noti.status,
        Date: noti.date,
        notification_id: noti._id,
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

// Api for get all notification count of user
const all_notification_count_of_user = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    // check for notification
    const user_notification = await userNotificationModel
      .find({ userId, status: 1 })
      .sort({ createdAt: -1 })
      .lean();
    if (!user_notification) {
      return res.status(400).json({
        success: false,
        message: "No notification recived yet",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All Notification Count",
      all_notification_count: user_notification.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for seen particular notification of the user
const seen_notification = async (req, res) => {
  try {
    const notification_id = req.params.notification_id;

    // Validate notification ID
    if (!notification_id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    // Find the notification by ID
    const notification = await userNotificationModel.findById(notification_id);

    // Check if notification exists
    if (!notification) {
      return res.status(400).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if notification has already been seen
    if (notification.status === 1) {
      return res.status(200).json({
        success: false,
        message: "Notification already seen",
      });
    }

    // Update notification status to seen
    notification.status = 1;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as seen",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

/* Report Problem Section */

// Api for report problem
const report_problem = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { problemType, description, street, city, zip, date_of_incident } =
      req.body;

    // Check for required fields
    const requiredFields = { problemType, description, street, city, zip };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({
          success: false,
          message: `Required field: ${field}`,
        });
      }
    }
    // Check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for uploaded problem photos
    const reportImages = req.files
      ? req.files.map((file) => file.filename)
      : [];

    // Add new report
    const newReport = new report_problem_Model({
      userId,
      user_name: user.user_name,
      problemType,
      description,
      problem_photo: reportImages,
      date_of_incident: date_of_incident,
      address: {
        street,
        city,
        zip,
      },
      status: "Pending",
    });

    await newReport.save();

    try {
      var newNotification = new userNotificationModel({
        userId: userId,
        message: `Your request for ${problemType}, recieved Successfully , our team will get to work on it shortly `,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    try {
      var newNotification = new adminNotificationModel({
        message: `Request Recieved from user , for ${problemType}`,
        date: new Date(),
        status: 1,
      });

      await newNotification.save();
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return res.status(200).json({
      success: true,
      message: `${problemType} report submitted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for get user all reports for problem arrise
const get_user_all_reports_for_problem = async (req, res) => {
  try {
    const userId = req.params.userId;
    // check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id required",
      });
    }
    // check for all user reports for the problem
    const all_reports = await report_problem_Model
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!all_reports) {
      return res.status(400).json({
        success: false,
        message: "No Reports found for the user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All reports",
      all_reports: all_reports.map((report) => ({
        user_name: report.user_name,
        problemType: report.problemType,
        status: report.status,
        date_of_incident: report.date_of_incident,
        address: `${report.address.street}, ${report.address.city}, zip - ${report.address.zip}`,
        problem_photo: report.problem_photo,
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

/*  Customer Support section */

// Api for send email to support agent
const send_email_to_support_team = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { to, subject, email_message } = req.body;

    // Check for userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId required",
      });
    }

    // Check for required fields
    if (
      !to ||
      (typeof to === "string" && !validator.isEmail(to)) ||
      (Array.isArray(to) && to.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Receiver email(s) required",
      });
    }

    let recipientEmails = typeof to === "string" ? [to] : to;

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required",
      });
    }

    // Validate receiver emails
    for (let email of recipientEmails) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: `Invalid email address in receiver list: ${email}`,
        });
      }
    }

    // Check for user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    // Setup nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Handle attachments
    let attachments = [];
    let attachmentFiles =
      req.files && req.files.length > 0
        ? req.files.map((file) => file.filename)
        : [];

    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
        contentType: file.mimetype,
      }));
    }

    // Prepare email options
    const mailOptions = {
      from: user.user_email,
      to: recipientEmails.join(", "),
      subject: subject,
      html: email_message || "Please find the attached file(s).",
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    // Send email
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        // Save failed email attempt
        await emailSupport_model.create({
          userId: userId,
          to: recipientEmails,
          from: user.user_email,
          subject: subject,
          email_message: email_message,
          attachment: attachmentFiles,
          status: 0,
        });

        return res.status(500).json({
          success: false,
          message: "Error sending email",
          error_message: error.message,
        });
      } else {
        // Save successful email attempt
        await emailSupport_model.create({
          userId: userId,
          to: recipientEmails,
          from: user.user_email,
          subject: subject,
          email_message: email_message,
          attachment: attachmentFiles,
          status: 1,
        });

        return res.status(200).json({
          success: true,
          message: "Email sent successfully",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error_message: error.message,
    });
  }
};

// Api for get all the FAQ for customer support
const get_all_FAQ = async (req, res) => {
  try {
    const all_faq = await faq_support_Model
      .find({})
      .sort({ createdAt: -1 })
      .lean();

    if (!all_faq) {
      return res.status(400).json({
        success: false,
        message: "No FAQ Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "All FAQ",
      faq: all_faq.map((f) => ({
        Question: f.question,
        Answer: f.answer,
        faq_id: f._id,
        status: f.status,
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

// add money in user ballance
const add_balance = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Enter user id",
      });
    }

    const userData = await userModel.findOne({ _id: userId });
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

      const { balance , topupType , paymentMethod, paymentResponse , paymentKey} = req.body;
    if (!balance) {
      return res.status(400).json({
        success: false,
        message: "Balance Required",
      });
    }
            
    if(!topupType)
    {
        return res.status(400).json({
            success : false ,
            message : 'topup Type Required'
        })
    }

    if (topupType === 1 ){
      service_Type = "Electricity"
    }
    if (topupType ===2) {
      service_Type = "Water"
    }
    const transactionData = {
      userId: userData._id,
      amount: balance,
      transactionType : 'TopUp',
      service_Type ,
      paymentMethod,
      // transactionStatus,
    };
    
    const transaction = new TransactionModel(transactionData);
    await transaction.save();

        if(topupType === 1)
        {
             userData.current_balance_electricity += balance 
        }
        else if(topupType === 2)
          {
               userData.current_balance_water += balance 
          }
          else
          {
              return res.status(400).json({
                   success : false ,
                   message : 'Invalid Choice of topUp type'
              })
          }
 
    await userData.save();

    return res.status(200).json({
      success: true,
      message: "Balance added successfully",
      data:{transactionData,userData},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const pay_bill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { paymentMethod, transactionStatus } = req.body;

    if (!billId) {
      return res.status(400).json({
        success: false,
        message: "Bill id is required",
      });
    }

    const userBillData = await Bill_Model.findOne({ _id: billId });
    if (!userBillData) {
      return res.status(404).json({
        success: false,
        message: "Bill not found or user not associated with the bill",
      });
    }

    const userData = await userModel.findOne({ _id: userBillData.userId });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userBillData.total_amount > userData.current_balance_electricity && userBillData.service_type === "electricity") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance to pay the electricity bill",
      });
    }
      
    if (userBillData.total_amount > userData.current_balance_water && userBillData.service_type === "water") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance to pay the water bill",
      });
    }
    
    const transactionData = {
      userId: userBillData.userId,
      billId,
      amount: userBillData.total_amount,
      serviceProviderId: userBillData.service,
      service_Type: userBillData.service_type,
      transactionType : 'BillPay',
      paymentMethod,
      transactionStatus,
      dueDate: userBillData.due_date,
    };
    
    const transaction = new TransactionModel(transactionData);
    await transaction.save();

    if (transaction.transactionStatus === "successful") {
      if (userBillData.service_type === "Electricity") {
        userData.current_balance_electricity -= userBillData.total_amount;
        console.log(userData)
      } else if (userBillData.service_type === "Water") {
        userData.current_balance_water -= userBillData.total_amount;
      }
      
      userBillData.bill_status = "paid";
      await userBillData.save();
      
      await userData.save();
      
      return res.status(200).json({
        success: true,
        message: "Bill paid successfully",
        data: {
          transaction,
          bill: userBillData,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Transaction failed. Bill not paid.",
        data: {
          transaction,
          bill: userBillData,
        },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Api for delete notification

// delete particular notification by id

const delete_notification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }
    const notificationData = await userNotificationModel.findByIdAndDelete(
      notificationId
    );
    if (!notificationData) {
      return res.status(400).json({
        success: false,
        message: "No notification data found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification data deleted successfully",
      data: notificationData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// delete all notification by patient id

const delete_all_notification_by_userId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user id is requried",
      });
    }

    const deleteNotifications = await userNotificationModel.deleteMany({
      userId,
    });
    if (!deleteNotifications) {
      return res.status(400).json({
        success: false,
        message: "No notifications found for the specified user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notifications deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const agg = async (req, res) => {
  try {
    const aggMethod = await userModel.aggregate([
      {
        $match: {
          status: { $eq: 1 },
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          user_name: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Success",
      data: aggMethod,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const chat_support = async (req, res) => {
  try {
    const { supportAgentId, userId, message, status, isAdmin } = req.body;
    if (!supportAgentId) {
      return res.status(400).json({
        success: false,
        message: "Support Agent id is required",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user id is required",
      });
    }
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const adminData = await adminModel.findById(supportAgentId);
    if (!adminData) {
      return res.status(400).json({
        success: false,
        message: "support agent id not found",
      });
    }

    let attachmentFiles = [];
    if (req.files) {
      // console.log(req.files)
      const images = req.files;
      attachmentFiles = images.map((file) => {
        console.log(file.filename);
        return file.filename;
      });
      console.log(attachmentFiles);
    }
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "user id not found",
      });
    }

    const chatSupportData = new chatSupportModel({
      supportAgentId,
      userId,
      message,
      supportAgentName: adminData.name,
      userName: userData.user_name,
      status,
      attachment: attachmentFiles,
      isAdmin,
    });

    await chatSupportData.save();

    return res.status(200).json({
      success: true,
      message: "chat added successfully",
      data: chatSupportData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const get_chat_support_by_id = async (req, res) => {
  try {
    const { userId } = req.params;

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: `User data not found with this id :${userId}`,
      });
    }

    const chatData = await chatSupportModel
      .find({ userId })
      .sort({ createdAt: 1 }); // Sort by createdAt in ascending order
    if (!chatData) {
      return res.status(400).json({
        success: false,
        message: "Chat data is empty",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Chat data retrieved successfully",
      response: chatData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// delete particular chat 

const delete_single_chat = async(req,res)=>{
  try {
    const chatId = req.params.chatId
    if(!chatId){
      return res.status(400).json({
        success : false,
        message : "Chat id is required"
      })
    }
      const deletedChat  = await chatSupportModel.findByIdAndDelete(chatId)
      if(!deletedChat){
        return res.status(400).json({
          success : false,
          message :  `Chat not found or already deleted.`
        })
      }
    return res.status(200).json({
      success : true,
      message : "Chat deleted successfully",
      data : deletedChat
    })
  } catch (error) {
    return res.status(500).json({
      success : false,
      message:"Internal Server Error",
      error : error.message
    })
  }
}

// delete chat by user ID

const delete_all_chat = async(req,res)=>{
  try {
    const userId = req.params.userId
    // console.log(userId)
    if(!userId){
      return res.status(400).json({
        success : false,
        message : "User id is required"
      })
    }
    const allDeletedChat= await chatSupportModel.deleteMany({userId})
    console.log(allDeletedChat)
    if(!allDeletedChat){
      return res.status(400).json({
        success : false, 
        message : "No chats found for the given user."
      })
    }

    return res.status(200).json({
      success : true,
      message : "All chat deleted successfully",
      data : allDeletedChat
    })

  }catch(error){
    return res.status(500).json({
      success : false,
      message:"Internal Server Error",
      error : error.message
    })
  }
}

// const get_chat_support_by_id = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { isAdmin } = req.query;
//     const isAdminNum = Number(isAdmin)
//     console.log(isAdminNum);
//     if (!userId) {
//       return res.status(400).json({
//         success: false,
//         message: "User Id is required"
//       });
//     }

//     const userData = await userModel.findById(userId);
//     if (!userData) {
//       return res.status(400).json({
//         success: false,
//         message: `User data not found with this id :${userId}`
//       });
//     }

//     const chatData = await chatSupportModel.find({isAdmin:isAdminNum,userId}).sort({ createdAt: 1 }); // Sort by createdAt in ascending order
//     if (!chatData || chatData.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Chat data is empty"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Chat data retrieved successfully",
//       response: chatData
//     });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error"
//     });
//   }
// };

const transactionHistory = async(req,res)=>{
  try {
    const {userId} = req.params
    const {transactionType} = req.query
    if(!userId){
      return res.status(400).json({
        success : false,
        message :  "User id is required"
      })
    }
    const transactionData = await TransactionModel.findOne({userId})
    if(!transactionData){
      return res.status(400).json({
        success : false,
        message : "Not any transaction found for this id"
      })
    }
    
    const filter = {userId}
    if(transactionType){
      filter.paymentMethod=transactionType
    }

    console.log(filter)

    const filteredTransactionData = await TransactionModel.find(filter).sort({transactionDate : 1})

    console.log(filteredTransactionData);
    
    if(!filteredTransactionData){
      return res.status(400).json({
        success : false,
        message : "No transactions found matching the provided criteria"
      })
    }

    return res.status(200).json({
      success : true,
      message: "Transaction history retrieved successfully",
      data : filteredTransactionData
    })

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "Internal Server Error",
      error : error.message
    })
  }
}

module.exports = {
  user_signup,
  update_user_details,
  user_login,
  user_change_password,
  // forget password,
  agg,
  user_otpGenerate,
  user_verify_otp,
  user_reset_password,
  //bill
  get_user_bills,
  request_for_address_update,
  request_for_support,
  get_user_requests_for_support,
  get_all_announcemnets,
  all_notification_of_user,
  all_notification_count_of_user,
  seen_notification,
  report_problem,
  get_user_all_reports_for_problem,
  send_email_to_support_team,
  get_all_FAQ,
  add_balance,
  pay_bill,
  delete_notification,
  delete_all_notification_by_userId,
  pay_bill,
  chat_support,
  get_chat_support_by_id,
  delete_single_chat,
  delete_all_chat,
  transactionHistory
};

