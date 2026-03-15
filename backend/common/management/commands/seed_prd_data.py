from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import random

from django.contrib.auth.hashers import make_password
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction

from actions.models import AssignmentStatus, ItemAssignment, ItemCondition
from audit.models import InventoryActionType, InventoryAuditLog
from catalog.models import Category, CustomFieldDefinition, CustomFieldType
from common.models import NotificationChannel, NotificationDelivery, NotificationStatus
from hierarchy.models import Office, OfficeLevels
from inventory.models import (
    ConsumableStock,
    ConsumableStockTransaction,
    FixedAsset,
    InventoryItem,
    InventoryItemType,
    InventoryStatus,
    StockTransactionType,
)
from reports.models import GeneratedReport, ReportGenerationStatus, ReportType
from users.models import User, UserRoles


PROVINCES = [
    ("Koshi Province Office", "NPL-P01", 137),
    ("Madhesh Province Office", "NPL-P02", 136),
    ("Bagmati Province Office", "NPL-P03", 119),
    ("Gandaki Province Office", "NPL-P04", 85),
    ("Lumbini Province Office", "NPL-P05", 109),
    ("Karnali Province Office", "NPL-P06", 79),
    ("Sudurpashchim Province Office", "NPL-P07", 88),
]

WARD_TOTAL = 6713
DEFAULT_ITEM_TARGET = 600
DEFAULT_ASSIGNMENT_TARGET = 180
DEFAULT_PASSWORD = "ims12345"
SEED_MARKER = "PRD-DUMMY"

CUSTOM_FIELDS = [
    ("Laptop", "RAM", CustomFieldType.SELECT, True, False, ["8GB", "16GB", "32GB"]),
    ("Laptop", "Processor", CustomFieldType.TEXT, True, False, []),
    ("Laptop", "Storage", CustomFieldType.SELECT, True, False, ["256GB SSD", "512GB SSD", "1TB SSD"]),
    ("Printer", "Model", CustomFieldType.TEXT, True, False, []),
    ("Printer", "Ink Type", CustomFieldType.SELECT, True, False, []),
    ("Biometric Device", "Vendor", CustomFieldType.TEXT, True, False, []),
    ("Registration Forms", "Form Type", CustomFieldType.SELECT, True, False, ["Birth", "Death", "Marriage", "Migration"]),
    ("Stationery", "Unit", CustomFieldType.TEXT, True, False, []),
    ("Toner/Ink", "Color", CustomFieldType.SELECT, False, False, ["Black", "Cyan", "Magenta", "Yellow"]),
]

FIXED_BLUEPRINTS = [
    {
        "category": "Laptop",
        "titles": ["Dell Latitude", "Lenovo ThinkPad", "HP ProBook"],
        "manufacturers": ["Dell", "Lenovo", "HP"],
        "department": "Registration",
        "dynamic_data": lambda rnd, serial: {
            "RAM": rnd.choice(["8GB", "16GB", "32GB"]),
            "Processor": rnd.choice(["Intel i5", "Intel i7", "Ryzen 5"]),
            "Storage": rnd.choice(["256GB SSD", "512GB SSD", "1TB SSD"]),
            "device_code": f"LAP-{serial:05d}",
        },
        "price_range": (85000, 155000),
    },
    {
        "category": "Desktop",
        "titles": ["Lenovo ThinkCentre", "Dell OptiPlex", "HP EliteDesk"],
        "manufacturers": ["Lenovo", "Dell", "HP"],
        "department": "Data Entry",
        "dynamic_data": lambda rnd, serial: {
            "processor": rnd.choice(["Intel i3", "Intel i5", "Ryzen 5"]),
            "storage": rnd.choice(["256GB SSD", "512GB SSD"]),
            "device_code": f"DESK-{serial:05d}",
        },
        "price_range": (65000, 120000),
    },
    {
        "category": "Printer",
        "titles": ["HP LaserJet Pro", "Brother HL", "Canon ImageClass"],
        "manufacturers": ["HP", "Brother", "Canon"],
        "department": "Office Operations",
        "dynamic_data": lambda rnd, serial: {
            "Model": rnd.choice(["M404dn", "HL-L2460DW", "MF272dw"]),
            "Ink Type": rnd.choice(["Laser Toner", "Inkjet"]),
            "device_code": f"PRN-{serial:05d}",
        },
        "price_range": (32000, 65000),
    },
    {
        "category": "Scanner",
        "titles": ["Canon ScanFront", "Epson WorkForce", "Fujitsu ScanSnap"],
        "manufacturers": ["Canon", "Epson", "Fujitsu"],
        "department": "Archive",
        "dynamic_data": lambda rnd, serial: {"device_code": f"SCN-{serial:05d}", "scan_speed": f"{rnd.randint(20, 50)} ppm"},
        "price_range": (28000, 90000),
    },
    {
        "category": "Biometric Device",
        "titles": ["Biometric Enrollment Kit", "Fingerprint Device", "ID Verification Terminal"],
        "manufacturers": ["SecuGen", "Mantra", "ZKTeco"],
        "department": "Identity Services",
        "dynamic_data": lambda rnd, serial: {
            "Vendor": rnd.choice(["SecuGen", "Mantra", "ZKTeco"]),
            "device_code": f"BIO-{serial:05d}",
        },
        "price_range": (40000, 140000),
    },
    {
        "category": "Furniture",
        "titles": ["Steel Filing Cabinet", "Front Desk Unit", "Operator Workstation"],
        "manufacturers": ["Nepal Furnish", "Office Craft", "Everest Steel"],
        "department": "Administration",
        "dynamic_data": lambda rnd, serial: {"device_code": f"FUR-{serial:05d}", "material": rnd.choice(["Steel", "Laminated Wood"])},
        "price_range": (12000, 35000),
    },
    {
        "category": "Networking Equipment",
        "titles": ["Core Router", "24-Port Switch", "Branch Firewall"],
        "manufacturers": ["Cisco", "TP-Link", "MikroTik"],
        "department": "IT",
        "dynamic_data": lambda rnd, serial: {"device_code": f"NET-{serial:05d}", "ports": rnd.choice(["8", "16", "24", "48"])},
        "price_range": (18000, 120000),
    },
    {
        "category": "UPS/Inverter",
        "titles": ["Office UPS", "Rack UPS", "Power Backup Inverter"],
        "manufacturers": ["APC", "Luminous", "Vertiv"],
        "department": "IT",
        "dynamic_data": lambda rnd, serial: {"device_code": f"UPS-{serial:05d}", "capacity": rnd.choice(["1KVA", "2KVA", "3KVA"])},
        "price_range": (25000, 85000),
    },
    {
        "category": "Server/Storage",
        "titles": ["Database Server", "Backup Storage Unit", "Application Server"],
        "manufacturers": ["Dell", "HPE", "Synology"],
        "department": "Data Center",
        "dynamic_data": lambda rnd, serial: {"device_code": f"SRV-{serial:05d}", "rack_unit": rnd.choice(["1U", "2U", "4U"])},
        "price_range": (180000, 720000),
    },
    {
        "category": "CCTV/Access Device",
        "titles": ["Access Door Controller", "CCTV Monitoring Camera", "Attendance Terminal"],
        "manufacturers": ["Hikvision", "Dahua", "ZKTeco"],
        "department": "Security",
        "dynamic_data": lambda rnd, serial: {"device_code": f"SEC-{serial:05d}", "coverage": rnd.choice(["Indoor", "Outdoor"])},
        "price_range": (14000, 55000),
    },
]

CONSUMABLE_BLUEPRINTS = [
    {
        "category": "Registration Forms",
        "titles": ["Citizen Registration Form", "Vital Event Form", "Ward Registration Booklet"],
        "manufacturers": ["Govt Printing Press", "DoNIDCR Print Cell"],
        "department": "Registration",
        "dynamic_data": lambda rnd, serial: {
            "Form Type": rnd.choice(["Birth", "Death", "Marriage", "Migration"]),
            "batch_code": f"FORM-{serial:05d}",
        },
        "unit": "pcs",
        "price_range": (8, 22),
        "quantity_range": (250, 4000),
        "threshold_range": (80, 600),
    },
    {
        "category": "Stationery",
        "titles": ["A4 Office Paper", "Blue Ball Pen", "File Folder Pack"],
        "manufacturers": ["Nepal Paper Co", "OfficeOne", "Himal Stationers"],
        "department": "Administration",
        "dynamic_data": lambda rnd, serial: {"Unit": rnd.choice(["ream", "box", "pack"]), "batch_code": f"STAT-{serial:05d}"},
        "unit": "pack",
        "price_range": (120, 750),
        "quantity_range": (20, 400),
        "threshold_range": (8, 60),
    },
    {
        "category": "Toner/Ink",
        "titles": ["Laser Toner Cartridge", "Ink Refill Bottle", "Printer Toner Pack"],
        "manufacturers": ["HP", "Canon", "Brother"],
        "department": "Office Operations",
        "dynamic_data": lambda rnd, serial: {"Color": rnd.choice(["Black", "Cyan", "Magenta", "Yellow"]), "batch_code": f"TNR-{serial:05d}"},
        "unit": "pcs",
        "price_range": (1800, 12500),
        "quantity_range": (8, 180),
        "threshold_range": (2, 25),
    },
    {
        "category": "Printer Ribbon",
        "titles": ["Dot Matrix Ribbon", "Thermal Ribbon Roll", "Security Ribbon Pack"],
        "manufacturers": ["Epson", "Generic", "Govt Supply"],
        "department": "Office Operations",
        "dynamic_data": lambda rnd, serial: {"batch_code": f"RBN-{serial:05d}", "compatibility": rnd.choice(["TM-U220", "LQ-310", "Generic"])},
        "unit": "pcs",
        "price_range": (350, 2200),
        "quantity_range": (10, 140),
        "threshold_range": (3, 18),
    },
    {
        "category": "Batteries",
        "titles": ["AA Battery Pack", "UPS Backup Battery", "CMOS Battery"],
        "manufacturers": ["Eveready", "Panasonic", "Exide"],
        "department": "IT",
        "dynamic_data": lambda rnd, serial: {"batch_code": f"BAT-{serial:05d}", "type": rnd.choice(["AA", "AAA", "12V", "CR2032"])},
        "unit": "pcs",
        "price_range": (60, 4500),
        "quantity_range": (15, 220),
        "threshold_range": (4, 30),
    },
    {
        "category": "Cables/Connectors",
        "titles": ["LAN Cable Box", "HDMI Connector", "Power Adapter Cable"],
        "manufacturers": ["TP-Link", "UGreen", "D-Link"],
        "department": "IT",
        "dynamic_data": lambda rnd, serial: {"batch_code": f"CBL-{serial:05d}", "length": rnd.choice(["1m", "3m", "5m", "100m"])},
        "unit": "pcs",
        "price_range": (90, 8500),
        "quantity_range": (10, 160),
        "threshold_range": (3, 25),
    },
    {
        "category": "Cleaning/Repair Consumables",
        "titles": ["Screen Cleaning Kit", "Repair Tool Pack", "Compressed Air Can"],
        "manufacturers": ["OfficeCare", "TechClean", "RepairX"],
        "department": "Maintenance",
        "dynamic_data": lambda rnd, serial: {"batch_code": f"CLN-{serial:05d}", "kit_size": rnd.choice(["Small", "Medium", "Large"])},
        "unit": "kit",
        "price_range": (180, 2400),
        "quantity_range": (6, 90),
        "threshold_range": (2, 15),
    },
    {
        "category": "ID Card Consumables",
        "titles": ["Blank Card Pack", "Lamination Film", "Card Printer Ribbon"],
        "manufacturers": ["Entrust", "Zebra", "Govt Supply"],
        "department": "Identity Services",
        "dynamic_data": lambda rnd, serial: {"batch_code": f"IDC-{serial:05d}", "pack_type": rnd.choice(["100 cards", "250 cards", "Ribbon set"])},
        "unit": "pack",
        "price_range": (900, 22000),
        "quantity_range": (6, 120),
        "threshold_range": (2, 18),
    },
]

CORE_ITEMS = [
    {
        "item_number": "FA-0001",
        "title": "Dell Latitude 5440",
        "category": "Laptop",
        "office_code": "NPL-W01-001-01",
        "item_type": InventoryItemType.FIXED_ASSET,
        "status": InventoryStatus.ACTIVE,
        "amount": Decimal("120000.00"),
        "price": Decimal("120000.00"),
        "currency": "NPR",
        "store": "Central Store",
        "project": "National ID Rollout",
        "department": "Registration",
        "manufacturer": "Dell",
        "purchased_date": date(2025, 7, 20),
        "description": f"{SEED_MARKER} Core laptop for assignment workflow.",
        "dynamic_data": {"RAM": "16GB", "Processor": "Intel i7", "Storage": "512GB SSD"},
        "fixed_asset": {
            "asset_tag": "LAP-W01-0001",
            "serial_number": "SN-LAP-0001",
            "purchase_date": date(2025, 7, 20),
            "warranty_expiry_date": date(2028, 7, 20),
        },
    },
    {
        "item_number": "FA-0002",
        "title": "HP LaserJet Pro",
        "category": "Printer",
        "office_code": "NPL-L03-001",
        "item_type": InventoryItemType.FIXED_ASSET,
        "status": InventoryStatus.ACTIVE,
        "amount": Decimal("45000.00"),
        "price": Decimal("45000.00"),
        "currency": "NPR",
        "store": "Bagmati Store",
        "project": "Civil Registration Modernization",
        "department": "Office Operations",
        "manufacturer": "HP",
        "purchased_date": date(2025, 8, 10),
        "description": f"{SEED_MARKER} Core printer for return workflow.",
        "dynamic_data": {"Model": "M404dn", "Ink Type": "Laser Toner"},
        "fixed_asset": {
            "asset_tag": "PRN-L03-0001",
            "serial_number": "SN-PRN-0001",
            "purchase_date": date(2025, 8, 10),
            "warranty_expiry_date": date(2027, 8, 10),
        },
    },
    {
        "item_number": "CON-0001",
        "title": "Citizen Registration Form",
        "category": "Registration Forms",
        "office_code": "NPL-W01-001-01",
        "item_type": InventoryItemType.CONSUMABLE,
        "status": InventoryStatus.ACTIVE,
        "amount": Decimal("10000.00"),
        "price": Decimal("10.00"),
        "currency": "NPR",
        "store": "Ward Supply Shelf",
        "project": "National ID Rollout",
        "department": "Registration",
        "manufacturer": "Govt Printing Press",
        "purchased_date": date(2025, 7, 25),
        "description": f"{SEED_MARKER} Core consumable for stock workflow.",
        "dynamic_data": {"Form Type": "Birth"},
        "consumable_stock": {
            "initial_quantity": Decimal("1000"),
            "quantity": Decimal("920"),
            "min_threshold": Decimal("200"),
            "unit": "pcs",
        },
    },
    {
        "item_number": "CON-0002",
        "title": "A4 Office Paper",
        "category": "Stationery",
        "office_code": "NPL-L03-001",
        "item_type": InventoryItemType.CONSUMABLE,
        "status": InventoryStatus.ACTIVE,
        "amount": Decimal("15000.00"),
        "price": Decimal("500.00"),
        "currency": "NPR",
        "store": "Local Office Store",
        "project": "Office Operations",
        "department": "Admin",
        "manufacturer": "Nepal Paper Co",
        "purchased_date": date(2025, 9, 1),
        "description": f"{SEED_MARKER} Core stationery stock sample.",
        "dynamic_data": {"Unit": "ream"},
        "consumable_stock": {
            "initial_quantity": Decimal("100"),
            "quantity": Decimal("60"),
            "min_threshold": Decimal("20"),
            "unit": "ream",
        },
    },
]


class Command(BaseCommand):
    help = "Seed PRD-shaped hierarchy and dummy IMS data across offices, users, items, assignments, stock, notifications, and reports."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing data.")
        parser.add_argument(
            "--target-items",
            type=int,
            default=DEFAULT_ITEM_TARGET,
            help=f"Total inventory items to maintain. Default: {DEFAULT_ITEM_TARGET}.",
        )
        parser.add_argument(
            "--target-assignments",
            type=int,
            default=DEFAULT_ASSIGNMENT_TARGET,
            help=f"Target assignment rows to maintain. Default: {DEFAULT_ASSIGNMENT_TARGET}.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        target_items = max(options["target_items"], len(CORE_ITEMS))
        target_assignments = max(options["target_assignments"], 2)

        self.stdout.write(
            f"Seeding PRD dummy data with {target_items} items and {target_assignments} assignments..."
        )

        with transaction.atomic():
            call_command("seed_initial_categories", dry_run=dry_run, stdout=self.stdout)
            offices = self._seed_offices(dry_run=dry_run)
            users = self._seed_users(offices=offices, dry_run=dry_run)
            self._seed_custom_fields(dry_run=dry_run)
            items = self._seed_inventory(offices=offices, target_items=target_items, dry_run=dry_run)
            assignments = self._seed_assignments(
                items=items,
                users=users,
                offices=offices,
                target_assignments=target_assignments,
                dry_run=dry_run,
            )
            self._seed_stock_transactions(items=items, users=users, dry_run=dry_run)
            self._seed_audit_logs(items=items, users=users, assignments=assignments, dry_run=dry_run)
            self._seed_notifications(dry_run=dry_run)
            self._seed_reports(dry_run=dry_run)

            if dry_run:
                transaction.set_rollback(True)
                self.stdout.write(self.style.WARNING("Dry run enabled. Rolled back all changes."))

        self.stdout.write(self.style.SUCCESS("PRD dummy seed completed."))

    def _seed_offices(self, dry_run=False):
        targets = [
            {
                "name": "DoNIDCR Central Office",
                "level": OfficeLevels.CENTRAL,
                "parent_code": None,
                "code": "NPL-CENTRAL-001",
            }
        ]

        total_locals = sum(local_count for _, _, local_count in PROVINCES)
        wards_base = WARD_TOTAL // total_locals
        ward_remainder = WARD_TOTAL % total_locals
        local_global_index = 0

        for province_index, (province_name, province_code, local_count) in enumerate(PROVINCES, start=1):
            targets.append(
                {
                    "name": province_name,
                    "level": OfficeLevels.PROVINCIAL,
                    "parent_code": "NPL-CENTRAL-001",
                    "code": province_code,
                }
            )
            province_stub = province_name.replace(" Province Office", "")
            for local_index in range(1, local_count + 1):
                local_global_index += 1
                local_code = f"NPL-L{province_index:02d}-{local_index:03d}"
                local_name = f"{province_stub} Local Office {local_index:03d}"
                targets.append(
                    {
                        "name": local_name,
                        "level": OfficeLevels.LOCAL,
                        "parent_code": province_code,
                        "code": local_code,
                    }
                )
                ward_count = wards_base + (1 if local_global_index <= ward_remainder else 0)
                for ward_index in range(1, ward_count + 1):
                    targets.append(
                        {
                            "name": f"{local_name} Ward {ward_index:02d}",
                            "level": OfficeLevels.WARD,
                            "parent_code": local_code,
                            "code": f"NPL-W{province_index:02d}-{local_index:03d}-{ward_index:02d}",
                        }
                    )

        office_by_code = {office.location_code: office for office in Office.objects.all()}
        created = 0
        updated = 0

        for payload in targets:
            parent = office_by_code.get(payload["parent_code"]) if payload["parent_code"] else None
            obj = office_by_code.get(payload["code"])
            if obj is None:
                created += 1
                if dry_run:
                    obj = Office(
                        name=payload["name"],
                        level=payload["level"],
                        parent_office=parent,
                        location_code=payload["code"],
                    )
                else:
                    obj = Office.objects.create(
                        name=payload["name"],
                        level=payload["level"],
                        parent_office=parent,
                        location_code=payload["code"],
                    )
                office_by_code[payload["code"]] = obj
                continue

            changed = False
            if obj.name != payload["name"]:
                obj.name = payload["name"]
                changed = True
            if obj.level != payload["level"]:
                obj.level = payload["level"]
                changed = True
            parent_id = parent.id if parent else None
            if obj.parent_office_id != parent_id:
                obj.parent_office = parent
                changed = True
            if changed:
                updated += 1
                if not dry_run:
                    obj.save(update_fields=["name", "level", "parent_office"])

        self.stdout.write(
            f"Offices: created={created}, updated={updated}, total_target={len(targets)}, total_existing={len(office_by_code)}"
        )
        return office_by_code

    def _seed_users(self, offices, dry_run=False):
        targets = [
            {
                "username": "superadmin",
                "email": "superadmin@ims.local",
                "first_name": "Super",
                "last_name": "Admin",
                "role": UserRoles.SUPER_ADMIN,
                "office": offices["NPL-CENTRAL-001"],
                "is_staff": True,
                "is_superuser": True,
            },
            {
                "username": "central_admin",
                "email": "central_admin@ims.local",
                "first_name": "Central",
                "last_name": "Admin",
                "role": UserRoles.CENTRAL_ADMIN,
                "office": offices["NPL-CENTRAL-001"],
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "store_keeper",
                "email": "store_keeper@ims.local",
                "first_name": "Store",
                "last_name": "Keeper",
                "role": UserRoles.CENTRAL_PROCUREMENT_STORE,
                "office": offices["NPL-CENTRAL-001"],
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "finance_user",
                "email": "finance_user@ims.local",
                "first_name": "Finance",
                "last_name": "User",
                "role": UserRoles.FINANCE,
                "office": offices["NPL-CENTRAL-001"],
                "is_staff": True,
                "is_superuser": False,
            },
            {
                "username": "audit_user",
                "email": "audit_user@ims.local",
                "first_name": "Audit",
                "last_name": "User",
                "role": UserRoles.AUDIT,
                "office": offices["NPL-CENTRAL-001"],
                "is_staff": True,
                "is_superuser": False,
            },
        ]

        for office in offices.values():
            if office.location_code == "NPL-CENTRAL-001":
                continue
            if office.level == OfficeLevels.PROVINCIAL:
                suffix = office.location_code.replace("NPL-", "").replace("-", "_").lower()
                targets.append(
                    {
                        "username": f"prov_admin_{suffix}",
                        "email": f"prov_admin_{suffix}@ims.local",
                        "first_name": "Provincial",
                        "last_name": suffix.split("_")[-1],
                        "role": UserRoles.PROVINCIAL_ADMIN,
                        "office": office,
                        "is_staff": True,
                        "is_superuser": False,
                    }
                )
            elif office.level == OfficeLevels.LOCAL:
                suffix = office.location_code.replace("NPL-", "").replace("-", "_").lower()
                targets.append(
                    {
                        "username": f"local_admin_{suffix}",
                        "email": f"local_admin_{suffix}@ims.local",
                        "first_name": "Local",
                        "last_name": suffix.split("_")[-1],
                        "role": UserRoles.LOCAL_ADMIN,
                        "office": office,
                        "is_staff": True,
                        "is_superuser": False,
                    }
                )
            elif office.level == OfficeLevels.WARD:
                suffix = office.location_code.replace("NPL-W", "").replace("-", "_").lower()
                targets.append(
                    {
                        "username": f"ward_officer_{suffix}",
                        "email": f"ward_officer_{suffix}@ims.local",
                        "first_name": "Ward",
                        "last_name": suffix.split("_")[-1],
                        "role": UserRoles.WARD_OFFICER,
                        "office": office,
                        "is_staff": False,
                        "is_superuser": False,
                    }
                )

        existing = {user.username: user for user in User.objects.select_related("office").all()}
        created_batch = []
        updated = 0
        password_hash = make_password(DEFAULT_PASSWORD)

        for payload in targets:
            obj = existing.get(payload["username"])
            if obj is None:
                created_batch.append(
                    User(
                        username=payload["username"],
                        email=payload["email"],
                        first_name=payload["first_name"],
                        last_name=payload["last_name"],
                        role=payload["role"],
                        office=payload["office"],
                        is_staff=payload["is_staff"],
                        is_active=True,
                        is_superuser=payload["is_superuser"],
                        password=password_hash,
                    )
                )
                continue

            changed = False
            for field in ("email", "first_name", "last_name", "role", "is_staff", "is_superuser"):
                if getattr(obj, field) != payload[field]:
                    setattr(obj, field, payload[field])
                    changed = True
            if obj.office_id != payload["office"].id:
                obj.office = payload["office"]
                changed = True
            if not obj.is_active:
                obj.is_active = True
                changed = True
            if changed:
                updated += 1
                if not dry_run:
                    obj.save(
                        update_fields=[
                            "email",
                            "first_name",
                            "last_name",
                            "role",
                            "office",
                            "is_staff",
                            "is_active",
                            "is_superuser",
                        ]
                    )

        if created_batch and not dry_run:
            User.objects.bulk_create(created_batch, batch_size=500)

        users = {user.username: user for user in User.objects.select_related("office").all()}
        if dry_run:
            for user in created_batch:
                users[user.username] = user
        self.stdout.write(
            f"Users: created={len(created_batch)}, updated={updated}, total_target={len(targets)}, total_existing={len(users)}"
        )
        return users

    def _seed_custom_fields(self, dry_run=False):
        created = 0
        updated = 0
        skipped = 0

        for category_name, label, field_type, required, is_unique, select_options in CUSTOM_FIELDS:
            category = Category.objects.filter(name=category_name).first()
            if not category:
                skipped += 1
                continue

            obj = CustomFieldDefinition.objects.filter(category=category, label=label).first()
            if obj is None:
                created += 1
                if not dry_run:
                    CustomFieldDefinition.objects.create(
                        category=category,
                        label=label,
                        field_type=field_type,
                        required=required,
                        is_unique=is_unique,
                        select_options=select_options,
                    )
                continue

            changed = False
            if obj.field_type != field_type:
                obj.field_type = field_type
                changed = True
            if obj.required != required:
                obj.required = required
                changed = True
            if obj.is_unique != is_unique:
                obj.is_unique = is_unique
                changed = True
            if obj.select_options != select_options:
                obj.select_options = select_options
                changed = True
            if changed:
                updated += 1
                if not dry_run:
                    obj.save(update_fields=["field_type", "required", "is_unique", "select_options"])

        self.stdout.write(f"Custom fields: created={created}, updated={updated}, skipped={skipped}")

    def _seed_inventory(self, offices, target_items, dry_run=False):
        rnd = random.Random(20260312)
        categories = {category.name: category for category in Category.objects.all()}
        office_list = list(offices.values())
        generated_items = list(CORE_ITEMS)

        extra_needed = max(target_items - len(CORE_ITEMS), 0)
        fixed_target = extra_needed // 2
        consumable_target = extra_needed - fixed_target

        for index in range(1, fixed_target + 1):
            generated_items.append(self._build_fixed_asset_payload(index=index, offices=office_list, rnd=rnd))
        for index in range(1, consumable_target + 1):
            generated_items.append(self._build_consumable_payload(index=index, offices=office_list, rnd=rnd))

        item_by_number = {item.item_number: item for item in InventoryItem.objects.select_related("office", "category").all()}
        created = 0
        updated = 0

        for payload in generated_items:
            category = categories[payload["category"]]
            office = offices[payload["office_code"]]
            defaults = {
                "title": payload["title"],
                "category": category,
                "office": office,
                "item_type": payload["item_type"],
                "status": payload["status"],
                "amount": payload["amount"],
                "price": payload["price"],
                "currency": payload["currency"],
                "store": payload["store"],
                "project": payload["project"],
                "department": payload["department"],
                "manufacturer": payload["manufacturer"],
                "purchased_date": payload["purchased_date"],
                "description": payload["description"],
                "dynamic_data": payload["dynamic_data"],
            }

            obj = item_by_number.get(payload["item_number"])
            if obj is None:
                created += 1
                if not dry_run:
                    obj = InventoryItem.objects.create(item_number=payload["item_number"], **defaults)
                item_by_number[payload["item_number"]] = obj
            else:
                changed = False
                for field, value in defaults.items():
                    if getattr(obj, field) != value:
                        setattr(obj, field, value)
                        changed = True
                if changed:
                    updated += 1
                    if not dry_run:
                        obj.save(update_fields=list(defaults.keys()))

            if dry_run or not obj:
                continue

            if payload["item_type"] == InventoryItemType.FIXED_ASSET:
                FixedAsset.objects.update_or_create(item=obj, defaults=payload["fixed_asset"])
            else:
                ConsumableStock.objects.update_or_create(item=obj, defaults=payload["consumable_stock"])

        self.stdout.write(
            f"Inventory items: created={created}, updated={updated}, target={len(generated_items)}, total_existing={len(item_by_number)}"
        )
        return item_by_number

    def _seed_assignments(self, items, users, offices, target_assignments, dry_run=False):
        if dry_run:
            self.stdout.write(f"Assignments: would upsert approximately {target_assignments} records")
            return []

        fixed_items = [
            item
            for item in items.values()
            if item and item.item_type == InventoryItemType.FIXED_ASSET and item.status != InventoryStatus.DISPOSED
        ]
        fixed_items.sort(key=lambda item: item.item_number or "")
        active_target = max(1, target_assignments * 2 // 3)
        returned_target = max(1, target_assignments - active_target)
        assignments = []
        store_keeper = users.get("store_keeper")

        active_items = fixed_items[:active_target]
        returned_items = fixed_items[active_target : active_target + returned_target]

        for idx, item in enumerate(active_items, start=1):
            assignee = self._find_assignee_for_office(users=users, office=item.office)
            assignment, _ = ItemAssignment.objects.update_or_create(
                item=item,
                status=AssignmentStatus.ASSIGNED,
                defaults={
                    "assigned_to_user": assignee,
                    "assigned_to_office": None if assignee else offices.get(item.office.location_code),
                    "assigned_by": store_keeper,
                    "handover_date": date(2025, 7, 1) + timedelta(days=idx % 180),
                    "assign_till": date(2026, 12, 31),
                    "handover_condition": ItemCondition.GOOD,
                    "remarks": f"{SEED_MARKER} active assignment",
                },
            )
            if item.status != InventoryStatus.ASSIGNED:
                item.status = InventoryStatus.ASSIGNED
                item.save(update_fields=["status"])
            assignments.append(assignment)

        for idx, item in enumerate(returned_items, start=1):
            assignee = self._find_assignee_for_office(users=users, office=item.office)
            assignment, _ = ItemAssignment.objects.update_or_create(
                item=item,
                status=AssignmentStatus.RETURNED,
                defaults={
                    "assigned_to_user": assignee,
                    "assigned_to_office": item.office,
                    "assigned_by": store_keeper,
                    "handover_date": date(2025, 4, 1) + timedelta(days=idx % 150),
                    "assign_till": date(2025, 12, 31),
                    "returned_at": datetime(2025, 12, 20, 10, 30, tzinfo=timezone.utc) + timedelta(days=idx % 20),
                    "return_condition": ItemCondition.GOOD if idx % 5 else ItemCondition.FAIR,
                    "handover_condition": ItemCondition.GOOD,
                    "remarks": f"{SEED_MARKER} returned assignment",
                },
            )
            if item.status != InventoryStatus.UNASSIGNED:
                item.status = InventoryStatus.UNASSIGNED
                item.save(update_fields=["status"])
            assignments.append(assignment)

        self.stdout.write(f"Assignments: upserted={len(assignments)}")
        return assignments

    def _seed_stock_transactions(self, items, users, dry_run=False):
        if dry_run:
            self.stdout.write("Stock transactions: would upsert transactions for consumables")
            return

        performer = users.get("store_keeper")
        created = 0
        for item in items.values():
            if not item or item.item_type != InventoryItemType.CONSUMABLE:
                continue
            stock = ConsumableStock.objects.filter(item=item).first()
            if not stock:
                continue

            opening_txn, opening_created = ConsumableStockTransaction.objects.get_or_create(
                stock=stock,
                transaction_type=StockTransactionType.STOCK_IN,
                description=f"{SEED_MARKER} opening stock",
                defaults={
                    "quantity": stock.initial_quantity,
                    "balance_after": stock.initial_quantity,
                    "status": "COMPLETED",
                    "amount": stock.initial_quantity * item.price,
                    "performed_by": performer,
                    "department": item.department,
                },
            )
            current_balance = opening_txn.balance_after
            created += 1 if opening_created else 0

            consumed_quantity = max(opening_txn.balance_after - stock.quantity, Decimal("0"))
            if consumed_quantity > 0:
                issued_to = self._find_assignee_for_office(users=users, office=item.office)
                _, out_created = ConsumableStockTransaction.objects.get_or_create(
                    stock=stock,
                    transaction_type=StockTransactionType.STOCK_OUT,
                    description=f"{SEED_MARKER} issued stock",
                    defaults={
                        "quantity": consumed_quantity,
                        "balance_after": stock.quantity,
                        "status": "COMPLETED",
                        "amount": consumed_quantity * item.price,
                        "assigned_to": issued_to,
                        "performed_by": performer,
                        "department": item.department,
                    },
                )
                created += 1 if out_created else 0
                current_balance = stock.quantity

            if stock.quantity != current_balance:
                stock.quantity = current_balance
                stock.save(update_fields=["quantity"])

        self.stdout.write(f"Stock transactions: created={created}")

    def _seed_audit_logs(self, items, users, assignments, dry_run=False):
        if dry_run:
            self.stdout.write("Audit logs: would upsert create/assign/return entries")
            return

        actor = users.get("store_keeper")
        created = 0
        for item in items.values():
            if not item:
                continue
            _, was_created = InventoryAuditLog.objects.get_or_create(
                item=item,
                action_type=InventoryActionType.CREATE,
                remarks=f"{SEED_MARKER} created {item.item_number}",
                defaults={
                    "performed_by": actor,
                    "before_data": {},
                    "after_data": {
                        "item_number": item.item_number,
                        "title": item.title,
                        "status": item.status,
                        "item_type": item.item_type,
                        "office": item.office.name,
                    },
                },
            )
            created += 1 if was_created else 0

        for assignment in assignments:
            action_type = InventoryActionType.ASSIGN if assignment.status == AssignmentStatus.ASSIGNED else InventoryActionType.RETURN
            _, was_created = InventoryAuditLog.objects.get_or_create(
                item=assignment.item,
                action_type=action_type,
                remarks=assignment.remarks,
                defaults={
                    "performed_by": assignment.assigned_by,
                    "after_data": {
                        "assignment_status": assignment.status,
                        "assigned_to_user": assignment.assigned_to_user.username if assignment.assigned_to_user else "",
                        "assigned_to_office": assignment.assigned_to_office.name if assignment.assigned_to_office else "",
                    },
                },
            )
            created += 1 if was_created else 0

        self.stdout.write(f"Audit logs: created={created}")

    def _seed_notifications(self, dry_run=False):
        if dry_run:
            self.stdout.write("Notifications: would upsert low-stock email records")
            return

        created = 0
        low_stocks = (
            ConsumableStock.objects.select_related("item", "item__office")
            .filter(quantity__lte=Decimal("25"))
            .order_by("item__item_number")[:25]
        )
        for stock in low_stocks:
            _, was_created = NotificationDelivery.objects.get_or_create(
                channel=NotificationChannel.EMAIL,
                provider="seed",
                recipient="storekeeper@ims.local",
                subject=f"Low stock alert: {stock.item.title}",
                message=(
                    f"{SEED_MARKER}\n"
                    f"Item: {stock.item.title}\n"
                    f"Office: {stock.item.office.name}\n"
                    f"Quantity: {stock.quantity}\n"
                    f"Threshold: {stock.min_threshold}\n"
                ),
                defaults={
                    "status": NotificationStatus.SENT,
                    "attempts": 1,
                    "sent_at": datetime.now(timezone.utc),
                    "metadata": {"event": "low_stock_alert", "item_number": stock.item.item_number},
                },
            )
            created += 1 if was_created else 0
        self.stdout.write(f"Notifications: created={created}")

    def _seed_reports(self, dry_run=False):
        if dry_run:
            self.stdout.write("Reports: would upsert generated daily summary report")
            return

        GeneratedReport.objects.update_or_create(
            report_type=ReportType.INVENTORY_DAILY_SUMMARY,
            period_start=date(2026, 3, 1),
            period_end=date(2026, 3, 31),
            defaults={
                "status": ReportGenerationStatus.GENERATED,
                "row_count": InventoryItem.objects.count(),
                "payload": {
                    "seed_marker": SEED_MARKER,
                    "items": InventoryItem.objects.count(),
                    "fixed_assets": FixedAsset.objects.count(),
                    "consumables": ConsumableStock.objects.count(),
                    "low_stock_items": ConsumableStock.objects.filter(quantity__lte=Decimal("25")).count(),
                },
                "error_message": "",
            },
        )
        self.stdout.write("Reports: upserted daily summary report")

    def _build_fixed_asset_payload(self, index, offices, rnd):
        blueprint = FIXED_BLUEPRINTS[(index - 1) % len(FIXED_BLUEPRINTS)]
        office = self._pick_fixed_asset_office(offices=offices, rnd=rnd)
        purchase_date = date(2024, 1, 1) + timedelta(days=(index * 11) % 700)
        price = Decimal(str(rnd.randint(*blueprint["price_range"]))).quantize(Decimal("0.01"))
        status_roll = index % 10
        if status_roll == 0:
            status = InventoryStatus.DISPOSED
        elif status_roll in (1, 2):
            status = InventoryStatus.UNASSIGNED
        else:
            status = InventoryStatus.ACTIVE

        return {
            "item_number": f"FA-{1000 + index:05d}",
            "title": f"{blueprint['titles'][index % len(blueprint['titles'])]} {index:03d}",
            "category": blueprint["category"],
            "office_code": office.location_code,
            "item_type": InventoryItemType.FIXED_ASSET,
            "status": status,
            "amount": price,
            "price": price,
            "currency": "NPR",
            "store": f"{office.name} Asset Store",
            "project": rnd.choice(
                [
                    "National ID Rollout",
                    "Vital Event Digitization",
                    "Field Registration Expansion",
                    "Office Infrastructure Upgrade",
                ]
            ),
            "department": blueprint["department"],
            "manufacturer": blueprint["manufacturers"][index % len(blueprint["manufacturers"])],
            "purchased_date": purchase_date,
            "description": f"{SEED_MARKER} fixed asset seeded for PRD hierarchy coverage.",
            "dynamic_data": blueprint["dynamic_data"](rnd, index),
            "fixed_asset": {
                "asset_tag": f"AT-{index:06d}",
                "serial_number": f"SER-FA-{index:06d}",
                "purchase_date": purchase_date,
                "warranty_expiry_date": purchase_date + timedelta(days=365 * rnd.choice([1, 2, 3])),
            },
        }

    def _build_consumable_payload(self, index, offices, rnd):
        blueprint = CONSUMABLE_BLUEPRINTS[(index - 1) % len(CONSUMABLE_BLUEPRINTS)]
        office = self._pick_consumable_office(offices=offices, rnd=rnd)
        purchase_date = date(2024, 6, 1) + timedelta(days=(index * 9) % 620)
        unit_price = Decimal(str(rnd.randint(*blueprint["price_range"]))).quantize(Decimal("0.01"))
        initial_quantity = Decimal(str(rnd.randint(*blueprint["quantity_range"])))
        min_threshold = Decimal(str(rnd.randint(*blueprint["threshold_range"])))
        remaining_quantity = initial_quantity - Decimal(str(rnd.randint(0, max(int(initial_quantity // 2), 1))))
        if index % 7 == 0:
            remaining_quantity = min_threshold - Decimal(str(rnd.randint(0, max(int(min_threshold), 1))))
        if remaining_quantity < Decimal("0"):
            remaining_quantity = Decimal("0")

        return {
            "item_number": f"CON-{1000 + index:05d}",
            "title": f"{blueprint['titles'][index % len(blueprint['titles'])]} {index:03d}",
            "category": blueprint["category"],
            "office_code": office.location_code,
            "item_type": InventoryItemType.CONSUMABLE,
            "status": InventoryStatus.ACTIVE,
            "amount": (unit_price * initial_quantity).quantize(Decimal("0.01")),
            "price": unit_price,
            "currency": "NPR",
            "store": f"{office.name} Consumable Store",
            "project": rnd.choice(
                [
                    "National ID Rollout",
                    "Ward Service Delivery",
                    "Office Operations",
                    "Citizen Support",
                ]
            ),
            "department": blueprint["department"],
            "manufacturer": blueprint["manufacturers"][index % len(blueprint["manufacturers"])],
            "purchased_date": purchase_date,
            "description": f"{SEED_MARKER} consumable seeded for PRD hierarchy coverage.",
            "dynamic_data": blueprint["dynamic_data"](rnd, index),
            "consumable_stock": {
                "initial_quantity": initial_quantity,
                "quantity": remaining_quantity,
                "min_threshold": min_threshold,
                "reorder_alert_enabled": True,
                "unit": blueprint["unit"],
            },
        }

    def _pick_fixed_asset_office(self, offices, rnd):
        eligible = [office for office in offices if office.level in {OfficeLevels.PROVINCIAL, OfficeLevels.LOCAL, OfficeLevels.WARD}]
        return eligible[rnd.randrange(len(eligible))]

    def _pick_consumable_office(self, offices, rnd):
        eligible = [office for office in offices if office.level in {OfficeLevels.LOCAL, OfficeLevels.WARD}]
        return eligible[rnd.randrange(len(eligible))]

    def _find_assignee_for_office(self, users, office):
        ward_code = office.location_code.replace("NPL-W", "").replace("-", "_").lower()
        ward_username = f"ward_officer_{ward_code}"
        if ward_username in users:
            return users[ward_username]

        if office.level == OfficeLevels.LOCAL:
            local_username = f"local_admin_{office.location_code.replace('NPL-', '').replace('-', '_').lower()}"
            if local_username in users:
                return users[local_username]

        province_suffix = ""
        if office.level == OfficeLevels.PROVINCIAL:
            province_suffix = office.location_code.replace("NPL-", "").replace("-", "_").lower()
        elif office.level == OfficeLevels.LOCAL:
            province_suffix = f"p{office.location_code.split('-')[1][-2:]}"
        elif office.level == OfficeLevels.WARD:
            province_suffix = f"p{office.location_code.split('-')[1].replace('W', '')}"

        prov_username = f"prov_admin_{province_suffix}" if province_suffix else ""
        return users.get(prov_username) or users.get("store_keeper")
