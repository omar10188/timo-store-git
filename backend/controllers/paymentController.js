const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_dummy");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/checkout-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    const err = new Error("Order ID is required");
    err.statusCode = 400;
    return next(err);
  }

  const order = await Order.findById(orderId).lean();

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    return next(err);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    const err = new Error("Not authorized to pay for this order");
    err.statusCode = 403;
    return next(err);
  }

  if (order.isPaid) {
    const err = new Error("Order is already paid");
    err.statusCode = 400;
    return next(err);
  }

  if (order.status === "cancelled") {
    const err = new Error("Cannot pay for a cancelled order");
    err.statusCode = 400;
    return next(err);
  }

  const line_items = order.items.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    client_reference_id: order._id.toString(), 
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout`,
    customer_email: req.user.email,
  });

  res.status(200).json({
    id: session.id,
    url: session.url,
  });
});

// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body is a Buffer here because of express.raw() in server.js
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.client_reference_id;

    if (orderId) {
      const order = await Order.findById(orderId);

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        order.stripePaymentIntentId = session.payment_intent;
        
        await order.save();
        console.log(`✅ Order ${orderId} marked as paid from webhook`);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
});

module.exports = {
  createCheckoutSession,
  stripeWebhook
};
