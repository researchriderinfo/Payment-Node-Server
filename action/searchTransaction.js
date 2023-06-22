const bkashConfig = require("../config/bkashConfig.json");

const authHeaders = require("../action/authHeader.js");

const searchTransaction = async (trxID) => {
  // console.log("Search Transaction API Start !!!");
  const fetch = require("node-fetch");
  const searchResponse = await fetch(bkashConfig.search_transaction_url, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({
      trxID,
    }),
  });
  const searchResult = await searchResponse.json();
  return searchResult;
};

module.exports = searchTransaction;
