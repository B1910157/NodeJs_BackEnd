const ApiError = require("../api-error");
const keyStripe =
  "sk_test_51NN6emCgP1gVHhXPRRYjy19cMZAIq6VFZSyPvTvm56tz83RXK5FxEsr0UKPNLOCmqR2ouDSFu9W8S1a9JvXnYL5u00HRJ8gaXn";
const stripe = require("stripe")(keyStripe);

exports.getCustomerByEmail = async (req, res, next) => {
  try {
    const customers = await stripe.customers.list({
      email: "tinteststripe@gmail.com",
    });
    if (customers && customers.data.length > 0) {
      const customer = customers.data[0];
      // Bạn có thể truy cập thông tin của khách hàng từ đây
      console.log(customer.id);
      return res.send(customer);
    } else {
      // Không tìm thấy khách hàng với địa chỉ email cụ thể
      console.log("Không tìm thấy khách hàng.");
    }
  } catch (error) {}
};

//TODO
exports.create_payment = async (req, res, next) => {
  try {
    const { items } = req.body;
    // console.log(items);

    // Tính tổng số tiền
    const calculateOrderAmount = () => {
      // Trong ví dụ này, chúng ta giả định rằng items là một mảng các sản phẩm
      // và mỗi sản phẩm có một giá tiền.
      // Bạn có thể tính toán tổng số tiền dựa trên nhu cầu của bạn.
      return items.reduce((total, item) => total + item.price, 0);
    };
    // console.log(calculateOrderAmount());

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(),
      currency: "vnd",
      metadata: {
        percent: req.body.percent, // Thêm trường tùy chỉnh
      },
      customer: "cus_OmVU53JTJPDXDQ",
      //   payment_method: "",
    });

    res.status(200).send(paymentIntent);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong." });
  }
};

exports.getOnePaymentById = async (req, res, next) => {
  try {
    const paymentIntentId = req.params.idPayment;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    res.status(200).send(paymentIntent);
  } catch (error) {
    console.error("Error fetching payment intent:", error);
    throw error;
  }
};

exports.getAllSuccessfulPayments = async (req, res, next) => {
  try {
    // Truy vấn tất cả các phiếu thanh toán có trạng thái "succeeded"
    const successfulPayments = await stripe.paymentIntents.list({
      limit: 100, // Số lượng kết quả muốn lấy (tùy chọn)
      //   status: "succeeded", // Trạng thái thành công
    });

    res.status(200).send(successfulPayments.data);
  } catch (error) {
    console.error("Error fetching successful payments:", error);
    throw error;
  }
};

//TODO
exports.createCustomer = async (req, res, next) => {
  try {
    // Tạo một khách hàng trong Stripe
    const customer = await stripe.customers.create({
      email: "customer@example.com",
      source: "tok_visa", // Đây là token thẻ tín dụng được tạo từ phía máy khách (frontend).
    });
  } catch (error) {}
};

// //TODO
// exports.addFundsToCustomer = async (req, res, next) => {
//   try {
//     const { customerId, amountToAdd } = req.body;
//     console.log(req.body);

//     // Tạo một giao dịch top-up cho khách hàng
//     const topUp = await stripe.topups.create({
//       amount: amountToAdd, // Số tiền bạn muốn thêm
//       currency: "vnd",
//       description: "Top-up for customer", // Mô tả giao dịch
//       statement_descriptor: "Funds", // Mô tả trên trích dẫn tài khoản ngân hàng
//       customer: customerId, // ID của khách hàng cần nạp tiền
//     });

//     // Xác nhận giao dịch top-up
//     await stripe.topups.confirm(topUp.id);

//     res.status(200).send({ message: "Funds added successfully." });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ error: "Something went wrong." });
//   }
// };

//TODO
exports.addFundsToCustomer = async (req, res, next) => {
  try {
    const { customerId, amountToAdd } = req.body;

    // Tạo một phiên làm việc (checkout session) cho giao dịch nạp tiền
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: "https://google.com", // URL sau khi thanh toán thành công
      cancel_url: "https://google.com", // URL sau khi hủy bỏ
      line_items: [
        {
          price_data: {
            currency: "vnd",
            product_data: {
              name: "Top-up",
              description: "Add funds to your account",
            },
            unit_amount: amountToAdd, // Số tiền bạn muốn thêm
          },
          quantity: 1,
        },
      ],
      customer: customerId, // ID của khách hàng
    });

    res.status(200).send({ sessionId: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Something went wrong." });
  }
};
