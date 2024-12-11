let items = [];

let editingIndex = -1;

function loadItemsFromJSON() {
    fetch('items.json')
        .then(response => response.json())
        .then(data => {
            if (!localStorage.getItem('items')) {
                items = data;
                console.log(items);
                
                refreshTable();
                saveItemsToLocalStorage();
            }
        })
        .catch(error => console.error('Error loading items:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    loadItemsFromLocalStorage();  
    if (!items.length) {
        loadItemsFromJSON(); 
    }
});

document.getElementById('itemForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const itemno = document.getElementById('itemno').value.trim();
    const itemtype = document.getElementById('itemtype').value.trim();
    const name = document.getElementById('name').value.trim();
    const price = document.getElementById('price').value.trim();
    const image = document.getElementById('image').files[0];

    if (itemno === '' || itemtype === '' || name === '' || price === '' || !image) {
        alert('Please fill in all fields and select an image');
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = function() {
        const imageUrl = reader.result;
        
        if (editingIndex === -1) {
            addItem({ itemno, itemtype, name, price, imageUrl });
        } else {
            updateItem(editingIndex, { itemno, itemtype, name, price, imageUrl });
            document.querySelector('#itemForm button').innerText = 'Add Item';
            editingIndex = -1;
        }

        document.getElementById('itemForm').reset();
    };
});

function addItem(item) {
    items.push(item);
    addItemToTable(item, items.length - 1);
    saveItemsToLocalStorage();
    updateMenuPage();
}

function updateItem(index, updatedItem) {
    items[index] = updatedItem;
    updateItemInTable(index, updatedItem);
    saveItemsToLocalStorage();
    updateMenuPage();
}

function addItemToTable(item, index) {
    const tableBody = document.querySelector('#itemTable tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${item.itemno}</td>
        <td>${item.itemtype}</td>
        <td>${item.name}</td>
        <td>${item.price}</td>
        <td><img src="${item.imageUrl}" alt="${item.name}" class="item-image"></td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editItem(${index})">✏️</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${index})">🗑️</button>
        </td>
    `;

    tableBody.appendChild(row);
}

function updateItemInTable(index, updatedItem) {
    const tableBody = document.querySelector('#itemTable tbody');
    const row = tableBody.children[index];

    row.innerHTML = `
        <td>${updatedItem.itemno}</td>
        <td>${updatedItem.itemtype}</td>
        <td>${updatedItem.name}</td>
        <td>${updatedItem.price}</td>
        <td><img src="${updatedItem.imageUrl}" alt="${updatedItem.name}" class="item-image"></td>
        <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editItem(${index})">✏️</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteItem(${index})">🗑️</button>
        </td>
    `;
}

function editItem(index) {
    const item = items[index];
    document.getElementById('itemno').value = item.itemno;
    document.getElementById('itemtype').value = item.itemtype;
    document.getElementById('name').value = item.name;
    document.getElementById('price').value = item.price;

    document.querySelector('#itemForm button').innerText = 'Update Item';
    editingIndex = index;
}

function deleteItem(index) {
    items.splice(index, 1);
    refreshTable();
    saveItemsToLocalStorage();
    updateMenuPage();
}

function refreshTable() {
    const tableBody = document.querySelector('#itemTable tbody');
    tableBody.innerHTML = '';
    items.forEach((item, index) => addItemToTable(item, index));
}

function saveItemsToLocalStorage() {
    localStorage.setItem('items', JSON.stringify(items));
}

function loadItemsFromLocalStorage() {
    const storedItems = localStorage.getItem('items');
    if (storedItems) {
        items = JSON.parse(storedItems);
        refreshTable();
    }
}

function searchItem() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const tableRows = document.querySelectorAll('#itemTable tbody tr');

    tableRows.forEach((row, index) => {
        const name = row.cells[2].innerText.toLowerCase();
        if (name.includes(searchInput)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function updateMenuPage() {
    console.log('Menu page updated');
}
