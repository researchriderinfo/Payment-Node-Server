const bkashConfig = require("../config/bkashConfig.json");

const authHeaders = require("../action/authHeader.js");

const queryPayment = async (paymentID) => {
  // console.log("Query Payment API Start !!!");
  const fetch = require("node-fetch");
  const queryResponse = await fetch(bkashConfig.query_payment_url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      paymentID,
    }),
  });
  const queryResult = await queryResponse.json();
  return queryResult;
};

module.exports = queryPayment;
