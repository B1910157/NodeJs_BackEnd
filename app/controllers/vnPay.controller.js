const ApiError = require("../api-error");
const axios = require("axios");
const crypto = require("crypto");
// app.set("trust proxy", true);
function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.create_vnPayment = async (req, res, next) => {
  try {
    var ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    console.log("ip", ipAddr);
    // ipAddr = "";

    // var config = require("./config");
    var dateFormat = require("dateformat");

    var tmnCode = "94YO2DYF";
    var secretKey = "KFATEEWIEDBAUCLEHICXZZEWAEUJDLMG";
    var vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    var returnUrl = "http://localhost:3001/";

    var date = new Date();

    var createDate = dateFormat(date, "yyyymmddHHmmss");
    var orderId = dateFormat(date, "HHmmss");
    var amount = 10000;
    var bankCode = "NCB";

    var orderInfo = "Chuyentien";
    var orderType = "billpayment";
    var locale = "vn";
    if (locale === null || locale === "") {
      locale = "vn";
    }
    var currCode = "VND";
    var vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    // vnp_Params["vnp_Merchant"] = "";
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = orderInfo;
    vnp_Params["vnp_OrderType"] = orderType;
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode !== null && bankCode !== "") {
      vnp_Params["vnp_BankCode"] = bankCode;
    }
    vnp_Params = sortObject(vnp_Params);

    var querystring = require("qs");
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
    console.log(vnp_Params);
    return res.status(200).send({ vnpUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong with vn pay." });
  }
};

exports.test = async (res, req, next) => {
  try {
  } catch (error) {}
};
