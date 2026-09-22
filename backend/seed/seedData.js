require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Tyre = require('../models/Tyre');
const TyreInspection = require('../models/TyreInspection');
const TyreHistory = require('../models/TyreHistory');
const SparePart = require('../models/SparePart');
const InventoryMovement = require('../models/InventoryMovement');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const WorkOrder = require('../models/WorkOrder');
const Downtime = require('../models/Downtime');
const Alert = require('../models/Alert');
const AuditLog = require('../models/AuditLog');
const SystemSetting = require('../models/SystemSetting');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');

const seed = async (options = {}) => {
  try {
    if (!options.skipConnect) {
      await connectDB();
    }

    await Promise.all([
      User.deleteMany({}),
      Equipment.deleteMany({}),
      Tyre.deleteMany({}),
      TyreInspection.deleteMany({}),
      TyreHistory.deleteMany({}),
      SparePart.deleteMany({}),
      InventoryMovement.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      WorkOrder.deleteMany({}),
      Downtime.deleteMany({}),
      Alert.deleteMany({}),
      AuditLog.deleteMany({}),
      SystemSetting.deleteMany({}),
      MaintenanceSchedule.deleteMany({})
    ]);

    const usersData = [
      {
        name: 'Mari Eswaran V (Super Admin)',
        email: 'admin@miningplatform.com',
        password: 'Password@123',
        role: 'Super Admin',
        department: 'Executive Management',
        phone: '+91 98765 43210'
      },
      {
        name: 'Rajesh Kumar',
        email: 'manager@miningplatform.com',
        password: 'Password@123',
        role: 'Maintenance Manager',
        department: 'Fleet Maintenance',
        phone: '+91 98765 43211'
      },
      {
        name: 'Anand Sharma',
        email: 'engineer@miningplatform.com',
        password: 'Password@123',
        role: 'Maintenance Engineer',
        department: 'Fleet Maintenance',
        phone: '+91 98765 43212'
      },
      {
        name: 'Suresh Patel',
        email: 'tech@miningplatform.com',
        password: 'Password@123',
        role: 'Technician',
        department: 'Mechanical Workshop',
        phone: '+91 98765 43213'
      },
      {
        name: 'Vikram Singh',
        email: 'fleet@miningplatform.com',
        password: 'Password@123',
        role: 'Fleet Manager',
        department: 'Mining Operations',
        phone: '+91 98765 43214'
      },
      {
        name: 'Karthik Raman',
        email: 'store@miningplatform.com',
        password: 'Password@123',
        role: 'Store Manager',
        department: 'Central Warehouse',
        phone: '+91 98765 43215'
      },
      {
        name: 'Pooja Verma',
        email: 'safety@miningplatform.com',
        password: 'Password@123',
        role: 'Safety Officer',
        department: 'HSE & Compliance',
        phone: '+91 98765 43216'
      },
      {
        name: 'Arun Nair',
        email: 'viewer@miningplatform.com',
        password: 'Password@123',
        role: 'Viewer',
        department: 'Auditing',
        phone: '+91 98765 43217'
      }
    ];

    const users = await User.create(usersData);
    const adminUser = users[0];
    const engineerUser = users[2];
    const techUser = users[3];

    const suppliersData = [
      {
        name: 'Caterpillar India Direct Spares',
        contactPerson: 'Manoj Joshi',
        email: 'spares@catindia.com',
        phone: '+91 80 2345 6789',
        address: 'Whitefield Industrial Area, Bengaluru',
        productsSupplied: ['Engines', 'Hydraulic Cylinders', 'Filters', 'Fasteners']
      },
      {
        name: 'Komatsu Mining Equipment Spares',
        contactPerson: 'Deepak Rao',
        email: 'sales@komatsumining.in',
        phone: '+91 44 2812 3456',
        address: 'Ambattur Industrial Estate, Chennai',
        productsSupplied: ['Transmission Parts', 'Brake Assemblies', 'Electric Drive Motors']
      },
      {
        name: 'Michelin Earthmover Tyres Division',
        contactPerson: 'Gautam Iyer',
        email: 'otr@michelin.co.in',
        phone: '+91 22 6789 0123',
        address: 'Bandra Kurla Complex, Mumbai',
        productsSupplied: ['OTR Radial Tyres', 'Tyre Pressure Sensors', 'Rims']
      },
      {
        name: 'Donaldson Filtration Solutions',
        contactPerson: 'Naveen Reddy',
        email: 'info@donaldsonfiltration.com',
        phone: '+91 40 2341 5566',
        address: 'Jeedimetla Industrial Area, Hyderabad',
        productsSupplied: ['Air Filters', 'Lube Filters', 'Hydraulic Fluid Filters']
      }
    ];
    await Supplier.create(suppliersData);

    const sparePartsData = [
      {
        partNumber: 'PN-HYD-797-01',
        name: 'CAT 797F Hoist Cylinder Seal Kit',
        category: 'Hydraulic',
        manufacturer: 'Caterpillar',
        supplier: 'Caterpillar India Direct Spares',
        unit: 'Kits',
        quantity: 12,
        minStockLevel: 4,
        maxStockLevel: 25,
        unitCost: 18500,
        storageLocation: 'Warehouse Bay 2 - Shelf B',
        compatibleEquipmentTypes: ['Haul Truck'],
        compatibleModels: ['797F']
      },
      {
        partNumber: 'PN-ENG-930-02',
        name: 'Komatsu 930E Turbocharger Core',
        category: 'Engine',
        manufacturer: 'Komatsu',
        supplier: 'Komatsu Mining Equipment Spares',
        unit: 'Pieces',
        quantity: 3,
        minStockLevel: 2,
        maxStockLevel: 8,
        unitCost: 125000,
        storageLocation: 'Heavy Rack A - Position 4',
        compatibleEquipmentTypes: ['Haul Truck'],
        compatibleModels: ['930E-5']
      },
      {
        partNumber: 'PN-BRK-797-03',
        name: 'CAT Oil-Cooled Brake Disc Pack',
        category: 'Braking',
        manufacturer: 'Caterpillar',
        supplier: 'Caterpillar India Direct Spares',
        unit: 'Sets',
        quantity: 8,
        minStockLevel: 5,
        maxStockLevel: 20,
        unitCost: 45000,
        storageLocation: 'Warehouse Bay 3 - Shelf D',
        compatibleEquipmentTypes: ['Haul Truck'],
        compatibleModels: ['797F']
      },
      {
        partNumber: 'PN-FLT-DON-04',
        name: 'Ultra-Web Heavy Duty Primary Air Filter',
        category: 'Filtration',
        manufacturer: 'Donaldson',
        supplier: 'Donaldson Filtration Solutions',
        unit: 'Pieces',
        quantity: 2,
        minStockLevel: 6,
        maxStockLevel: 30,
        unitCost: 7800,
        storageLocation: 'Warehouse Bay 1 - Shelf A',
        compatibleEquipmentTypes: ['Haul Truck', 'Hydraulic Excavator', 'Wheel Loader'],
        compatibleModels: ['797F', '930E-5', 'R9800', '994K']
      },
      {
        partNumber: 'PN-ELC-DRV-05',
        name: 'GE AC Wheel Motor Inverter Module',
        category: 'Electrical',
        manufacturer: 'Komatsu',
        supplier: 'Komatsu Mining Equipment Spares',
        unit: 'Pieces',
        quantity: 4,
        minStockLevel: 2,
        maxStockLevel: 10,
        unitCost: 240000,
        storageLocation: 'Climate-Controlled Electronics Room',
        compatibleEquipmentTypes: ['Haul Truck'],
        compatibleModels: ['930E-5']
      },
      {
        partNumber: 'PN-HYD-HOS-06',
        name: 'High Pressure 5000 PSI Armoured Hose 2"',
        category: 'Hydraulic',
        manufacturer: 'Parker',
        supplier: 'Caterpillar India Direct Spares',
        unit: 'Meters',
        quantity: 45,
        minStockLevel: 20,
        maxStockLevel: 100,
        unitCost: 2200,
        storageLocation: 'Spool Rack 2',
        compatibleEquipmentTypes: ['Hydraulic Excavator', 'Haul Truck', 'Track Dozer'],
        compatibleModels: ['R9800', '797F', 'D375A-8']
      }
    ];
    const spareParts = await SparePart.create(sparePartsData);

    const equipmentsData = [
      {
        equipmentId: 'EQ-001',
        assetNumber: 'HT-797-01',
        equipmentType: 'Haul Truck',
        manufacturer: 'Caterpillar',
        model: '797F',
        serialNumber: 'CAT0797FLA00101',
        yearOfManufacture: 2021,
        purchaseDate: new Date('2021-03-15'),
        commissioningDate: new Date('2021-04-01'),
        operatingHours: 14250,
        mileage: 85200,
        location: 'North Pit Zone A',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Ramesh Chander',
        status: 'Active',
        fuelType: 'Diesel',
        capacity: '400 Tonnes',
        maintenanceIntervalHours: 250,
        lastServiceDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        notes: 'Primary heavy haul fleet workhorse. Running Cat C175-20 ACERT.'
      },
      {
        equipmentId: 'EQ-002',
        assetNumber: 'HT-930-02',
        equipmentType: 'Haul Truck',
        manufacturer: 'Komatsu',
        model: '930E-5',
        serialNumber: 'KOM930E5IND204',
        yearOfManufacture: 2022,
        purchaseDate: new Date('2022-01-10'),
        commissioningDate: new Date('2022-02-01'),
        operatingHours: 11840,
        mileage: 69400,
        location: 'South Pit Zone B',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Gopal Krishnan',
        status: 'Active',
        fuelType: 'Diesel',
        capacity: '330 Tonnes',
        maintenanceIntervalHours: 250,
        lastServiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        notes: 'AC Electric drive drive system. High fuel efficiency rating.'
      },
      {
        equipmentId: 'EQ-003',
        assetNumber: 'EX-980-01',
        equipmentType: 'Hydraulic Excavator',
        manufacturer: 'Liebherr',
        model: 'R9800',
        serialNumber: 'LBH9800FAC089',
        yearOfManufacture: 2020,
        purchaseDate: new Date('2020-08-20'),
        commissioningDate: new Date('2020-09-15'),
        operatingHours: 19800,
        mileage: 4200,
        location: 'North Pit Face 3',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Balwinder Singh',
        status: 'Active',
        fuelType: 'Diesel',
        capacity: '42 m³ Bucket',
        maintenanceIntervalHours: 500,
        lastServiceDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: 'Dual Cummins QSK60 diesel engines. Primary pit loading excavator.'
      },
      {
        equipmentId: 'EQ-004',
        assetNumber: 'WL-994-01',
        equipmentType: 'Wheel Loader',
        manufacturer: 'Caterpillar',
        model: '994K',
        serialNumber: 'CAT0994K2021008',
        yearOfManufacture: 2021,
        purchaseDate: new Date('2021-06-11'),
        commissioningDate: new Date('2021-07-01'),
        operatingHours: 12100,
        mileage: 31200,
        location: 'Central Stockyard',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Devendra Nath',
        status: 'Under Maintenance',
        fuelType: 'Diesel',
        capacity: '19.1 m³ Bucket',
        maintenanceIntervalHours: 250,
        lastServiceDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Currently in Workshop Bay 1 for bucket tooth and pin overhaul.'
      },
      {
        equipmentId: 'EQ-005',
        assetNumber: 'DZ-375-01',
        equipmentType: 'Track Dozer',
        manufacturer: 'Komatsu',
        model: 'D375A-8',
        serialNumber: 'KOM375A800921',
        yearOfManufacture: 2023,
        purchaseDate: new Date('2023-04-18'),
        commissioningDate: new Date('2023-05-01'),
        operatingHours: 6450,
        mileage: 8200,
        location: 'Waste Dump Area 4',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Arjun Das',
        status: 'Available',
        fuelType: 'Diesel',
        capacity: '18.5 m³ Blade',
        maintenanceIntervalHours: 250,
        lastServiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        notes: 'High production ripper blade fitted.'
      },
      {
        equipmentId: 'EQ-006',
        assetNumber: 'MG-024-01',
        equipmentType: 'Motor Grader',
        manufacturer: 'Caterpillar',
        model: '24',
        serialNumber: 'CAT0024MG9881',
        yearOfManufacture: 2022,
        purchaseDate: new Date('2022-09-05'),
        commissioningDate: new Date('2022-09-20'),
        operatingHours: 8900,
        mileage: 44100,
        location: 'Haul Road Main Corridor',
        assignedDepartment: 'Mining Operations',
        assignedOperator: 'Mithun Sen',
        status: 'Breakdown',
        fuelType: 'Diesel',
        capacity: '24 ft Blade',
        maintenanceIntervalHours: 250,
        lastServiceDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        notes: 'Hydraulic steering valve malfunction. Road maintenance stopped.'
      }
    ];
    const equipments = await Equipment.create(equipmentsData);

    const tyresData = [
      {
        tyreId: 'TYR-1001',
        serialNumber: 'MIC-5980R63-001',
        brand: 'Michelin',
        model: 'XDR3',
        tyreSize: '59/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3200000,
        status: 'Installed',
        condition: 'Good',
        currentPosition: 'front-left',
        assignedEquipment: equipments[0]._id,
        installationDate: new Date('2023-02-01'),
        installationHours: 9200,
        currentOperatingHours: 5050,
        initialTreadDepth: 95,
        currentTreadDepth: 64,
        recommendedPressure: 102,
        currentPressure: 101,
        currentTemperature: 48,
        costPerHour: 633.66,
        lastInspectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1002',
        serialNumber: 'MIC-5980R63-002',
        brand: 'Michelin',
        model: 'XDR3',
        tyreSize: '59/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3200000,
        status: 'Installed',
        condition: 'Good',
        currentPosition: 'front-right',
        assignedEquipment: equipments[0]._id,
        installationDate: new Date('2023-02-01'),
        installationHours: 9200,
        currentOperatingHours: 5050,
        initialTreadDepth: 95,
        currentTreadDepth: 62,
        recommendedPressure: 102,
        currentPressure: 103,
        currentTemperature: 49,
        costPerHour: 633.66,
        lastInspectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1003',
        serialNumber: 'MIC-5980R63-003',
        brand: 'Michelin',
        model: 'XDR3',
        tyreSize: '59/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3200000,
        status: 'Installed',
        condition: 'Fair',
        currentPosition: 'rear-left-outer',
        assignedEquipment: equipments[0]._id,
        installationDate: new Date('2023-02-01'),
        installationHours: 9200,
        currentOperatingHours: 5050,
        initialTreadDepth: 95,
        currentTreadDepth: 48,
        recommendedPressure: 102,
        currentPressure: 98,
        currentTemperature: 52,
        costPerHour: 633.66,
        lastInspectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1004',
        serialNumber: 'MIC-5980R63-004',
        brand: 'Michelin',
        model: 'XDR3',
        tyreSize: '59/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-01-15'),
        purchaseCost: 3200000,
        status: 'Installed',
        condition: 'Poor',
        currentPosition: 'rear-right-outer',
        assignedEquipment: equipments[0]._id,
        installationDate: new Date('2023-02-01'),
        installationHours: 9200,
        currentOperatingHours: 5050,
        initialTreadDepth: 95,
        currentTreadDepth: 28,
        recommendedPressure: 102,
        currentPressure: 91,
        currentTemperature: 58,
        costPerHour: 633.66,
        lastInspectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1005',
        serialNumber: 'BRI-5380R63-101',
        brand: 'Bridgestone',
        model: 'MasterCore',
        tyreSize: '53/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-06-10'),
        purchaseCost: 2850000,
        status: 'Installed',
        condition: 'Excellent',
        currentPosition: 'front-left',
        assignedEquipment: equipments[1]._id,
        installationDate: new Date('2023-07-01'),
        installationHours: 8500,
        currentOperatingHours: 3340,
        initialTreadDepth: 88,
        currentTreadDepth: 74,
        recommendedPressure: 105,
        currentPressure: 105,
        currentTemperature: 44,
        costPerHour: 853.29,
        lastInspectionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1006',
        serialNumber: 'BRI-5380R63-102',
        brand: 'Bridgestone',
        model: 'MasterCore',
        tyreSize: '53/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2023-06-10'),
        purchaseCost: 2850000,
        status: 'Installed',
        condition: 'Critical',
        currentPosition: 'front-right',
        assignedEquipment: equipments[1]._id,
        installationDate: new Date('2023-07-01'),
        installationHours: 8500,
        currentOperatingHours: 3340,
        initialTreadDepth: 88,
        currentTreadDepth: 14,
        recommendedPressure: 105,
        currentPressure: 88,
        currentTemperature: 64,
        costPerHour: 853.29,
        lastInspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        nextInspectionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        tyreId: 'TYR-1007',
        serialNumber: 'GOO-4000R57-201',
        brand: 'Goodyear',
        model: 'RM-4A+',
        tyreSize: '40.00R57',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2024-01-20'),
        purchaseCost: 1950000,
        status: 'In Stock',
        condition: 'Excellent',
        currentPosition: 'unassigned',
        initialTreadDepth: 82,
        currentTreadDepth: 82,
        recommendedPressure: 98,
        currentPressure: 98,
        currentOperatingHours: 0,
        costPerHour: 0
      },
      {
        tyreId: 'TYR-1008',
        serialNumber: 'GOO-4000R57-202',
        brand: 'Goodyear',
        model: 'RM-4A+',
        tyreSize: '40.00R57',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2024-01-20'),
        purchaseCost: 1950000,
        status: 'In Stock',
        condition: 'Excellent',
        currentPosition: 'unassigned',
        initialTreadDepth: 82,
        currentTreadDepth: 82,
        recommendedPressure: 98,
        currentPressure: 98,
        currentOperatingHours: 0,
        costPerHour: 0
      },
      {
        tyreId: 'TYR-1009',
        serialNumber: 'MIC-5980R63-OLD',
        brand: 'Michelin',
        model: 'XDR2',
        tyreSize: '59/80R63',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2021-02-10'),
        purchaseCost: 2900000,
        status: 'Under Repair',
        condition: 'Poor',
        currentPosition: 'unassigned',
        initialTreadDepth: 95,
        currentTreadDepth: 22,
        recommendedPressure: 102,
        currentPressure: 95,
        currentOperatingHours: 7800,
        costPerHour: 371.79
      },
      {
        tyreId: 'TYR-1010',
        serialNumber: 'TIT-2700R49-SCRAP',
        brand: 'Titan',
        model: 'DTH',
        tyreSize: '27.00R49',
        tyreType: 'Radial OTR',
        purchaseDate: new Date('2020-05-15'),
        purchaseCost: 1200000,
        status: 'Scrapped',
        condition: 'Critical',
        currentPosition: 'unassigned',
        initialTreadDepth: 75,
        currentTreadDepth: 6,
        recommendedPressure: 95,
        currentPressure: 0,
        currentOperatingHours: 9400,
        costPerHour: 127.66
      }
    ];
    const tyres = await Tyre.create(tyresData);

    await TyreInspection.create([
      {
        tyre: tyres[0]._id,
        equipment: equipments[0]._id,
        inspectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        inspector: 'Suresh Patel (Technician)',
        treadDepth: 64,
        pressure: 101,
        temperature: 48,
        visualCondition: 'Good',
        damageType: 'None',
        sidewallCondition: 'Intact',
        beadCondition: 'Normal',
        recommendation: 'Continue Service',
        notes: 'Tread wear even across shoulders.'
      },
      {
        tyre: tyres[3]._id,
        equipment: equipments[0]._id,
        inspectionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        inspector: 'Suresh Patel (Technician)',
        treadDepth: 28,
        pressure: 91,
        temperature: 58,
        visualCondition: 'Poor',
        damageType: 'Sidewall Damage',
        sidewallCondition: 'Minor Scuffs',
        beadCondition: 'Normal',
        recommendation: 'Rotate Position',
        notes: 'Outer shoulder cut detected from sharp bench rock. Scheduled for rotation.'
      },
      {
        tyre: tyres[5]._id,
        equipment: equipments[1]._id,
        inspectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        inspector: 'Pooja Verma (Safety Officer)',
        treadDepth: 14,
        pressure: 88,
        temperature: 64,
        visualCondition: 'Critical',
        damageType: 'Uneven Wear',
        sidewallCondition: 'Deep Cuts',
        beadCondition: 'Minor Wear',
        recommendation: 'Send for Retread',
        notes: 'Tread depth below critical 15mm limit. Immediate replacement recommended.'
      }
    ]);

    await TyreHistory.create([
      {
        tyre: tyres[0]._id,
        equipment: equipments[0]._id,
        eventType: 'Installation',
        toPosition: 'front-left',
        equipmentHours: 9200,
        tyreHours: 0,
        treadDepth: 95,
        pressure: 102,
        reason: 'New tyre installation',
        performedBy: 'Suresh Patel'
      },
      {
        tyre: tyres[5]._id,
        equipment: equipments[1]._id,
        eventType: 'Installation',
        toPosition: 'front-right',
        equipmentHours: 8500,
        tyreHours: 0,
        treadDepth: 88,
        pressure: 105,
        reason: 'Fleet commissioning fitment',
        performedBy: 'Suresh Patel'
      }
    ]);

    const workOrdersData = [
      {
        workOrderNumber: 'WO-2026-0001',
        equipment: equipments[0]._id,
        maintenanceType: 'Preventive',
        priority: 'Medium',
        problemDescription: '250-Hour Periodic Service Inspection & Engine Oil Replacement',
        scheduledDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        assignedEngineer: engineerUser._id,
        assignedTechnician: techUser._id,
        estimatedDuration: 4,
        actualDuration: 4.5,
        estimatedCost: 35000,
        actualLaborCost: 8000,
        actualPartsCost: 26300,
        actualCost: 34300,
        partsUsed: [
          {
            part: spareParts[3]._id,
            partNumber: spareParts[3].partNumber,
            name: spareParts[3].name,
            quantity: 2,
            unitCost: spareParts[3].unitCost,
            totalCost: 2 * spareParts[3].unitCost
          }
        ],
        checklist: [
          { task: 'Engine oil & filter replacement', status: 'Passed', isCritical: true },
          { task: 'Hydraulic high-pressure line inspection', status: 'Passed', isCritical: true },
          { task: 'Brake accumulator pre-charge test', status: 'Passed', isCritical: true },
          { task: 'Automatic lubrication system greasing', status: 'Passed', isCritical: false }
        ],
        completionNotes: 'Replaced air filters and engine oil. All hydraulic pressures within Cat OEM specs.',
        status: 'Completed',
        completedBy: adminUser._id,
        completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000)
      },
      {
        workOrderNumber: 'WO-2026-0002',
        equipment: equipments[3]._id,
        maintenanceType: 'Corrective',
        priority: 'High',
        problemDescription: 'CAT 994K Wheel Loader main hoist cylinder leaking hydraulic fluid',
        scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        assignedEngineer: engineerUser._id,
        assignedTechnician: techUser._id,
        estimatedDuration: 6,
        actualDuration: 2,
        estimatedCost: 55000,
        actualLaborCost: 4000,
        actualPartsCost: 18500,
        actualCost: 22500,
        partsUsed: [
          {
            part: spareParts[0]._id,
            partNumber: spareParts[0].partNumber,
            name: spareParts[0].name,
            quantity: 1,
            unitCost: spareParts[0].unitCost,
            totalCost: spareParts[0].unitCost
          }
        ],
        checklist: [
          { task: 'Depressurize hydraulic circuit', status: 'Passed', isCritical: true },
          { task: 'Remove and rebuild cylinder seal gland', status: 'In Progress', isCritical: true },
          { task: 'Replace backup rings and buffer seals', status: 'Pending', isCritical: true },
          { task: 'Pressure test cylinder to 4500 PSI', status: 'Pending', isCritical: true }
        ],
        status: 'In Progress'
      },
      {
        workOrderNumber: 'WO-2026-0003',
        equipment: equipments[5]._id,
        maintenanceType: 'Breakdown',
        priority: 'Critical',
        problemDescription: 'Motor Grader 24 sudden hydraulic steering lockup on main ramp',
        scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedEngineer: engineerUser._id,
        assignedTechnician: techUser._id,
        estimatedDuration: 8,
        actualDuration: 0,
        estimatedCost: 85000,
        actualLaborCost: 0,
        actualPartsCost: 0,
        actualCost: 0,
        checklist: [
          { task: 'Lockout/Tagout machine and secure blade', status: 'Passed', isCritical: true },
          { task: 'Diagnose steering orbitrol valve failure', status: 'In Progress', isCritical: true },
          { task: 'Flush steering circuit contamination', status: 'Pending', isCritical: true }
        ],
        status: 'Open'
      },
      {
        workOrderNumber: 'WO-2026-0004',
        equipment: equipments[1]._id,
        maintenanceType: 'Inspection',
        priority: 'Critical',
        problemDescription: 'Urgent tyre changeout required for TYR-1006 on Komatsu 930E (Tread 14mm)',
        scheduledDate: new Date(),
        assignedEngineer: engineerUser._id,
        assignedTechnician: techUser._id,
        estimatedDuration: 3,
        actualDuration: 0,
        estimatedCost: 15000,
        actualLaborCost: 0,
        actualPartsCost: 0,
        actualCost: 0,
        checklist: [
          { task: 'Jack and block front axle securely', status: 'Pending', isCritical: true },
          { task: 'Remove wheel nuts with hydraulic torque wrench', status: 'Pending', isCritical: true },
          { task: 'Mount replacement OTR tyre from warehouse', status: 'Pending', isCritical: true }
        ],
        status: 'Assigned'
      }
    ];
    await WorkOrder.create(workOrdersData);

    await Downtime.create([
      {
        equipment: equipments[0]._id,
        startTime: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - (12 * 24 * 60 * 60 * 1000 - 4.5 * 60 * 60 * 1000)),
        durationHours: 4.5,
        category: 'Mechanical',
        reason: 'Scheduled 250h maintenance shut',
        impactLevel: 'Minor'
      },
      {
        equipment: equipments[3]._id,
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        durationHours: 72,
        category: 'Hydraulic',
        reason: 'Main hoist cylinder seal leak',
        impactLevel: 'Major'
      },
      {
        equipment: equipments[5]._id,
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        durationHours: 24,
        category: 'Hydraulic',
        reason: 'Steering orbitrol failure on haul ramp',
        impactLevel: 'Critical'
      }
    ]);

    await Alert.create([
      {
        alertType: 'Critical Tyre Condition',
        title: 'Tyre Tread Critical: TYR-1006',
        message: 'Tyre TYR-1006 on Komatsu 930E (FR) has 14mm tread depth remaining (Critical threshold <15mm). Immediate removal required.',
        severity: 'Critical',
        relatedEntity: {
          entityType: 'Tyre',
          entityId: tyres[5]._id,
          identifier: 'TYR-1006'
        }
      },
      {
        alertType: 'Critical Equipment Breakdown',
        title: 'Equipment Breakdown: MG-024-01',
        message: 'Caterpillar 24 Motor Grader suffered steering hydraulic failure. Haul road grading halted.',
        severity: 'Critical',
        relatedEntity: {
          entityType: 'Equipment',
          entityId: equipments[5]._id,
          identifier: 'EQ-006'
        }
      },
      {
        alertType: 'Low Stock',
        title: 'Low Stock: Primary Air Filters (PN-FLT-DON-04)',
        message: 'Current stock is 2 units, below minimum reorder threshold of 6 units.',
        severity: 'Warning',
        relatedEntity: {
          entityType: 'SparePart',
          entityId: spareParts[3]._id,
          identifier: 'PN-FLT-DON-04'
        }
      },
      {
        alertType: 'Maintenance Due',
        title: 'Upcoming Service Due: Liebherr R9800',
        message: 'Excavator EX-980-01 is due for 500-hour engine & hydraulic service within 48 hours.',
        severity: 'Warning',
        relatedEntity: {
          entityType: 'Equipment',
          entityId: equipments[2]._id,
          identifier: 'EQ-003'
        }
      }
    ]);

    await MaintenanceSchedule.create([
      {
        title: '250-Hour Standard Haul Truck PM Inspection',
        equipment: equipments[0]._id,
        serviceType: 'Preventive',
        intervalType: 'Hours',
        intervalValue: 250,
        lastTriggerValue: 14000,
        nextDueValue: 14250,
        estimatedDuration: 4,
        estimatedCost: 35000,
        checklistTemplate: [
          { task: 'Engine oil and filter change', isCritical: true },
          { task: 'Brake accumulator pressure check', isCritical: true },
          { task: 'Hydraulic fluid sample analysis', isCritical: false }
        ]
      },
      {
        title: 'Weekly Heavy OTR Tyre Pressure & Tread Survey',
        equipment: equipments[0]._id,
        serviceType: 'Inspection',
        intervalType: 'Calendar',
        intervalValue: 7,
        lastTriggerValue: 0,
        nextDueValue: 7,
        estimatedDuration: 1.5,
        estimatedCost: 5000,
        checklistTemplate: [
          { task: 'Cold inflation pressure check on all 6 wheel positions', isCritical: true },
          { task: '3-point groove depth measurement', isCritical: true },
          { task: 'Inspect for rock drilling and shoulder cuts', isCritical: true }
        ]
      }
    ]);

    await PurchaseOrder.create({
      poNumber: 'PO-2026-0001',
      supplier: 'Caterpillar India Direct Spares',
      orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      items: [
        {
          part: spareParts[3]._id,
          partNumber: spareParts[3].partNumber,
          name: spareParts[3].name,
          quantity: 20,
          unitCost: spareParts[3].unitCost,
          totalCost: 20 * spareParts[3].unitCost
        },
        {
          part: spareParts[0]._id,
          partNumber: spareParts[0].partNumber,
          name: spareParts[0].name,
          quantity: 5,
          unitCost: spareParts[0].unitCost,
          totalCost: 5 * spareParts[0].unitCost
        }
      ],
      totalAmount: 248500,
      status: 'Ordered',
      createdBy: 'Karthik Raman (Store Manager)'
    });

    await SystemSetting.create({
      key: 'global_config',
      maintenanceLeadHours: 50,
      maintenanceLeadDays: 7,
      tyreTreadCriticalMm: 15,
      tyrePressureMinPsi: 90,
      tyrePressureMaxPsi: 115,
      lowStockThresholdDefault: 5,
      currency: 'INR',
      locations: [
        { name: 'North Pit Zone A', type: 'Pit' },
        { name: 'South Pit Zone B', type: 'Pit' },
        { name: 'Central Heavy Workshop', type: 'Workshop' },
        { name: 'Tyre Fitment Bay 1', type: 'Workshop' },
        { name: 'Central Stockyard', type: 'Stockyard' },
        { name: 'Waste Dump Area 4', type: 'Pit' }
      ],
      departments: [
        { name: 'Mining Operations' },
        { name: 'Fleet Maintenance' },
        { name: 'Tyre Shop & Service' },
        { name: 'Warehouse & Spares' },
        { name: 'HSE & Compliance' }
      ]
    });

    await AuditLog.create([
      {
        userName: 'Mari Eswaran V (Super Admin)',
        userRole: 'Super Admin',
        action: 'SYSTEM_INITIALIZATION',
        module: 'Settings',
        description: 'System initialized with mining fleet master datasets and standard operating parameters'
      },
      {
        userName: 'Rajesh Kumar',
        userRole: 'Maintenance Manager',
        action: 'SCHEDULE_MAINTENANCE',
        module: 'Maintenance',
        description: 'Scheduled weekly OTR tyre survey and 250h PM checks'
      }
    ]);

    console.log('Seed completed successfully!');
    if (!options?.skipDisconnect) {
      await disconnectDB();
      process.exit(0);
    }
  } catch (err) {
    console.error('Seed Error:', err);
    if (!options?.skipDisconnect) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
