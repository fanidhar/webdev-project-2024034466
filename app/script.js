async function fetchTable() {
    const res = await fetch('http://localhost:3000/read');
    const data = await res.json();
    
    document.getElementById('dataTable').innerHTML = `
        <tr>
            <th>ID (Primary Key)</th>
            <th>Name</th>
            <th>Age</th>
            <th>Actions</th>
        </tr>
    ` + data.map(item => `
        <tr>
            <td id="id-${item._id}" style="font-family: monospace; font-size: 12px; color: #555;">${item._id}</td>
            <td id="name-${item._id}">${item.name}</td>
            <td id="age-${item._id}">${item.age}</td>
            <td id="actions-${item._id}">
                <button class="upd-btn" onclick="editRow('${item._id}')">Edit</button>
                <button class="del-btn" onclick="deleteData('${item._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}
function editRow(id) {
    const idCell = document.getElementById(`id-${id}`);
    const nameCell = document.getElementById(`name-${id}`);
    const ageCell = document.getElementById(`age-${id}`);
    
    const currentId = idCell.innerText;
    const currentName = nameCell.innerText;
    const currentAge = ageCell.innerText;
    idCell.innerHTML = `<input type="text" id="edit-id-${id}" value="${currentId}">`;
    nameCell.innerHTML = `<input type="text" id="edit-name-${id}" value="${currentName}">`;
    ageCell.innerHTML = `<input type="number" id="edit-age-${id}" value="${currentAge}">`;
    document.getElementById(`actions-${id}`).innerHTML = `
        <button class="add-btn" onclick="saveData('${id}')">Save</button>
        <button class="del-btn" onclick="fetchTable()">Cancel</button>
    `;
}
async function saveData(id) {
    const newId = document.getElementById(`edit-id-${id}`).value;
    const newName = document.getElementById(`edit-name-${id}`).value;
    const newAge = document.getElementById(`edit-age-${id}`).value;
    if (newId !== id) {
        // If the ID was changed, trigger the swap route
        await fetch(`http://localhost:3000/update-id/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newId, name: newName, age: newAge })
        });
    } else {
        // Normal update if ID is untouched
        await fetch(`http://localhost:3000/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, age: newAge })
        });
    }
    fetchTable();
}
async function createData() {
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    if (!name || !age) return alert("Please enter both name and age");
    
    const response = await fetch('http://localhost:3000/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, age })
    });
    
    const result = await response.json();
    
    // ADD THIS: Check if the constraint was violated
    if (result.error === 'CONSTRAINT_FAILED') {
        alert("Database Constraint Error: " + result.message);
        return;
    }
    
    document.getElementById('name').value = '';
    document.getElementById('age').value = '';
    fetchTable(); 
}
async function deleteData(id) {
    if (!confirm("Delete this entry?")) return;
    
    await fetch(`http://localhost:3000/delete/${id}`, { 
        method: 'DELETE' 
    });
    
    fetchTable();
}
fetchTable();