const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);
let collection;

function getSafeId(id) {
    try { return new ObjectId(id); } 
    catch (e) { return id; }
}

app.post('/create', async (req, res) => {
    try {
        await collection.insertOne(req.body);
        res.json({ status: 'success' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'CONSTRAINT_FAILED', message: 'That name already exists!' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/read', async (req, res) => {
    const data = await collection.find({}).toArray();
    res.json(data);
});

app.put('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { name, age } = req.body;
        await collection.updateOne(
            { _id: getSafeId(id) }, 
            { $set: { name, age } }
        );
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/update-id/:oldId', async (req, res) => {
    try {
        const { newId, name, age } = req.body;
        const oldId = getSafeId(req.params.oldId);
        
        // 1. Save the old document as a backup
        const oldDoc = await collection.findOne({ _id: oldId });
        
        // 2. Delete the old entry FIRST to free up the unique name constraint
        await collection.deleteOne({ _id: oldId });
        
        try {
            // 3. Try to insert the new custom ID
            await collection.insertOne({ _id: getSafeId(newId), name, age });
            res.json({ status: 'success' });
        } catch (insertError) {
            // ROLLBACK: If the new ID already exists, put the old document back
            await collection.insertOne(oldDoc);
            res.status(400).json({ error: "That ID already exists!" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await collection.deleteOne({ _id: getSafeId(id) });
        res.json({ status: 'success' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, async () => {
    await client.connect();
    collection = client.db("Fanidhar-4466").collection("users");
    
    // Unique Key Constraint
    await collection.createIndex({ name: 1 }, { unique: true });
    
    console.log("Server running on http://localhost:3000");
});