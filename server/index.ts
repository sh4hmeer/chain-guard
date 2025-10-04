import express, { Request, Response } from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion, Db, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

// Configure CORS to allow frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://gmongru_db_user:DUQPdxNbR6JLAskM@applist.zecatqq.mongodb.net/?retryWrites=true&w=majority&appName=applist"
let db: Db;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Get database instance
    db = client.db("chainguard");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all applications
app.get('/api/applications', async (req: Request, res: Response) => {
  try {
    const applications = await db.collection('applications').find().sort({ addedDate: -1 }).toArray();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error });
  }
});

// Get single application
app.get('/api/applications/:id', async (req: Request, res: Response) => {
  try {
    const application = await db.collection('applications').findOne({ _id: new ObjectId(req.params.id) });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application', error });
  }
});

// Create application
app.post('/api/applications', async (req: Request, res: Response) => {
  try {
    console.log('📝 Received POST /api/applications request');
    console.log('📦 Request body:', req.body);
    
    const now = new Date();
    const application = { ...req.body, addedDate: now, createdAt: now, updatedAt: now };
    
    console.log('💾 Attempting to insert into MongoDB...');
    const result = await db.collection('applications').insertOne(application);
    
    console.log('✅ Successfully inserted! ID:', result.insertedId);
    const response = { ...application, _id: result.insertedId };
    console.log('📤 Sending response:', response);
    
    res.status(201).json(response);
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(400).json({ message: 'Error creating application', error });
  }
});

// Bulk create (for CSV import)
app.post('/api/applications/bulk', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const applications = req.body.map((app: Record<string, unknown>) => ({
      ...app,
      addedDate: now,
      createdAt: now,
      updatedAt: now
    }));
    const result = await db.collection('applications').insertMany(applications);
    const insertedApps = Object.values(result.insertedIds).map((id, index) => ({
      ...applications[index],
      _id: id
    }));
    res.status(201).json(insertedApps);
  } catch (error) {
    res.status(400).json({ message: 'Error creating applications', error });
  }
});

// Update application
app.put('/api/applications/:id', async (req: Request, res: Response) => {
  try {
    const update = { ...req.body, updatedAt: new Date() };
    const result = await db.collection('applications').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: update },
      { returnDocument: 'after' }
    );
    if (!result) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: 'Error updating application', error });
  }
});

// Delete application
app.delete('/api/applications/:id', async (req: Request, res: Response) => {
  try {
    const result = await db.collection('applications').findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application', error });
  }
});

// Delete all applications
app.delete('/api/applications', async (req: Request, res: Response) => {
  try {
    await db.collection('applications').deleteMany({});
    res.json({ message: 'All applications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting applications', error });
  }
});

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api\n`);
  });
}).catch(console.dir);

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
