const bkashConfig = require("../config/bkashConfig.json");
const createPayment = require("../action/createPayment.js");
const executePayment = require("../action/executePayment.js");

const checkout = async (req, res) => {
  try {
    console.log("checkout BODY", req.body);

    // Extract user and product information from req.body
    const { email, courseID, name, courseName, image, amount, phone } =
      req.body;

    // Check if any previous transaction with the same course ID and email exists and has a status of "Completed"
    const database = req.app.locals.database;
    const paymentResponse = database.collection("PaymentResponse");
    const existingTransaction = await paymentResponse.findOne({
      courseID: courseID,
      email: email,
      paymentStatus: "Completed",
    });

    if (existingTransaction) {
      console.log("Duplicate transaction: ", courseID, email);
      return res.json({ message: "Duplicate Transaction" });
    }

    // Perform the payment transaction
    const createResult = await createPayment(req.body);
    console.log("Create Successful !!! ");
    res.json(createResult);

    // Save checkout response in the database along with user and product information
    await paymentResponse.insertOne({
      paymentID: createResult.paymentID,
      paymentCreateTime: createResult.paymentCreateTime,
      transactionStatus: createResult.transactionStatus,
      paymentStatus: "Checkout",
      email: email,
      name: name,
      courseID: courseID,
      courseName: courseName,
      image: image,
      amount: amount,
      phone: phone,
      merchantInvoiceNumber: createResult.merchantInvoiceNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const bkashCallback = async (req, res) => {
  try {
    if (req.query.status === "success") {
      const paymentID = req.query.paymentID;
      const database = req.app.locals.database;
      const paymentResponse = database.collection("PaymentResponse");

      // Check if any previous transaction with the same payment ID has a status of "Completed"
      const existingTransaction = await paymentResponse.findOne({
        paymentID: paymentID,
        paymentStatus: "Completed",
      });

      if (existingTransaction) {
        console.log("Duplicate transaction: ", paymentID);
        return res.redirect(
          `${bkashConfig.frontend_success_url}?data=Duplicate Transaction`
        );
      }

      let response = await executePayment(paymentID);

      console.log("bkashCallback", response);

      if (response.statusCode && response.statusCode === "0000") {
        console.log("Payment Successful !!! ");

        // Update the payment status and response data
        await paymentResponse.updateOne(
          { paymentID: paymentID },
          {
            $set: {
              paymentStatus: "Completed",
              responseData: response,
            },
          }
        );

        return res.redirect(
          `${bkashConfig.frontend_success_url}?data=${response.statusMessage}`
        );
      } else if (response.statusCode && response.statusCode === "2029") {
        console.log("Payment Failed (Duplicate Transaction) !!!");

        // Update the payment status and response data
        await paymentResponse.updateOne(
          { paymentID: paymentID },
          {
            $set: {
              paymentStatus: "Failed",
              responseData: response,
            },
          }
        );

        return res.redirect(
          `${bkashConfig.frontend_fail_url}?data=${response.statusMessage}`
        );
      } else {
        console.log("Payment Failed !!!");

        // Update the payment status and response data
        await paymentResponse.updateOne(
          { paymentID: paymentID },
          {
            $set: {
              paymentStatus: "Failed",
              responseData: response,
            },
          }
        );

        return res.redirect(
          `${bkashConfig.frontend_fail_url}?data=${response.statusMessage}`
        );
      }
    } else {
      console.log("Payment Failed !!!");

      const paymentID = req.query.paymentID;
      const database = req.app.locals.database;
      const paymentResponse = database.collection("PaymentResponse");

      // Update the payment status
      await paymentResponse.updateOne(
        { paymentID: paymentID },
        {
          $set: {
            paymentStatus: "Failed",
          },
        }
      );

      return res.redirect(`${bkashConfig.frontend_fail_url}`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = {
  checkout,
  bkashCallback,
};
