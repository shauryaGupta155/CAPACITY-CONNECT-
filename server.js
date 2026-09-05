const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// File uploads public karne ke liye
app.use('/uploads', express.static('uploads'));
const upload = multer({ dest: 'uploads/' }); 

// ==========================================
// ⚠️ NEECHE DI GAYI LINE MEIN APNA LINK DAALO
// LINK KO SIRF " " (QUOTES) KE ANDAR HI RAKHNA
// ==========================================
const MONGO_URI = "mongodb+srv://shauryag983_db_user:S18eOKXGW6kBKQQ8@cluster0.e5mbyr7.mongodb.net/?appName=Cluster0"; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Database Successfully Connected'))
    .catch(err => console.log('❌ MongoDB Error:', err));

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    trainerName: { type: String, required: true },
    filePath: { type: String }, // File path yahan save hoga
    createdAt: { type: Date, default: Date.now }
});
const Material = mongoose.model('Material', materialSchema);

const mappingSchema = new mongoose.Schema({
    traineeName: { type: String, required: true },
    trainerName: { type: String, required: true }
});
const Mapping = mongoose.model('Mapping', mappingSchema);

// --- ROUTES ---

// 1. Register API
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const newUser = new User({ username, password, role });
        await newUser.save();
        res.status(201).json({ success: true, message: "User registered!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Username already exists or error!" });
    }
});

// 2. Login API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });
        if (user) {
            res.status(200).json({ success: true, message: "Login successful!" });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials or role!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

// 3. Upload Material API
app.post('/api/upload-material', upload.single('file'), async (req, res) => {
    try {
        const { title, description, trainerName } = req.body;
        let filePath = req.file ? `/uploads/${req.file.filename}` : "";
        
        const newMaterial = new Material({ title, description, trainerName, filePath });
        await newMaterial.save();
        res.status(201).json({ success: true, message: "Material published!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. Get Materials API
app.get('/api/materials', async (req, res) => {
    try {
        // Default route - Jab koi link kholega toh seedha login page dikhega
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});
        const materials = await Material.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, materials });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. Get Users API (Admin)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username role');
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. Assign Mapping API
app.post('/api/assign-mapping', async (req, res) => {
    try {
        const { traineeName, trainerName } = req.body;
        const newMapping = new Mapping({ traineeName, trainerName });
        await newMapping.save();
        res.status(201).json({ success: true, message: "Mapping created!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 7. Get Mappings API
app.get('/api/mappings', async (req, res) => {
    try {
        const mappings = await Mapping.find();
        res.status(200).json({ success: true, mappings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});