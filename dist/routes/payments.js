import express from 'express';
const { Router } = express;
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../config/db.js';
const router = Router();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
// Create Razorpay order
router.post('/razorpay/create', async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: orderId,
        };
        const razorpayOrder = await razorpay.orders.create(options);
        // Update order with razorpay order id
        await pool.query('UPDATE orders SET razorpay_order_id = ? WHERE id = ?', [razorpayOrder.id, orderId]);
        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        });
    }
    catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
});
// Verify Razorpay payment
router.post('/razorpay/verify', async (req, res) => {
    try {
        const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
        const body = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');
        const isAuthentic = expectedSignature === razorpaySignature;
        if (isAuthentic) {
            await pool.query(`UPDATE orders SET 
          payment_status = 'paid',
          razorpay_payment_id = ?,
          order_status = 'confirmed'
        WHERE id = ?`, [razorpayPaymentId, orderId]);
            res.json({ verified: true, message: 'Payment verified successfully' });
        }
        else {
            await pool.query(`UPDATE orders SET payment_status = 'failed' WHERE id = ?`, [orderId]);
            res.status(400).json({ verified: false, message: 'Payment verification failed' });
        }
    }
    catch (error) {
        console.error('Payment verification failed:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
});
// Initiate UPI payment
router.post('/upi/initiate', async (req, res) => {
    try {
        const { orderId, upiId, amount } = req.body;
        // In a real implementation, you would integrate with a UPI payment gateway
        // For now, we'll just update the order status
        await pool.query(`UPDATE orders SET 
        upi_id = ?,
        payment_method = 'upi',
        order_status = 'pending'
      WHERE id = ?`, [upiId, orderId]);
        res.json({ success: true, message: 'UPI payment initiated' });
    }
    catch (error) {
        console.error('UPI initiation failed:', error);
        res.status(500).json({ message: 'UPI payment initiation failed' });
    }
});
// Verify UPI payment (webhook)
router.post('/upi/verify', async (req, res) => {
    try {
        const { orderId, transactionId, status } = req.body;
        if (status === 'SUCCESS') {
            await pool.query(`UPDATE orders SET 
          payment_status = 'paid',
          upi_transaction_id = ?,
          order_status = 'confirmed'
        WHERE id = ?`, [transactionId, orderId]);
            res.json({ verified: true });
        }
        else {
            await pool.query(`UPDATE orders SET payment_status = 'failed' WHERE id = ?`, [orderId]);
            res.status(400).json({ verified: false });
        }
    }
    catch (error) {
        console.error('UPI verification failed:', error);
        res.status(500).json({ message: 'UPI verification failed' });
    }
});
// Get payment status
router.get('/status/:orderId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT payment_status, payment_method FROM orders WHERE id = ?', [req.params.orderId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(rows[0]);
    }
    catch (error) {
        console.error('Failed to get payment status:', error);
        res.status(500).json({ message: 'Failed to get payment status' });
    }
});
export default router;
