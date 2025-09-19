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
  "expiration_date": "2025-03-01",
  "warehouse_section_id": "64f1a2b3c4d5e6f7g8h9i0j3",
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

## 📦 Shipment Info Endpoints

### Create Shipment (Inbound or Outbound)
```http
POST /api/shipment-infos
```

**Request Body for Supplier to Warehouse (Inbound):**
```json
{
  "shipment_type": "supplier_to_warehouse",
  "supplier_id": "64f1a2b3c4d5e6f7g8h9i0j6",
  "origin_warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "carrier_id": "64f1a2b3c4d5e6f7g8h9i0j8",
  "shipment_date": "2024-01-15",
  "employee_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "tracking_number": "SUP123456789",
  "notes": "New inventory delivery from supplier"
}
```

**Request Body for Warehouse to Warehouse (Transfer):**
```json
{
  "shipment_type": "warehouse_to_warehouse",
  "items": [
    {
      "item_id": "64f1a2b3c4d5e6f7g8h9i0j7",
      "quantity": 25
    }
  ],
  "origin_warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "destination_warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j9",
  "carrier_id": "64f1a2b3c4d5e6f7g8h9i0j8",
  "estimated_delivery_date": "2024-01-12",
  "tracking_number": "WH123456789",
  "employee_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "priority": "medium",
  "notes": "Stock transfer between warehouses"
}
```

**Request Body for Warehouse to Customer (Outbound):**
```json
{
  "shipment_type": "warehouse_to_customer",
  "items": [
    {
      "item_id": "64f1a2b3c4d5e6f7g8h9i0j7",
      "quantity": 10
    }
  ],
  "origin_warehouse_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "destination_address": "123 Customer Street, City, State 12345",
  "destination_contact": "Jane Doe - 555-0123",
  "carrier_id": "64f1a2b3c4d5e6f7g8h9i0j8",
  "estimated_delivery_date": "2024-01-15",
  "tracking_number": "CUST123456789",
  "employee_id": "64f1a2b3c4d5e6f7g8h9i0j2",
  "priority": "high",
  "notes": "Customer order delivery"
}
```

**Response:**
```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
  "shipment_id": 1001,
  "items": [
    {
      "item_id": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j7",
        "item_id": 701,
        "sub_product_id": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
          "sub_product_id": 601,
          "name": "Milk 1L",
          "unit_size": "1L"
        },
        "supplier_id": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j6",
          "supplier_id": 801,
          "name": "Dairy Farm"
        },
        "warehouse_section_id": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
          "section_id": 11,
          "name": "Cold Room"
        },
        "expiration_date": "2025-03-01T00:00:00.000Z"
      },
      "quantity": 10
    }
  ],
  "origin_warehouse_id": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "warehouse_id": 1,
    "name": "Central Depot"
  },
  "destination_address": "123 Customer Street, City, State 12345",
  "destination_contact": "Jane Doe - 555-0123",
  "carrier_id": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j8",
    "carrier_id": 901,
    "name": "FastLogistics"
  },
  "status": "pending",
  "shipment_date": "2024-01-10T10:30:00.000Z",
  "estimated_delivery_date": "2024-01-15T00:00:00.000Z",
  "tracking_number": "FL123456789",
  "employee_id": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "employee_id": 101,
    "first_name": "Alice",
    "last_name": "Johnson"
  },
  "priority": "high",
  "notes": "Handle with care - fragile items",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

### Get All Shipments
```http
GET /api/shipment-infos
```

**Query Parameters:**
- `warehouse_id`: Filter by origin warehouse
- `destination_warehouse_id`: Filter by destination warehouse (for transfers)
- `carrier_id`: Filter by carrier
- `supplier_id`: Filter by supplier (for inbound shipments)
- `status`: Filter by status (pending, in_transit, delivered, cancelled)
- `priority`: Filter by priority (low, medium, high, urgent)
- `shipment_type`: Filter by type (supplier_to_warehouse, warehouse_to_warehouse, warehouse_to_customer)
- `start_date`: Filter shipments from this date (YYYY-MM-DD)
- `end_date`: Filter shipments until this date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Examples:**
```http
GET /api/shipment-infos?status=in_transit&priority=high
GET /api/shipment-infos?shipment_type=supplier_to_warehouse&supplier_id=64f1a2b3c4d5e6f7g8h9i0j6
GET /api/shipment-infos?shipment_type=warehouse_to_warehouse&destination_warehouse_id=64f1a2b3c4d5e6f7g8h9i0j9
GET /api/shipment-infos?warehouse_id=64f1a2b3c4d5e6f7g8h9i0j1&page=2&limit=5
GET /api/shipment-infos?start_date=2024-01-01&end_date=2024-01-31
```

**Response:**
```json
{
  "shipments": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j9",
      "shipment_id": 1001,
      "status": "in_transit",
      "priority": "high",
      "shipment_date": "2024-01-10T10:30:00.000Z",
      "items": [...],
      "origin_warehouse_id": {...},
      "carrier_id": {...},
      "employee_id": {...}
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalShipments": 47,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Shipment by ID
```http
GET /api/shipment-infos/:id
```

**Response:** Same as create response with full population

### Update Shipment
```http
PUT /api/shipment-infos/:id
```

**Request Body:** Same as create, all fields optional

### Update Shipment Status
```http
PATCH /api/shipment-infos/:id/status
```

**Request Body:**
```json
{
  "status": "in_transit"
}
```

**Notes:**
- When status is set to "delivered", `actual_delivery_date` is automatically set to current date
- For inbound shipments, `received_date` is also set when status becomes "delivered"
- Only valid status transitions are allowed

### Get Shipment Statistics
```http
GET /api/shipment-infos/stats
```

**Query Parameters:**
- `warehouse_id`: Filter by warehouse
- `start_date`: Start date for statistics
- `end_date`: End date for statistics

**Response:**
```json
[
  {
    "_id": "delivered",
    "count": 25,
    "totalItems": 150
  },
  {
    "_id": "in_transit",
    "count": 8,
    "totalItems": 45
  },
  {
    "_id": "pending",
    "count": 14,
    "totalItems": 78
  }
]
```

### Delete Shipment
```http
DELETE /api/shipment-infos/:id
```

**Response:**
```json
{
  "message": "Shipment deleted successfully"
}
```

**Notes:**
- Only shipments with "pending" status can be deleted
- This prevents accidental deletion of shipments already in transit

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
7. Create Carrier
8. Create Item (reference sub-product, supplier, section)
9. Create Supplier-to-Warehouse Shipment (inbound from supplier)
10. Create Warehouse-to-Warehouse Shipment (transfer between warehouses)
11. Create Warehouse-to-Customer Shipment (outbound to customer)

### Shipment Workflow Examples

**Supplier to Warehouse (Inbound):**
1. Create supplier-to-warehouse shipment with supplier details
2. Update status to "in_transit" when supplier ships goods
3. Update status to "delivered" when goods arrive (automatically sets delivery and received dates)
4. Process received items into warehouse inventory system

**Warehouse to Warehouse (Transfer):**
1. Create warehouse-to-warehouse shipment with items and destination warehouse
2. Update status to "in_transit" when transfer begins
3. Update status to "delivered" when items arrive at destination warehouse
4. Update inventory records in both warehouses

**Warehouse to Customer (Outbound):**
1. Create warehouse-to-customer shipment with customer details
2. Update status to "in_transit" when shipment leaves warehouse
3. Update status to "delivered" when customer receives goods
4. Process delivery confirmation and update order status

This API provides full CRUD operations for comprehensive warehouse management including complete shipment tracking.