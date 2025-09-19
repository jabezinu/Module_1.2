import mongoose from 'mongoose';
import Warehouse from '../models/Warehouse.js';
import Employee from '../models/Employee.js';
import Product from '../models/Product.js';
import Item from '../models/Item.js';
import Supplier from '../models/Supplier.js';
import Carrier from '../models/Carrier.js';
import Shipment from '../models/Shipment.js';
import Admin from '../models/Admin.js';

// Get System Overview Dashboard
export const getDashboardOverview = async (req, res) => {
  try {
    const admin = req.admin;

    // Build warehouse filter based on admin permissions
    let warehouseFilter = {};
    if (admin.role !== 'super_admin') {
      warehouseFilter._id = { $in: admin.assigned_warehouses };
    }

    // Get basic counts
    const [
      warehouseCount,
      employeeCount,
      productCount,
      itemCount,
      supplierCount,
      carrierCount,
      shipmentCount
    ] = await Promise.all([
      Warehouse.countDocuments(warehouseFilter),
      Employee.countDocuments(warehouseFilter._id ? { warehouse_id: { $in: admin.assigned_warehouses } } : {}),
      Product.countDocuments(),
      Item.countDocuments(warehouseFilter._id ? { warehouse_section_id: { $in: await getWarehouseSectionIds(admin.assigned_warehouses) } } : {}),
      Supplier.countDocuments(),
      Carrier.countDocuments(),
      Shipment.countDocuments(warehouseFilter._id ? {
        $or: [
          { origin_warehouse_id: { $in: admin.assigned_warehouses } },
          { destination_warehouse_id: { $in: admin.assigned_warehouses } }
        ]
      } : {})
    ]);

    // Get recent shipments
    const recentShipments = await Shipment.find(
      warehouseFilter._id ? {
        $or: [
          { origin_warehouse_id: { $in: admin.assigned_warehouses } },
          { destination_warehouse_id: { $in: admin.assigned_warehouses } }
        ]
      } : {}
    )
      .populate('origin_warehouse_id', 'name')
      .populate('destination_warehouse_id', 'name')
      .populate('carrier_id', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('shipment_id shipment_type status shipment_date createdAt');

    // Get low stock alerts (items expiring within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await Item.find({
      expiration_date: { $lte: thirtyDaysFromNow },
      ...(warehouseFilter._id && {
        warehouse_section_id: { $in: await getWarehouseSectionIds(admin.assigned_warehouses) }
      })
    })
      .populate('sub_product_id', 'name')
      .populate('warehouse_section_id', 'name')
      .sort({ expiration_date: 1 })
      .limit(10)
      .select('item_id expiration_date');

    // Get shipment status distribution
    const shipmentStats = await Shipment.aggregate([
      ...(warehouseFilter._id ? [{
        $match: {
          $or: [
            { origin_warehouse_id: { $in: admin.assigned_warehouses } },
            { destination_warehouse_id: { $in: admin.assigned_warehouses } }
          ]
        }
      }] : []),
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: {
        warehouses: warehouseCount,
        employees: employeeCount,
        products: productCount,
        items: itemCount,
        suppliers: supplierCount,
        carriers: carrierCount,
        shipments: shipmentCount
      },
      recentShipments,
      expiringItems,
      shipmentStats,
      alerts: {
        expiringItemsCount: expiringItems.length,
        pendingShipments: shipmentStats.find(s => s._id === 'pending')?.count || 0
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      error: 'Dashboard data retrieval failed',
      message: 'An error occurred while retrieving dashboard data'
    });
  }
};

// Get Warehouse Analytics
export const getWarehouseAnalytics = async (req, res) => {
  try {
    const admin = req.admin;
    const { warehouse_id, start_date, end_date } = req.query;

    let warehouseFilter = {};
    if (admin.role !== 'super_admin') {
      warehouseFilter._id = { $in: admin.assigned_warehouses };
    }
    if (warehouse_id) {
      warehouseFilter._id = warehouse_id;
    }

    const dateFilter = {};
    if (start_date || end_date) {
      dateFilter.createdAt = {};
      if (start_date) dateFilter.createdAt.$gte = new Date(start_date);
      if (end_date) dateFilter.createdAt.$lte = new Date(end_date);
    }

    // Get warehouse details with sections and item counts
    const warehouses = await Warehouse.find(warehouseFilter)
      .populate('manager_id', 'first_name last_name')
      .lean();

    // Get analytics for each warehouse
    for (const warehouse of warehouses) {
      const sectionIds = await getWarehouseSectionIds([warehouse._id]);

      // Item counts by section
      const sectionStats = await Item.aggregate([
        { $match: { warehouse_section_id: { $in: sectionIds } } },
        {
          $lookup: {
            from: 'warehouseSections',
            localField: 'warehouse_section_id',
            foreignField: '_id',
            as: 'section'
          }
        },
        { $unwind: '$section' },
        {
          $group: {
            _id: '$section.name',
            itemCount: { $sum: 1 },
            sectionType: { $first: '$section.section_type' }
          }
        }
      ]);

      // Shipment counts
      const shipmentStats = await Shipment.aggregate([
        {
          $match: {
            $or: [
              { origin_warehouse_id: warehouse._id },
              { destination_warehouse_id: warehouse._id }
            ],
            ...dateFilter
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      warehouse.analytics = {
        sections: sectionStats,
        shipments: shipmentStats,
        totalItems: sectionStats.reduce((sum, section) => sum + section.itemCount, 0),
        totalShipments: shipmentStats.reduce((sum, shipment) => sum + shipment.count, 0)
      };
    }

    res.json({ warehouses });

  } catch (error) {
    console.error('Warehouse analytics error:', error);
    res.status(500).json({
      error: 'Warehouse analytics retrieval failed',
      message: 'An error occurred while retrieving warehouse analytics'
    });
  }
};

// Get Inventory Analytics
export const getInventoryAnalytics = async (req, res) => {
  try {
    const admin = req.admin;
    const { category, warehouse_id } = req.query;

    let warehouseFilter = {};
    if (admin.role !== 'super_admin') {
      warehouseFilter._id = { $in: admin.assigned_warehouses };
    }
    if (warehouse_id) {
      warehouseFilter._id = warehouse_id;
    }

    const sectionIds = await getWarehouseSectionIds(
      warehouseFilter._id ? [warehouseFilter._id] : admin.assigned_warehouses
    );

    // Get inventory by product category
    const inventoryByCategory = await Item.aggregate([
      { $match: { warehouse_section_id: { $in: sectionIds } } },
      {
        $lookup: {
          from: 'subproducts',
          localField: 'sub_product_id',
          foreignField: '_id',
          as: 'subproduct'
        }
      },
      { $unwind: '$subproduct' },
      {
        $lookup: {
          from: 'products',
          localField: 'subproduct.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $match: category ? { 'product.category': category } : {}
      },
      {
        $group: {
          _id: '$product.category',
          totalItems: { $sum: 1 },
          products: {
            $addToSet: {
              product_id: '$product.product_id',
              name: '$product.name',
              sku: '$product.sku'
            }
          }
        }
      },
      { $sort: { totalItems: -1 } }
    ]);

    // Get expiring items (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await Item.aggregate([
      {
        $match: {
          warehouse_section_id: { $in: sectionIds },
          expiration_date: { $lte: thirtyDaysFromNow }
        }
      },
      {
        $lookup: {
          from: 'subproducts',
          localField: 'sub_product_id',
          foreignField: '_id',
          as: 'subproduct'
        }
      },
      { $unwind: '$subproduct' },
      {
        $lookup: {
          from: 'products',
          localField: 'subproduct.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          item_id: 1,
          expiration_date: 1,
          product_name: '$product.name',
          subproduct_name: '$subproduct.name',
          days_until_expiry: {
            $floor: {
              $divide: [
                { $subtract: ['$expiration_date', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      { $sort: { expiration_date: 1 } },
      { $limit: 20 }
    ]);

    res.json({
      inventoryByCategory,
      expiringItems,
      summary: {
        totalCategories: inventoryByCategory.length,
        totalExpiringItems: expiringItems.length,
        criticalItems: expiringItems.filter(item => item.days_until_expiry <= 7).length
      }
    });

  } catch (error) {
    console.error('Inventory analytics error:', error);
    res.status(500).json({
      error: 'Inventory analytics retrieval failed',
      message: 'An error occurred while retrieving inventory analytics'
    });
  }
};

// Get Shipment Analytics
export const getShipmentAnalytics = async (req, res) => {
  try {
    const admin = req.admin;
    const { start_date, end_date, shipment_type } = req.query;

    let warehouseFilter = {};
    if (admin.role !== 'super_admin') {
      warehouseFilter = {
        $or: [
          { origin_warehouse_id: { $in: admin.assigned_warehouses } },
          { destination_warehouse_id: { $in: admin.assigned_warehouses } }
        ]
      };
    }

    const dateFilter = {};
    if (start_date || end_date) {
      dateFilter.shipment_date = {};
      if (start_date) dateFilter.shipment_date.$gte = new Date(start_date);
      if (end_date) dateFilter.shipment_date.$lte = new Date(end_date);
    }

    const typeFilter = shipment_type ? { shipment_type } : {};

    // Shipment status distribution
    const statusDistribution = await Shipment.aggregate([
      { $match: { ...warehouseFilter, ...dateFilter, ...typeFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Shipment type distribution
    const typeDistribution = await Shipment.aggregate([
      { $match: { ...warehouseFilter, ...dateFilter } },
      {
        $group: {
          _id: '$shipment_type',
          count: { $sum: 1 },
          totalItems: { $sum: { $size: '$items' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Carrier performance
    const carrierPerformance = await Shipment.aggregate([
      { $match: { ...warehouseFilter, ...dateFilter, ...typeFilter } },
      {
        $lookup: {
          from: 'carriers',
          localField: 'carrier_id',
          foreignField: '_id',
          as: 'carrier'
        }
      },
      { $unwind: '$carrier' },
      {
        $group: {
          _id: '$carrier.name',
          totalShipments: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          inTransit: {
            $sum: { $cond: [{ $eq: ['$status', 'in_transit'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          carrier: '$_id',
          totalShipments: 1,
          delivered: 1,
          inTransit: 1,
          deliveryRate: {
            $multiply: [
              { $divide: ['$delivered', { $max: ['$totalShipments', 1] }] },
              100
            ]
          }
        }
      },
      { $sort: { totalShipments: -1 } }
    ]);

    res.json({
      statusDistribution,
      typeDistribution,
      carrierPerformance,
      summary: {
        totalShipments: statusDistribution.reduce((sum, status) => sum + status.count, 0),
        totalItems: statusDistribution.reduce((sum, status) => sum + status.totalItems, 0),
        onTimeDeliveryRate: carrierPerformance.length > 0 ?
          carrierPerformance.reduce((sum, carrier) => sum + carrier.deliveryRate, 0) / carrierPerformance.length : 0
      }
    });

  } catch (error) {
    console.error('Shipment analytics error:', error);
    res.status(500).json({
      error: 'Shipment analytics retrieval failed',
      message: 'An error occurred while retrieving shipment analytics'
    });
  }
};

// Get System Health Metrics
export const getSystemHealth = async (req, res) => {
  try {
    const admin = req.admin;

    // Only super admin can access system health
    if (admin.role !== 'super_admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only super admin can access system health metrics'
      });
    }

    // Get database statistics
    const dbStats = await mongoose.connection.db.stats();

    // Get admin statistics
    const adminStats = await Admin.getStats();

    // Get system uptime (simplified)
    const uptime = process.uptime();

    res.json({
      database: {
        collections: dbStats.collections,
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes
      },
      admins: adminStats,
      system: {
        uptime: Math.floor(uptime),
        memory: process.memoryUsage(),
        version: process.version
      }
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      error: 'System health check failed',
      message: 'An error occurred while checking system health'
    });
  }
};

// Helper function to get warehouse section IDs
async function getWarehouseSectionIds(warehouseIds) {
  const WarehouseSection = mongoose.model('WarehouseSection');
  const sections = await WarehouseSection.find({ warehouse_id: { $in: warehouseIds } });
  return sections.map(section => section._id);
}