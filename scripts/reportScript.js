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