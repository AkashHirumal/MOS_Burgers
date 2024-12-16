document.addEventListener('DOMContentLoaded', () => {
    const rawData = sessionStorage.getItem('orders');
    console.log('Raw data from sessionStorage:', rawData);

    let orders = [];
    try {
        orders = JSON.parse(rawData) || [];
        console.log('Parsed orders:', orders);
    } catch (error) {
        console.error('Error parsing orders:', error);
        orders = [];
    }

    if (!Array.isArray(orders) || orders.length === 0) {
        console.log('No orders found or orders is not an array');
        displayNoDataMessage();
        return;
    }

    const reportDateTime = document.getElementById('reportDateTime');
    const currentDateTime = new Date().toLocaleString();
    reportDateTime.innerText = `Report generated on: ${currentDateTime}`;

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; 

    console.log('Today\'s date for comparison:', todayString);

    processAndDisplayData(orders, todayString);
});

function processAndDisplayData(orders, todayString) {
    const customerOrderCount = {};
    const itemCount = {};
    const todayTransactions = [];

    orders.forEach(order => {
        console.log('Processing order:', order);

        const customerName = order.customerName || 'Unknown Customer';
        customerOrderCount[customerName] = (customerOrderCount[customerName] || 0) + 1;

        if (Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemName = item.name || 'Unknown Item';
                const quantity = parseInt(item.quantity) || 0;
                itemCount[itemName] = (itemCount[itemName] || 0) + quantity;
            });
        }

        todayTransactions.push(order);
    });

    const sortedCustomers = Object.entries(customerOrderCount)
        .sort((a, b) => b[1] - a[1]);
    populateCustomerTable(sortedCustomers);

    const sortedItems = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1]);
    populateItemTable(sortedItems);

    populateTransactionTable(todayTransactions);
}

function populateTransactionTable(transactions) {
    const transactionTableBody = document.getElementById('transactionTable').getElementsByTagName('tbody')[0];
    transactionTableBody.innerHTML = '';
    
    if (transactions.length === 0) {
        const row = transactionTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'No transactions available';
        return;
    }

    transactions.forEach(order => {
        const row = transactionTableBody.insertRow();
        const items = Array.isArray(order.items) 
            ? order.items.map(item => `${item.name || 'Unknown Item'} (x${parseInt(item.quantity) || 0})`).join(', ')
            : 'No items';
        
        const totalAmount = order.totalPrice || 0; 
        
        row.innerHTML = `
            <td>${order.customerName || 'Unknown Customer'}</td>
            <td>${items}</td>
            <td>Rs. ${(parseFloat(totalAmount)).toFixed(2)}</td>
        `;
    });
}

function populateCustomerTable(sortedCustomers) {
    const customerTableBody = document.getElementById('customerTable').getElementsByTagName('tbody')[0];
    customerTableBody.innerHTML = '';
    
    if (sortedCustomers.length === 0) {
        const row = customerTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'No customer data available';
        return;
    }

    sortedCustomers.forEach(([customerName, orderCount]) => {
        const row = customerTableBody.insertRow();
        row.innerHTML = `
            <td>${customerName}</td>
            <td>${orderCount}</td>
        `;
    });
}

function populateItemTable(sortedItems) {
    const itemTableBody = document.getElementById('itemTable').getElementsByTagName('tbody')[0];
    itemTableBody.innerHTML = '';
    
    if (sortedItems.length === 0) {
        const row = itemTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'No item data available';
        return;
    }

    sortedItems.forEach(([itemName, quantity]) => {
        const row = itemTableBody.insertRow();
        row.innerHTML = `
            <td>${itemName}</td>
            <td>${quantity}</td>
        `;
    });
}

function generatePDFReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    function addHeader() {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0); 
        doc.text("MOS BURGERS", pageWidth / 2, 10, { align: 'center' });
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0)
        doc.text("Daily Order Report", pageWidth / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Report generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 25, { align: 'center' });
    }

    function addFooter(pageNumber) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Burger Shop - Tasty burgers, happy customers!", pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        doc.text("www.burgershop.lk", 10, pageHeight - 10);
    }
    

    let yPos = 35;
    let pageNumber = 1;

    addHeader();
    addFooter(pageNumber);

    function addTableToPDF(title, tableId, columns) {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            pageNumber++;
            yPos = 35;
            addHeader();
            addFooter(pageNumber);
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, yPos);
        yPos += 10;
        
        const table = document.getElementById(tableId);
        const data = [];
        
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);

        Array.from(table.querySelectorAll('tbody tr')).forEach(row => {
            const rowData = Array.from(row.querySelectorAll('td')).map(td => td.textContent);
            data.push(rowData);
        });

        doc.autoTable({
            head: [headers],
            body: data,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, 
            columnStyles: columns,
            margin: { top: 30, left: 10, right: 10, bottom: 20 },
            tableWidth: 'auto',
            didDrawPage: function (data) {
                addHeader();
                addFooter(pageNumber);
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 20;
    }
    
    addTableToPDF("Customers with Most Orders", "customerTable", {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' }
    });
    
    if (yPos > pageHeight - 40) {
        doc.addPage();
        pageNumber++;
        yPos = 35;
        addHeader();
        addFooter(pageNumber);
    }

    addTableToPDF("Most Popular Items for the Day", "itemTable", {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' }
    });

    if (yPos > pageHeight - 40) {
        doc.addPage();
        pageNumber++;
        yPos = 35;
        addHeader();
        addFooter(pageNumber);
    }

    addTableToPDF("Transaction History for Today", "transactionTable", {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
    });
    
    doc.save("MOS_BURGERS_DailyOrderReport.pdf");
}


document.getElementById('generatePDFButton').addEventListener('click', generatePDFReport);
