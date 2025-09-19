import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employee_id: { type: Number, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  warehouse_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }
});

// Pre-save middleware to generate employee_id if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employee_id) {
    const lastEmployee = await this.constructor.findOne({}, {}, { sort: { 'employee_id': -1 } });
    this.employee_id = lastEmployee ? lastEmployee.employee_id + 1 : 1;
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;