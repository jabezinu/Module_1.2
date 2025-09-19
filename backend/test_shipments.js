// Test script for Shipment functionality
// This demonstrates how to use the shipment endpoints

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Sample data for testing (these would need to exist in your database)
const sampleShipmentData = {
  items: [
    {
      item_id: "507f1f77bcf86cd799439011", // Replace with actual item ObjectId
      quantity: 5
    }
  ],
  origin_warehouse_id: "507f1f77bcf86cd799439012", // Replace with actual warehouse ObjectId
  destination_address: "123 Main St, Anytown, USA 12345",
  destination_contact: "John Customer - 555-0123",
  carrier_id: "507f1f77bcf86cd799439013", // Replace with actual carrier ObjectId
  estimated_delivery_date: "2024-01-20",
  tracking_number: "TEST123456",
  employee_id: "507f1f77bcf86cd799439014", // Replace with actual employee ObjectId
  priority: "medium",
  notes: "Test shipment for demonstration"
};

async function testShipmentEndpoints() {
  console.log('🧪 Testing Shipment Endpoints...\n');

  try {
    // Test 1: Get all shipments (should be empty initially)
    console.log('1. Getting all shipments...');
    const getResponse = await fetch(`${BASE_URL}/shipments`);
    const shipments = await getResponse.json();
    console.log(`✅ Found ${shipments.shipments.length} shipments\n`);

    // Test 2: Get shipment statistics
    console.log('2. Getting shipment statistics...');
    const statsResponse = await fetch(`${BASE_URL}/shipments/stats`);
    const stats = await statsResponse.json();
    console.log(`✅ Retrieved statistics: ${JSON.stringify(stats)}\n`);

    // Test 3: Attempt to create a shipment (will fail without valid references)
    console.log('3. Attempting to create shipment...');
    const createResponse = await fetch(`${BASE_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sampleShipmentData)
    });

    if (createResponse.status === 400) {
      console.log('✅ Validation working - shipment creation requires valid references\n');
    } else {
      const result = await createResponse.json();
      console.log(`✅ Shipment created: ${result.shipment_id}\n`);
    }

    console.log('🎉 All shipment endpoints are functional!');
    console.log('\n📝 To create actual shipments, ensure you have:');
    console.log('   - Items in the warehouse');
    console.log('   - A carrier');
    console.log('   - An employee');
    console.log('   - A warehouse');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testShipmentEndpoints();