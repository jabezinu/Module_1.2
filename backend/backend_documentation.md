
# 📘 Warehouse Management Database Schema Documentation

This schema is designed to support **multi-location warehouse management**, **open space tracking**, and **master data management** for products, suppliers, and carriers.

It provides a clear structure for storing warehouse data, assigning managers, and handling inventory from suppliers to storage sections.

---

## 🎯 Goals of the Schema

* Define **warehouse and store information** (location, size, capacity, storage sections).
* Track **available storage space** across multiple warehouses.
* Assign a **responsible manager or storekeeper** to each warehouse.
* Maintain **master data** for products, suppliers, and carriers.
* Provide a foundation for building backend services (e.g., APIs for inventory, warehouse assignment, product lookup).

---

## 🏗️ Schema Overview

The database consists of **8 main tables**:

1. **warehouse** – defines each warehouse/store.
2. **warehouse\_section** – breaks a warehouse into sections (cold storage, bulk area, etc.).
3. **employee** – stores information about warehouse managers/storekeepers.
4. **product** – defines general product information.
5. **sub\_product** – defines product variants (different sizes, packaging).
6. **item** – represents physical stock items stored in the warehouse.
7. **supplier** – stores supplier information.
8. **carrier** – stores logistics partner (delivery) information.

---

## 📦 Tables in Detail

### **1. warehouse**

Represents each warehouse or store location.

```text
warehouse
- warehouse_id (PK)
- name
- location
- size
- capacity_unit
- number_of_sections
- manager_id (FK → employee.employee_id)
```

* **location**: city or address of the warehouse.
* **size**: total storage area (e.g., in square meters).
* **capacity\_unit**: how capacity is measured (e.g., metre cube).
* **number\_of\_sections**: number of sections in the warehouse.
* **manager\_id**: links to the employee responsible for managing the warehouse.

➡️ Example:

| warehouse\_id | name          | location | size | capacity\_unit | number\_of\_sections | manager\_id |
| ------------- | ------------- | -------- | ---- | -------------- | -------------------- | ----------- |
| 1             | Central Depot | New York | 5000 | metre cube     | 0                    | 101         |

---

### **2. warehouse\_section**

Defines storage sections within a warehouse.

```text
warehouse_section
- section_id (PK)
- name
- warehouse_id (FK → warehouse.warehouse_id)
- section_type
- temperature_range
- is_available
```

* **section\_type**: e.g., "cold storage", "dry goods", "bulk area".
* **temperature\_range**: helps store sensitive products correctly.
* **is\_available**: indicates if the section is available for use.

➡️ Example:

| section\_id | name      | warehouse\_id | section\_type | temperature\_range | is\_available |
| ----------- | --------- | ------------- | ------------- | ------------------ | ------------- |
| 11          | Cold Room | 1             | Refrigerated  | 0–5°C              | true          |

---

### **3. employee**

Stores information about warehouse managers and storekeepers.

```text
employee
- employee_id (PK)
- first_name
- last_name
- role
- phone
- email
- warehouse_id (FK → warehouse.warehouse_id)
```

➡️ Example:

| employee\_id | first\_name | last\_name | role    | phone      | email                                         |
| ------------ | ----------- | ---------- | ------- | ---------- | --------------------------------------------- |
| 101          | Alice       | Johnson    | Manager | 1234567890 | [alice@company.com](mailto:alice@company.com) |

---

### **4. product**

Defines general product information.

```text
product
- product_id (PK)
- name
- sku
- description
- category
- storage_condition
```

➡️ Example:

| product\_id | name | sku     | category | storage\_condition |
| ----------- | ---- | ------- | -------- | ------------------ |
| 501         | Milk | MLK-001 | Dairy    | Refrigerated       |

---

### **5. sub\_product**

Represents product variants (e.g., same product in different sizes).

```text
sub_product
- sub_product_id (PK)
- name
- unit_size
- product_id (FK → product.product_id)
```

➡️ Example:

| sub\_product\_id | name       | unit_size | product\_id |
| ---------------- | ---------- | --------- | ----------- |
| 601              | Milk 1L    | 1L        | 501         |
| 602              | Milk 500ml | 500ml     | 501         |

---

### **6. item**

Represents stock items stored in warehouse sections.

```text
item
- item_id (PK)
- sub_product_id (FK → sub_product.sub_product_id)
- supplier_id (FK → supplier.supplier_id)
- warehouse_section_id (FK → warehouse_section.section_id)
- expiration_date
```

➡️ Example:

| item\_id | sub\_product\_id | supplier\_id | warehouse\_section\_id | expiration\_date |
| -------- | ---------------- | ------------ | ---------------------- | ---------------- |
| 701      | 601              | 801          | 11                     | 2025-03-01       |

---

### **7. supplier**

Stores information about suppliers.

```text
supplier
- supplier_id (PK)
- name
- contact_person
- phone
- email
- address
```

➡️ Example:

| supplier\_id | name       | contact\_person | phone    | email                                   |
| ------------ | ---------- | --------------- | -------- | --------------------------------------- |
| 801          | Dairy Farm | John Smith      | 98765432 | [john@dairy.com](mailto:john@dairy.com) |

---

### **8. carrier**

Stores logistics and delivery partner information.

```text
carrier
- carrier_id (PK)
- name
- phone
- email
- service_type
```

➡️ Example:

| carrier\_id | name          | phone     | email                                       | service\_type |
| ----------- | ------------- | --------- | ------------------------------------------- | ------------- |
| 901         | FastLogistics | 111222333 | [contact@fast.com](mailto:contact@fast.com) | Refrigerated  |

---

## 🔄 How the Data Flows

1. **Warehouse Setup**

   * Define each **warehouse** with its **manager**.
   * Divide warehouses into **sections** with capacity and temperature control.

2. **Product Management**

   * Add **products** (e.g., “Milk”).
   * Create **sub-products** for packaging variations (e.g., “Milk 1L”, “Milk 500ml”).

3. **Supplier & Carrier Setup**

   * Add suppliers for sourcing products.
   * Add carriers for shipping/distribution.

4. **Inventory Tracking**

   * Create **items** that represent physical stock, linked to:

     * a **sub-product** (what it is),
     * a **supplier** (who provided it),
     * a **warehouse\_section** (where it’s stored),
     * with an **expiration\_date** (if applicable).

---

## 🛠️ Using This Schema in a Backend Application

Here’s how a backend developer can use this schema:

1. **API Endpoints** (examples):

   * `POST /warehouses` → create a new warehouse.
   * `GET /warehouses/:id/sections` → list sections of a warehouse.
   * `POST /products` → add a new product.
   * `GET /items?warehouse_id=1` → list items stored in a warehouse.
   * `GET /items?section_id=11` → check available stock in a section.

2. **Space Tracking Example**

    * Query total capacity of a warehouse (`capacity_unit`).
    * Count how many items are stored.
    * Subtract to find open space available.

3. **Responsibility Assignment**

   * Each `warehouse` has a `manager_id`.
   * Fetch the `employee` details to know who is in charge.

---

## ✅ Key Takeaways

* Warehouses are divided into **sections**, each storing **items**.
* Items are linked to **sub-products**, which belong to **products**.
* Products come from **suppliers** and move via **carriers**.
* Each warehouse has a **manager** or storekeeper assigned.
* This schema is ready to be used as the **foundation of a backend system** for warehouse management.
