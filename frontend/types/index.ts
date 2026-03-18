
// Shared types for IMS

export type ItemType = "Fixed Asset" | "Consumable";

export type ItemStatus =
  | "Assigned"
  | "Unassigned"
  | "Damaged"
  | "Returned"
  | "Added"
  | "Updated"
  | "Low stock";

export type ActivityCategory = string;

// State used by the Recent Activities filter
export type ActivitiesFilterState = {
  from: string;
  to: string;
  category: "" | ActivityCategory;
  itemType: "" | ItemType;
  status: "" | "Assigned" | "Unassigned" | "Damaged";
};

// API / Entity types
export interface Item {
  id: string;
  name: string;
  type: string;
  category: string;
  serial: string;
  amount: string;
  status: ItemStatus;
  assignedTo: string;
}

export interface Assignment {
  id: string;
  employee: string;
  designation: string;
  office: string;
  total: number;
  active: number;
  overdue: number;
  returned: number | string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  category: string;
  serial: string;
  amount: string;
  status: ItemStatus;
  assignedTo: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  qty: number;
  minQty: number;
  status: "low" | "onboarding" | "out";
  updated: string;
}

export interface StockTransaction {
  id: string;
  date: string;
  action: string;
  qty: string;
  balance: number;
  by: string;
  remarks: string;
  invoice: boolean;
}

export interface AuditActivity {
  id: string;
  itemName: string;
  uniqueNumber: string;
  performedBy: string;
  date: string;
  amount: string;
  status: ItemStatus;
  category: ActivityCategory;
  itemType: ItemType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
