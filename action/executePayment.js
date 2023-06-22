const bkashConfig = require("../config/bkashConfig.json");
const authHeaders = require("../action/authHeader.js");

const executePayment = async (paymentID) => {
  // console.log("Execute Payment API Start !!!");
  const fetch = (await import("node-fetch")).default;
  const executeResponse = await fetch(bkashConfig.execute_payment_url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      paymentID,
    }),
  });
  const executeResult = await executeResponse.json();
  console.log({ executeResult });
  return executeResult;
};

module.exports = executePayment;
