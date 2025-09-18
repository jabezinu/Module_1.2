import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employee_id: { type: Number, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;