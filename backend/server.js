import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/database.js';

// Import routes
import warehouseRoutes from './routes/warehouseRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import subProductRoutes from './routes/subProductRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import carrierRoutes from './routes/carrierRoutes.js';
import shipmentRoutes from './routes/shipmentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/warehouses', warehouseRoutes);
app.use('/sections', sectionRoutes);
app.use('/employees', employeeRoutes);
app.use('/products', productRoutes);
app.use('/sub-products', subProductRoutes);
app.use('/items', itemRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/carriers', carrierRoutes);
app.use('/api/shipment-infos', shipmentRoutes);

// Admin routes (with authentication)
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});