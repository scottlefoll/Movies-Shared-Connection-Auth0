const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define address schema
const addressSchema = new Schema({
    street: { type: String, required: true },
    town: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
});

const assetSchema = new Schema({
    assetId: { type: String, unique: true, required: true },
    serialNumber: { type: String, required: true },
    brand: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    model: { type: String, required: true },
    modelNumber: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    image: { type: String, required: true },
    physicalDescription: { type: String, required: true },
    status: { type: String, required: true },
    condition: { type: String, required: true },
    building: { type: Schema.Types.ObjectId, ref: 'Building', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const buildingSchema = new Schema({
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    name: { type: String, required: true },
    floors: { type: Number, required: true },
    departments: { type: [String], required: true },
});

const locationSchema = new Schema({
    name: { type: String, required: true },
    address: { type: addressSchema, required: true }, // We now set the type to our address schema
    type: { type: String, required: true },
    departments: { type: [String], required: true },
});

const departmentSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    head: { type: String, required: true },
    employeesCount: { type: Number, required: true },
    description: { type: String, required: true },
});

const maintenanceSchema = new Schema({
    asset: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateScheduled: { type: Date, required: true },
    datePerformed: { type: Date, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
});

const userSchema = new Schema({
    auth0Id: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    position: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
});

const asset = mongoose.model('Asset', assetSchema);
const address = mongoose.model('Address', addressSchema);
const building = mongoose.model('Building', buildingSchema);
const department = mongoose.model('Department', departmentSchema);
const location = mongoose.model('Location', locationSchema);
const maintenance = mongoose.model('Maintenance', maintenanceSchema);
const user = mongoose.model('User', userSchema);

module.exports = { asset, building, department, location, maintenance, user, address };
