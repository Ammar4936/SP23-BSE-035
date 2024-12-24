const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            fs.chmodSync(dirPath, 0o755);
        }
        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
    }
}

function generateOrderPDF(order) {
    return new Promise((resolve, reject) => {
        try {
            const billsDir = path.join(process.cwd(), 'public', 'bills');
            ensureDirectoryExists(billsDir);
            const pdfFileName = `order-${order.orderId}.pdf`;
            const pdfPath = path.join(billsDir, pdfFileName);

            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            const writeStream = fs.createWriteStream(pdfPath);
            writeStream.on('error', (error) => {
                console.error('Write stream error:', error);
                reject(error);
            });

            doc.pipe(writeStream);

            // Add styled header with background
            doc.rect(0, 0, doc.page.width, 150)
               .fill('#2c3e50');

            doc.fontSize(32)
               .fill('#ffffff')
               .text('Outfitters', 50, 50, { align: 'center' })
               .fontSize(16)
               .text('Order Invoice', 50, 90, { align: 'center' })
               .moveDown();

            // Order details in a box
            doc.rect(50, 160, doc.page.width - 100, 80)
               .fillAndStroke('#f7f9fc', '#e1e8ee');

            doc.fill('#2c3e50')
               .fontSize(12)
               .text(`Order ID: #${order.orderId}`, 70, 175)
               .text(`Date: ${new Date().toLocaleString()}`, 70, 195)
               .moveDown();

            // Customer Information with styled section
            const customerY = 260;
            doc.rect(50, customerY, (doc.page.width - 100)/2 - 10, 120)
               .fillAndStroke('#ffffff', '#e1e8ee');

            doc.fontSize(14)
               .fill('#2c3e50')
               .text('Customer Information', 70, customerY + 15, { underline: true })
               .fontSize(12)
               .text(`Name: ${order.customer.firstName} ${order.customer.lastName}`, 70, customerY + 40)
               .text(`Email: ${order.customer.email}`, 70, customerY + 60)
               .text(`Phone: ${order.customer.phone}`, 70, customerY + 80);

            // Shipping Address with styled section
            doc.rect((doc.page.width/2) + 10, customerY, (doc.page.width - 100)/2 - 10, 120)
               .fillAndStroke('#ffffff', '#e1e8ee');

            doc.fontSize(14)
               .text('Shipping Address', (doc.page.width/2) + 30, customerY + 15, { underline: true })
               .fontSize(12)
               .text(`Address: ${order.shipping.address}`, (doc.page.width/2) + 30, customerY + 40)
               .text(`City: ${order.shipping.city}`, (doc.page.width/2) + 30, customerY + 60)
               .text(`Province: ${order.shipping.province}`, (doc.page.width/2) + 30, customerY + 80)
               .text(`Postal Code: ${order.shipping.postalCode}`, (doc.page.width/2) + 30, customerY + 100);

            // Order Summary with styled header
            const summaryY = 400;
            doc.rect(50, summaryY, doc.page.width - 100, 30)
               .fill('#2c3e50');

            doc.fontSize(14)
               .fill('#ffffff')
               .text('Order Summary', 70, summaryY + 8);

            // Table header with background
            const tableTop = summaryY + 40;
            doc.rect(50, tableTop, doc.page.width - 100, 25)
               .fillAndStroke('#f7f9fc', '#e1e8ee');

            doc.fontSize(12)
               .fill('#2c3e50')
               .text('Item', 70, tableTop + 7)
               .text('Quantity', 300, tableTop + 7)
               .text('Price', 400, tableTop + 7)
               .text('Total', 500, tableTop + 7);

            let y = tableTop + 35;
            order.items.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                if (index % 2 === 0) {
                    doc.rect(50, y - 5, doc.page.width - 100, 25)
                       .fill('#f8f9fa');
                }
                doc.fill('#2c3e50')
                   .text(item.title, 70, y)
                   .text(item.quantity.toString(), 300, y)
                   .text(`PKR ${item.price.toLocaleString()}`, 400, y)
                   .text(`PKR ${itemTotal.toLocaleString()}`, 500, y);
                y += 25;
            });

            // Totals section with styling
            y += 10;
            doc.rect(350, y, doc.page.width - 400, 80)
               .fillAndStroke('#f7f9fc', '#e1e8ee');

            doc.fill('#2c3e50')
               .text('Subtotal:', 370, y + 10)
               .text(`PKR ${order.subtotal.toLocaleString()}`, 470, y + 10)
               .text('Tax (5%):', 370, y + 30)
               .text(`PKR ${order.tax.toLocaleString()}`, 470, y + 30);

            doc.fontSize(14)
               .text('Total:', 370, y + 50)
               .text(`PKR ${order.total.toLocaleString()}`, 470, y + 50);

            // Footer with styled background
            doc.rect(0, doc.page.height - 50, doc.page.width, 50)
               .fill('#2c3e50');

            doc.fontSize(12)
               .fill('#ffffff')
               .text('Thank you for shopping with Outfitters!', 0, doc.page.height - 35, {
                   align: 'center'
               });

            doc.end();

            writeStream.on('finish', () => {
                resolve(`/bills/${pdfFileName}`);
            });

        } catch (error) {
            console.error('PDF generation error:', error);
            reject(error);
        }
    });
}

module.exports = { generateOrderPDF };