let customers = JSON.parse(localStorage.getItem('customers')) || [];
let items = [];
let cart = [];
let orders = [];


function loadItemsFromJSON() {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('items')) {
            items = JSON.parse(localStorage.getItem('items'));
            resolve(items);
        } else {
            fetch('items.json')
                .then(response => response.json())
                .then(data => {
                    items = data;
                    localStorage.setItem('items', JSON.stringify(items));
                    resolve(items);
                })
                .catch(error => {
                    console.error('Error loading items:', error);
                    reject(error);
                });
        }
    });
}

function loadOrders() {
    try {
        orders = JSON.parse(sessionStorage.getItem('orders')) || [];
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
    }
}

function saveOrders() {
    sessionStorage.setItem('orders', JSON.stringify(orders));
}

function populateCustomerDropdown() {
    const customerSelect = document.getElementById('existingCustomer');
    customerSelect.innerHTML = '<option value="">-- Select a customer --</option>'; 
    customers.forEach((customer, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${customer.name} (${customer.phone})`;
        customerSelect.appendChild(option);
    });
}

function fillCustomerInfo() {
    const selectedIndex = document.getElementById('existingCustomer').value;
    if (selectedIndex !== "") {
        const customer = customers[selectedIndex];
        document.getElementById('customerName').value = customer.name;
        document.getElementById('contactNo').value = customer.phone;
    } else {
        document.getElementById('customerName').value = '';
        document.getElementById('contactNo').value = '';
    }
}

function renderMenu(items) {
    const menuContent = document.getElementById('menu-content');
    menuContent.innerHTML = '';
    menuContent.classList.add('row', 'row-cols-1', 'row-cols-md-3', 'g-4');

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.classList.add('col');
        card.innerHTML = `
            <div class="card ccard" >
                        <div class="cbody">
                            <div class="col-md-4 imgsection">
                                <img src= ${item.imageUrl} width="200" height="218" alt="">
                            </div>
                            <div class="col-md- cdiscription"> 
                                <h3 class="titleItem">${item.name}</h3>
                                <p class="priceItem"><b>Price :</b>: ${item.price}</p>
                                <button  class="btn btn-add-item" onclick="addToCart(${index})">Add to Cart</button>
                            </div>
                        </div>
                    </div>
        `;
        menuContent.appendChild(card);
    });
}

function renderMenu(filterItems) {
    const menuContent = document.getElementById('menu-content');
    menuContent.innerHTML = '';
    filterItems.forEach((filterItem) => {
        items.forEach((item, index) => {
            if (item.itemno === filterItem.itemno) {
                const card = document.createElement('div');
                card.classList.add('col');
                card.innerHTML = `
                    <div class="card ccard" >
                        <div class="cbody">
                            <div class="col-md-4 imgsection">
                                <img src= ${item.imageUrl} width="200" height="218" alt="">
                            </div>
                            <div class="col-md- cdiscription"> 
                                <h3 class="titleItem">${item.name}</h3>
                                <p class="priceItem"><b>Price :</b>: ${item.price}</p>
                                <button  class="btn btn-add-item" onclick="addToCart(${index})">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
                menuContent.appendChild(card);
            }
        });
    });
}

function filterCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.textContent === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (category === 'All') {
        renderMenu(items);
    } else {
        renderMenu(items.filter(item => item.itemtype === category));
    }
}

function addToCart(index) {
    const item = items[index];
    const cartItem = cart.find(cartItem => cartItem.itemno === item.itemno);
    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    renderCart();
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let totalPrice = 0;
    cart.forEach((cartItem, index) => {
        const cartItemElem = document.createElement('div');
        cartItemElem.classList.add('cart-item');
        cartItemElem.innerHTML = `
            <span>${cartItem.name} - Rs.${cartItem.price}</span>
            <input type="number" value="${cartItem.quantity}" min="1" onchange="updateQuantity(${index}, this.value)">
            <span>Rs.${(parseFloat(cartItem.price) * cartItem.quantity).toFixed(2)}</span>
            <button class="btn btn-danger btn-remove" onclick="removeFromCart(${index})">Remove</button>
        `;
        cartItems.appendChild(cartItemElem);
        totalPrice += parseFloat(cartItem.price) * cartItem.quantity;
    });
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
}

function updateQuantity(index, quantity) {
    quantity = parseInt(quantity);
    if (quantity < 1) quantity = 1;
    cart[index].quantity = quantity;
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function calculateTotal() {
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    let totalPrice = parseFloat(document.getElementById('totalPrice').textContent);
    totalPrice -= discount;
    if (totalPrice < 0) totalPrice = 0;
    return totalPrice.toFixed(2);
}

function showTotal() {
    const totalPrice = calculateTotal();
    alert(`The total price after discount is Rs.${totalPrice}`);
}

function placeOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const contactNo = document.getElementById('contactNo').value.trim();
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const totalPrice = calculateTotal();

    if (!customerName || !contactNo) {
        alert('Please enter customer information');
        return;
    }

    let existingCustomer = customers.find(customer => customer.name === customerName && customer.phone === contactNo);

    if (!existingCustomer) {
        const newCustomer = { name: customerName, phone: contactNo, email: '', address: '' }; 
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));
        populateCustomerDropdown(); 
        alert('New customer added to customer list!');
    }

    const order = {
        customerName,
        contactNo,
        items: cart.map(cartItem => ({
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity
        })),
        discount,
        totalPrice
    };

    orders.push(order);
    saveOrders(); 

    console.log('Order placed:', order);
    alert('Order placed successfully!');

    cart = [];
    document.getElementById('customerName').value = '';
    document.getElementById('contactNo').value = '';
    document.getElementById('discount').value = '';
    renderCart();
}

window.onload = function () {
    loadItemsFromJSON().then(() => {
        filterCategory('All');
        loadOrders();
        renderCart();
        populateCustomerDropdown(); 
    });
};

document.getElementById('calculateTotal').addEventListener('click', showTotal);
document.getElementById('placeOrder').addEventListener('click', placeOrder);

loadItemsFromJSON();