document.addEventListener('DOMContentLoaded', () => {
    displayOrders();
});



function displayOrders() {
    const orderTableBody = document.getElementById('orderTableBody');
    const orders = JSON.parse(sessionStorage.getItem('orders')) || [];

    orderTableBody.innerHTML = '';
    orders.forEach((order, index) => {
        const row = document.createElement('tr');

        const itemsList = Array.isArray(order.items) ? order.items.map(item => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return `<li>${item.name || 'Unknown Item'} (x${quantity}) - Rs. ${(price * quantity).toFixed(2)}</li>`;
        }).join('') : '<li>No items</li>';

        const discount = Number(order.discount) || 0;
        const totalPrice = Number(order.totalPrice) || 0;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${order.customerName || 'No Name'}</td>
            <td>${order.contactNo || 'No Contact'}</td>
            <td>
                <ul>
                    ${itemsList}
                </ul>
            </td>
            <td>Rs. ${discount.toFixed(2)}</td>
            <td>Rs. ${totalPrice.toFixed(2)}</td>
            <td><button class="btn btn-sm" style="background-color: #ffc400;" onclick="printOrderReport(${index})">Print Order Report</button></td>
        `;
        orderTableBody.appendChild(row);
    });
}

function saveOrdersToSessionStorage(orders) {
    sessionStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(newOrder) {
    let orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    orders.push(newOrder);
    saveOrdersToSessionStorage(orders);
    displayOrders(); 
}

function printOrderReport(index) {
    const orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    const order = orders[index];

    if (order) {
        const { customerName = 'No Name', contactNo = 'No Contact' } = order;
        const items = Array.isArray(order.items) ? order.items : [];
        const discount = Number(order.discount) || 0;
        const totalPrice = Number(order.totalPrice) || 0;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 297, 'F');

        const logoUrl = '../img/MOS_BURGER.png'; 
        doc.addImage(logoUrl, 'JPEG', 85, 15, 45, 30); // Center logo: x=85, y=15, width=40, height=40

        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255)
        doc.text("SALES INVOICE", 105, 80, null, null, "center");

        doc.setDrawColor(255, 255, 255);
        doc.line(10, 90, 200, 90);

        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`Date: ${new Date().toLocaleString()}`, 10, 100);
        doc.text(`Customer: ${customerName}`, 10, 110);
        doc.text(`Contact: ${contactNo}`, 10, 120);

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.setFillColor(255, 255, 255);
        doc.rect(10, 130, 190, 10, 'F');

        doc.text("Item", 15, 137);
        doc.text("Qty", 100, 137);
        doc.text("Price", 130, 137);
        doc.text("Total", 170, 137);

        // Table Content
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        let yPosition = 147;

        items.forEach((item, i) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const total = quantity * price;

            doc.text(item.name || 'Unknown Item', 15, yPosition);
            doc.text(quantity.toString(), 100, yPosition);
            doc.text(`Rs.${price.toFixed(2)}`, 130, yPosition);
            doc.text(`Rs.${total.toFixed(2)}`, 170, yPosition);

            yPosition += 10;
            if (yPosition > 270) {
                doc.addPage();
                doc.setFillColor(0, 0, 0); 
                doc.rect(0, 0, 210, 297, 'F');
                yPosition = 20;
            }
        });

        // Summary Section
        yPosition += 10;
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.line(10, yPosition, 200, yPosition); // Line above total
        yPosition += 10;

        doc.text(`Discount: Rs.${discount.toFixed(2)}`, 130, yPosition);
        yPosition += 10;

        doc.text(`Total Amount: Rs.${totalPrice.toFixed(2)}`, 130, yPosition);

        // Footer
        yPosition += 20;
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("We appreciate your visit! Come back soon!", 105, yPosition, null, null, "center");

        doc.setFontSize(10);
        doc.text("MOS Burgers - Where taste meets satisfaction!", 105, yPosition + 10, null, null, "center");
        doc.text("Visit us: www.mosburgers.lk", 105, yPosition + 20, null, null, "center");

        // Save PDF
        doc.save(`MOS_BURGERS_Invoice_${index + 1}.pdf`);
    } else {
        alert('Order not found!');
    }
}
