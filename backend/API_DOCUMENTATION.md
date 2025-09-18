# 📋 Warehouse Management API Documentation

## Base URL
```
http://localhost:3000
```

## Overview
This API provides comprehensive warehouse management functionality including multi-location support, inventory tracking, product management, and logistics coordination.

## Authentication
Currently, no authentication is implemented. All endpoints are publicly accessible.

---

## 🏭 Warehouse Endpoints

### Create Warehouse
```http
POST /warehouses
```

**Request Body:**
```json
{
  "warehouse_id": 1,
  "name": "Central Depot",
  "location": "New York",
  "size": 5000,
  "capacity_unit": "metre cube",
  "number_of_sections": 0,
  "manager_id": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Response:**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "warehouse_id": 1,
  "name": "Central Depot",
  "location": "New York",
  "size": 5000,
  "capacity_unit": "metre cube",
  "number_of_sections": 0,
  "manager_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "__v": 0
}
```

### Get All Warehouses
```http
GET /warehouses
```

**Response:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "warehouse_id": 1,
    "name": "Central Depot",
    "location": "New York",
    "size": 5000,
    "capacity_unit": "metre cube",
    "number_of_sections": 0,
    "manager_id": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "employee_id": 101,
      "first_name": "Alice",
      "last_name": "Johnson",
      "role": "Manager",
      "phone": "1234567890",
      "email": "alice@company.com"
    },
    "__v": 0
  }
]
```

### Get Warehouse by ID
```http
GET /warehouses/:id
```

**Response:** Same as create response

### Get Warehouse Sections
```http
GET /warehouses/:id/sections
```

**Response:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "section_id": 11,
    "name": "Cold Room",
    "warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "section_type": "Refrigerated",
    "temperature_range": "0–5°C",
    "is_available": true,
    "__v": 0
  }
]
```

### Update Warehouse
```http
PUT /warehouses/:id
```

**Request Body:** Same as create

### Delete Warehouse
```http
DELETE /warehouses/:id
```

**Response:**
```json
{
  "message": "Warehouse deleted"
}
```

---

## 📦 Section Endpoints

### Create Section
```http
POST /sections
```

**Request Body:**
```json
{
  "section_id": 11,
  "name": "Cold Room",
  "warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "section_type": "Refrigerated",
  "temperature_range": "0–5°C",
  "is_available": true
}
```

### Get All Sections
```http
GET /sections
```

### Get Section by ID
```http
GET /sections/:id
```

### Update Section
```http
PUT /sections/:id
```

### Delete Section
```http
DELETE /sections/:id
```

---

## 👥 Employee Endpoints

### Create Employee
```http
POST /employees
```

**Request Body:**
```json
{
  "employee_id": 101,
  "first_name": "Alice",
  "last_name": "Johnson",
  "role": "Manager",
  "phone": "1234567890",
  "email": "alice@company.com",
  "warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

### Get All Employees
```http
GET /employees
```

### Get Employee by ID
```http
GET /employees/:id
```

### Update Employee
```http
PUT /employees/:id
```

### Get Employees by Warehouse
```http
GET /employees/warehouse/:warehouseId
```

**Response:** Array of employees assigned to the specified warehouse

### Delete Employee
```http
DELETE /employees/:id
```

---

## 🛍️ Product Endpoints

### Create Product
```http
POST /products
```

**Request Body:**
```json
{
  "product_id": 501,
  "name": "Milk",
  "sku": "MLK-001",
  "description": "Fresh dairy milk",
  "category": "Dairy",
  "storage_condition": "Refrigerated"
}
```

### Get All Products
```http
GET /products
```

### Get Product by ID
```http
GET /products/:id
```

### Get Product Sub-Products
```http
GET /products/:id/sub-products
```

**Response:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
    "sub_product_id": 601,
    "name": "Milk 1L",
    "unit_size": "1L",
    "product_id": "64f1a2b3c4d5e6f7g8h9i0j5",
    "__v": 0
  }
]
```

### Update Product
```http
PUT /products/:id
```

### Delete Product
```http
DELETE /products/:id
```

---

## 🔄 Sub-Product Endpoints

### Create Sub-Product
```http
POST /sub-products
```

**Request Body:**
```json
{
  "sub_product_id": 601,
  "name": "Milk 1L",
  "unit_size": "1L",
  "product_id": "64f1a2b3c4d5e6f7g8h9i0j5"
}
```

### Get All Sub-Products
```http
GET /sub-products
```

### Get Sub-Product by ID
```http
GET /sub-products/:id
```

### Update Sub-Product
```http
PUT /sub-products/:id
```

### Delete Sub-Product
```http
DELETE /sub-products/:id
```

---

## 📦 Item Endpoints

### Create Item
```http
POST /items
```

**Request Body:**
```json
{
  "item_id": 701,
  "sub_product_id": "64f1a2b3c4d5e6f7g8h9i0j4",
  "supplier_id": "64f1a2b3c4d5e6f7g8h9i0j6",
  "warehouse_section_id": "64f1a2b3c4d5e6f7g8h9i0j3",
  "expiration_date": "2025-03-01"
}
```

### Get All Items
```http
GET /items
```

**Query Parameters:**
- `warehouse_id`: Filter items by warehouse
- `section_id`: Filter items by section

**Examples:**
```http
GET /items?warehouse_id=64f1a2b3c4d5e6f7g8h9i0j1
GET /items?section_id=64f1a2b3c4d5e6f7g8h9i0j3
```

### Get Item by ID
```http
GET /items/:id
```

### Update Item
```http
PUT /items/:id
```

### Delete Item
```http
DELETE /items/:id
```

---

## 🚚 Supplier Endpoints

### Create Supplier
```http
POST /suppliers
```

**Request Body:**
```json
{
  "supplier_id": 801,
  "name": "Dairy Farm",
  "contact_person": "John Smith",
  "phone": "98765432",
  "email": "john@dairy.com",
  "address": "123 Farm Road"
}
```

### Get All Suppliers
```http
GET /suppliers
```

### Get Supplier by ID
```http
GET /suppliers/:id
```

### Update Supplier
```http
PUT /suppliers/:id
```

### Delete Supplier
```http
DELETE /suppliers/:id
```

---

## 🚛 Carrier Endpoints

### Create Carrier
```http
POST /carriers
```

**Request Body:**
```json
{
  "carrier_id": 901,
  "name": "FastLogistics",
  "phone": "111222333",
  "email": "contact@fast.com",
  "service_type": "Refrigerated"
}
```

### Get All Carriers
```http
GET /carriers
```

### Get Carrier by ID
```http
GET /carriers/:id
```

### Update Carrier
```http
PUT /carriers/:id
```

### Delete Carrier
```http
DELETE /carriers/:id
```

---

## 📊 Common Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **404**: Not Found
- **500**: Internal Server Error

## 📝 Notes

- All IDs are MongoDB ObjectIds (24-character hexadecimal strings)
- Dates should be in ISO format (YYYY-MM-DD)
- Relationships are handled via ObjectId references
- Population is automatic for related data in GET requests
- All endpoints support JSON content type

## 🧪 Testing Examples

### Create a Complete Warehouse Setup
1. Create Employee (Manager)
2. Create Warehouse (reference manager)
3. Create Section (reference warehouse)
4. Create Product
5. Create Sub-Product (reference product)
6. Create Supplier
7. Create Item (reference sub-product, supplier, section)

This API provides full CRUD operations for comprehensive warehouse management.