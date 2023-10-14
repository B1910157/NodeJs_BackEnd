const config = {
  app: {
    port: process.env.PORT || 3000,
    tmnCode: "94YO2DYF", // Đặt giá trị tmnCode
    vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    secretKey: "KFATEEWIEDBAUCLEHICXZZEWAEUJDLMG", // Đặt giá trị secretKey
    returnUrl: "http://localhost:3001", // Đặt giá trị returnUrl
  },
  db: {
    uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/partyplanner1",
  },
  //   tmnCode: "94YO2DYF",
  //   secretKey: "KFATEEWIEDBAUCLEHICXZZEWAEUJDLMG",
  //   vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  //   returnUrl: "http://localhost:3001",
};
module.exports = config;
