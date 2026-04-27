import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.MAIL_USER || process.env.SMTP_USER,
    pass: process.env.MAIL_PASS || process.env.SMTP_PASS,
  },
})

export const sendWelcomeNewsletterEmail = async (email: string) => {
  try {
    const mailOptions = {
      from: `"Nut Baba" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Nut Baba Newsletter!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <div style="background-color: #3D1B00; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <img src="https://nutbaba.in/images/nut%20baba%20logo.webp" alt="Nut Baba Logo" style="height: 60px; margin-bottom: 10px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Nut Baba!</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hello there!</p>
            
            <p style="font-size: 16px; color: #374151;">Thank you for subscribing to the Nut Baba newsletter. We're "nuts" about health and thrilled to have you part of our community!</p>
            
            <p style="font-size: 16px; color: #374151;">What to expect from us:</p>
            <ul style="color: #374151; font-size: 14px;">
              <li>Exclusive discounts and early access to sales</li>
              <li>New flavor announcements</li>
              <li>Healthy recipes and nutrition tips</li>
              <li>Behind-the-scenes of your favorite peanut butter</li>
            </ul>

            <div style="background-color: #FCF0E5; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
              <p style="font-size: 18px; font-weight: bold; color: #C45C26; margin: 0;">Use Code: WELCOME10</p>
              <p style="font-size: 14px; color: #813302; margin-top: 5px;">Enjoy 10% OFF on your next order!</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="https://nutbaba.in/shop" style="background-color: #C45C26; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold;">Shop Now</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              &copy; ${new Date().getFullYear()} Nut Baba. All rights reserved.
              <br />
              Noida, Uttar Pradesh, India
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Newsletter welcome email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending newsletter email:", error)
    throw error
  }
}

export const sendOrderConfirmationEmail = async (email: string, orderDetails: {
  order_number?: string
  orderNumber?: string
  items: string | unknown[]
  subtotal: number
  shipping_charge?: number
  shippingCharge?: number
  discount_amount?: number
  discountAmount?: number
  total_amount?: number
  totalAmount?: number
}) => {
  try {
    const itemsHtml = typeof orderDetails.items === 'string' ? JSON.parse(orderDetails.items) : orderDetails.items
    
    const itemsList = Array.isArray(itemsHtml) ? itemsHtml.map((item: { name: string; quantity: number; size: string; texture: string; price: number }) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0; font-weight: bold;">${item.name}</p>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">Qty: ${item.quantity} | ${item.size} | ${item.texture}</p>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">Rs. ${item.price * item.quantity}</td>
      </tr>
    `).join('') : ''

    const mailOptions = {
      from: `"Nut Baba" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmed - ${orderDetails.order_number || orderDetails.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #3D1B00; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">NUT BABA</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmed!</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151;">Hello!</p>
            <p style="font-size: 16px; color: #374151;">Great news! Your order <strong>${orderDetails.order_number || orderDetails.orderNumber}</strong> has been confirmed and is being processed.</p>
            
            <h3 style="color: #3D1B00; margin-top: 30px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tbody>
                ${itemsList}
              </tbody>
              <tfoot>
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">Rs. ${orderDetails.subtotal}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                  <td style="padding: 10px; text-align: right;">Rs. ${orderDetails.shipping_charge !== undefined ? orderDetails.shipping_charge : orderDetails.shippingCharge}</td>
                </tr>
                ${(orderDetails.discount_amount || 0) > 0 || (orderDetails.discountAmount || 0) > 0 ? `
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold; color: green;">Discount:</td>
                  <td style="padding: 10px; text-align: right; color: green;">-Rs. ${orderDetails.discount_amount || orderDetails.discountAmount}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #3D1B00;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px; border-top: 2px solid #3D1B00;">Rs. ${orderDetails.total_amount || orderDetails.totalAmount}</td>
                </tr>
              </tfoot>
            </table>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">You can track your order status in the 'My Orders' section of your account.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">Thank you for shopping with Nut Baba!</p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Order confirmation email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending order confirmation email:", error)
  }
}
