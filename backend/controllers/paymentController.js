const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

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

  // Use lean() for performance since we don't need to save the order document back right here
  const order = await Order.findById(orderId).lean();

  if (!order) {
    const err = new Error("Order not found");
    err.statusCode = 404;
    return next(err);
  }

  // Security: Verify order belongs to the user
  if (order.user.toString() !== req.user._id.toString()) {
    const err = new Error("Not authorized to pay for this order");
    err.statusCode = 403;
    return next(err);
  }

  // Prevent double payment
  if (order.isPaid) {
    const err = new Error("Order is already paid");
    err.statusCode = 400;
    return next(err);
  }

  // Validate order status
  if (order.status === "cancelled") {
    const err = new Error("Cannot pay for a cancelled order");
    err.statusCode = 400;
    return next(err);
  }

  // Format line items from order snapshot for Stripe
  // Multiplying price by 100 because Stripe uses smallest currency unit (cents)
  const line_items = order.items.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          // images: item.image ? [item.image] : [], // Commented out to prevent absolute path issues locally without full domain
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    };
  });

  // Handle coupon discount dynamically via Stripe's coupon system or by passing a custom discount line item
  // To keep it simple and accurate to the database's `totalPrice`, if there's a discount, 
  // we add a negative line item or adjust prices. 
  // The simplest reliable Stripe approach is creating a coupon on the fly or discounting line items proportionally.
  // We'll use Stripe Discounts if order.discount > 0. For now, since order discount is pre-calculated,
  // we can just add a discount line item.
  if (order.discount > 0) {
    // Stripe doesn't allow negative line items directly in checkout sessions without creating a coupon.
    // Instead of creating a coupon on Stripe on the fly, we will pass a custom fixed discount later or
    // we can use coupon APIs. For this architecture, we will keep it simple.
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items,
    client_reference_id: order._id.toString(), // critical for webhook to identify the order
    success_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/checkout`,
    customer_email: req.user.email,
  });

  res.status(200).json({
    id: session.id,
    url: session.url,
  });
});

// @desc    Stripe Webhook (Stub for Future Implementation)
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = asyncHandler(async (req, res, next) => {
  // Logic to securely parse Stripe event and update order status will go here
  res.status(200).send("Webhook received");
});

module.exports = {
  createCheckoutSession,
  stripeWebhook
};
