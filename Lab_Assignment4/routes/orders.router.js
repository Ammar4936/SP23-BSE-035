const express = require('express');
const router = express.Router();
const Order = require('../models/order.model');
const { generateOrderPDF } = require('../utils/pdfGenerator');

router.post('/api/place-order', async (req, res) => {
    try {
        const orderData = req.body;
        console.log('Received order data:', orderData);

        // Validate the order data structure
        if (!orderData || typeof orderData !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data: empty or not an object'
            });
        }

        // Validate items array
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order data: items must be a non-empty array'
            });
        }

        // Validate required fields
        const requiredFields = {
            customer: ['firstName', 'lastName', 'email', 'phone'],
            shipping: ['address', 'city', 'province', 'postalCode']
        };

        for (const [section, fields] of Object.entries(requiredFields)) {
            if (!orderData[section] || typeof orderData[section] !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: `Missing or invalid ${section} section`
                });
            }

            for (const field of fields) {
                if (!orderData[section][field] || !orderData[section][field].trim()) {
                    return res.status(400).json({
                        success: false,
                        message: `Missing required field: ${section}.${field}`
                    });
                }
            }
        }

        // Validate items data
        for (const item of orderData.items) {
            if (!item.productId || !item.title || !item.price || !item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid item data: missing required fields'
                });
            }

            if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid item data: price and quantity must be numbers'
                });
            }
        }

        // Calculate total
        const subtotal = orderData.items.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.quantity));
        }, 0);
        
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        console.log('Calculated total:', total);
        
        // Create new order
        const order = new Order({
            customer: orderData.customer,
            shipping: orderData.shipping,
            items: orderData.items,
            paymentMethod: orderData.paymentMethod || 'cod',
            total: total,
            status: 'Pending'
        });

        await order.save();
        console.log('Order saved successfully:', order._id);
        
        // Generate PDF with error handling
        let pdfUrl = null;
        try {
            pdfUrl = await generateOrderPDF({
                orderId: order._id,
                customer: orderData.customer,
                shipping: orderData.shipping,
                items: orderData.items,
                subtotal: subtotal,
                tax: tax,
                total: total
            });
            console.log('PDF generated successfully:', pdfUrl);
        } catch (pdfError) {
            console.error('PDF generation failed:', pdfError);
        }

        const responseData = { 
            success: true, 
            orderId: order._id,
            pdfUrl: pdfUrl,
            subtotal: subtotal,
            tax: tax,
            total: total,
            message: pdfUrl ? 'Order placed successfully!' : 'Order placed successfully (PDF generation failed)'
        };

        console.log('Sending response:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to place order'
        });
    }
});

module.exports = router; 