"use client";

import { ChevronRight, X } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type HTMLAttributes } from "react";
import {
  useCreateConsumableStockMutation,
  useCreateFixedAssetMutation,
  useCreateItemMutation,
  useGetAssetTypesQuery,
  useGetCategoriesQuery,
  useGetCustomFieldsQuery,
  useGetFixedAssetsQuery,
  useGetOfficesQuery,
  useGetStocksQuery,
  useUpdateConsumableStockMutation,
  useUpdateFixedAssetMutation,
  useUpdateItemMutation,
  type CustomFieldDefinitionApi,
  type InventoryItemApi,
} from "@/app/redux/api";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItemApi | null;
}

type ItemType = "FIXED_ASSET" | "CONSUMABLE";
type FormErrors = Record<string, string>;
type CustomValue = string | boolean | File | null;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISPOSED", label: "Disposed" },
];

const CURRENCY_OPTIONS = [
  { value: "", label: "Choose currency" },
  { value: "NPR", label: "NPR" },
  { value: "USD", label: "USD" },
  { value: "INR", label: "INR" },
];

const UNIT_OPTIONS = [
  { value: "", label: "Choose unit" },
  { value: "pcs", label: "pcs" },
  { value: "pack", label: "pack" },
  { value: "box", label: "box" },
  { value: "ream", label: "ream" },
  { value: "kit", label: "kit" },
  { value: "bottle", label: "bottle" },
];

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const SERIAL_PATTERN = /^[A-Za-z0-9/_-]+$/;

export function AddItemModal({ open, onClose, item }: AddItemModalProps) {
  const isEditMode = Boolean(item);
  const { data: categories = { items: [], totalItems: 0, next: null, previous: null } } = useGetCategoriesQuery({
    page_size: 1000,
  });
  const { data: offices = [] } = useGetOfficesQuery();
  const { data: assetTypes = [] } = useGetAssetTypesQuery();
  const [createItem, { isLoading: isCreatingItem }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdatingItem }] = useUpdateItemMutation();
  const [createFixedAsset, { isLoading: isCreatingFixedAsset }] = useCreateFixedAssetMutation();
  const [updateFixedAsset, { isLoading: isUpdatingFixedAsset }] = useUpdateFixedAssetMutation();
  const [createConsumableStock, { isLoading: isCreatingStock }] = useCreateConsumableStockMutation();
  const [updateConsumableStock, { isLoading: isUpdatingStock }] = useUpdateConsumableStockMutation();

  const [itemType, setItemType] = useState<ItemType>(item?.item_type ?? "FIXED_ASSET");
  const [categoryId, setCategoryId] = useState<number | "">(item?.category ?? "");
  const [officeId, setOfficeId] = useState<number | "">(item?.office ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [status, setStatus] = useState(item?.status ?? "ACTIVE");
  const [itemNumber, setItemNumber] = useState(item?.item_number ?? "");
  const [price, setPrice] = useState(item?.price ?? "");
  const [currency, setCurrency] = useState(item?.currency ?? "NPR");
  const [department, setDepartment] = useState(item?.department ?? "");
  const [manufacturer, setManufacturer] = useState(item?.manufacturer ?? "");
  const [purchaseDate, setPurchaseDate] = useState(item?.purchased_date ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [piDocumentFile, setPiDocumentFile] = useState<File | null>(null);
  const [warrantyDocumentFile, setWarrantyDocumentFile] = useState<File | null>(null);
  const [serialNumber, setSerialNumber] = useState<string | null>(item?.serial_number ?? null);
  const [initialQuantity, setInitialQuantity] = useState<string | null>(null);
  const [minThreshold, setMinThreshold] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [reorderAlertEnabled, setReorderAlertEnabled] = useState<boolean | null>(null);
  const [customValues, setCustomValues] = useState<Record<number, CustomValue>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");

  const filteredCategories = useMemo(
    () =>
      categories.items.filter((category) =>
        itemType === "CONSUMABLE" ? category.is_consumable : !category.is_consumable
      ),
    [categories.items, itemType]
  );

  const { data: customFields = [] } = useGetCustomFieldsQuery(
    categoryId ? { category: categoryId } : undefined,
    { skip: !categoryId }
  );
  const { data: fixedAssets = [], isFetching: isFetchingFixedAssets } = useGetFixedAssetsQuery(
    item?.id ? { item: item.id } : undefined,
    { skip: !isEditMode || !item?.id || itemType !== "FIXED_ASSET" }
  );
  const {
    data: stockResult = { items: [], totalItems: 0, next: null, previous: null },
    isFetching: isFetchingStock,
  } = useGetStocksQuery(item?.id ? { item: item.id, page_size: 1 } : undefined, {
    skip: !isEditMode || !item?.id || itemType !== "CONSUMABLE",
  });

  const fixedAsset = fixedAssets[0];
  const stock = stockResult.items?.[0];
  const isSubtypeLoading =
    isEditMode &&
    ((itemType === "FIXED_ASSET" && isFetchingFixedAssets) || (itemType === "CONSUMABLE" && isFetchingStock));
  const isSaving =
    isCreatingItem ||
    isUpdatingItem ||
    isCreatingFixedAsset ||
    isUpdatingFixedAsset ||
    isCreatingStock ||
    isUpdatingStock ||
    isSubtypeLoading;
  const existingDynamicData = item?.dynamic_data ?? {};
  const serialNumberValue = serialNumber ?? fixedAsset?.serial_number ?? item?.serial_number ?? "";
  const initialQuantityValue = initialQuantity ?? stock?.initial_quantity ?? stock?.quantity ?? "";
  const minThresholdValue = minThreshold ?? stock?.min_threshold ?? "";
  const unitValue = unit ?? stock?.unit ?? "";
  const reorderAlertValue = reorderAlertEnabled ?? stock?.reorder_alert_enabled ?? true;
  const amountValue = getComputedAmount(itemType, price, initialQuantityValue);

  if (!open) return null;

  const handleTypeChange = (nextType: ItemType) => {
    if (isEditMode) {
      return;
    }
    setItemType(nextType);
    setCategoryId("");
    setCustomValues({});
    setSerialNumber(null);
    setInitialQuantity(null);
    setMinThreshold(null);
    setUnit(null);
    setReorderAlertEnabled(null);
    setWarrantyDocumentFile(null);
    setErrors((current) => {
      const next = { ...current };
      delete next.categoryId;
      delete next.serialNumber;
      delete next.warrantyDocument;
      delete next.initialQuantity;
      delete next.minThreshold;
      delete next.unit;
      for (const key of Object.keys(next)) {
        if (key.startsWith("custom:")) {
          delete next[key];
        }
      }
      return next;
    });
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
    errorKey: string,
    acceptedCategory: "image" | "document"
  ) => {
    const file = event.target.files?.[0] ?? null;
    setter(file);
    setErrors((current) => clearError(current, errorKey));

    if (!file) {
      return;
    }

    const fileError = validateFile(file, acceptedCategory);
    if (fileError) {
      setErrors((current) => ({ ...current, [errorKey]: fileError }));
    }
  };

  const handleCustomFileChange = (fieldId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCustomValues((current) => ({ ...current, [fieldId]: file }));
    setErrors((current) => clearError(current, `custom:${fieldId}`));

    if (!file) {
      return;
    }

    const fileError = validateFile(file, "document");
    if (fileError) {
      setErrors((current) => ({ ...current, [`custom:${fieldId}`]: fileError }));
    }
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const selectedCategory = filteredCategories.find((category) => category.id === categoryId);
    const trimmedTitle = title.trim();
    const trimmedItemNumber = itemNumber.trim();
    const trimmedDepartment = department.trim();
    const trimmedManufacturer = manufacturer.trim();
    const trimmedDescription = description.trim();
    const trimmedSerialNumber = serialNumberValue.trim();
    const normalizedPrice = price.trim();
    const normalizedInitialQuantity = initialQuantityValue.trim();
    const normalizedMinThreshold = minThresholdValue.trim();

    if (!categoryId || !selectedCategory) {
      nextErrors.categoryId = "Select a valid category.";
    }
    if (!officeId) {
      nextErrors.officeId = "Office is required.";
    }
    if (!trimmedTitle) {
      nextErrors.title = "Item name is required.";
    }
    if (!status) {
      nextErrors.status = "Status is required.";
    }
    if (!normalizedPrice) {
      nextErrors.price = "Price is required.";
    } else if (!isValidDecimal(normalizedPrice, 2) || Number(normalizedPrice) < 0) {
      nextErrors.price = "Enter a valid non-negative price with up to 2 decimals.";
    }
    if (trimmedItemNumber.length > 64) {
      nextErrors.itemNumber = "Item number cannot exceed 64 characters.";
    }
    if (trimmedDepartment.length > 128) {
      nextErrors.department = "Department cannot exceed 128 characters.";
    }
    if (trimmedManufacturer.length > 128) {
      nextErrors.manufacturer = "Manufacturer cannot exceed 128 characters.";
    }
    if (trimmedDescription.length > 5000) {
      nextErrors.description = "Description is too long.";
    }
    if (purchaseDate && Number.isNaN(Date.parse(purchaseDate))) {
      nextErrors.purchaseDate = "Enter a valid purchase date.";
    }

    if (imageFile) {
      const imageError = validateFile(imageFile, "image");
      if (imageError) {
        nextErrors.image = imageError;
      }
    }
    if (piDocumentFile) {
      const piError = validateFile(piDocumentFile, "document");
      if (piError) {
        nextErrors.piDocument = piError;
      }
    }
    if (warrantyDocumentFile) {
      const warrantyError = validateFile(warrantyDocumentFile, "document");
      if (warrantyError) {
        nextErrors.warrantyDocument = warrantyError;
      }
    }

    if (itemType === "FIXED_ASSET") {
      if (!trimmedSerialNumber) {
        nextErrors.serialNumber = "Serial number is required for fixed assets.";
      } else if (!SERIAL_PATTERN.test(trimmedSerialNumber)) {
        nextErrors.serialNumber = "Use only letters, numbers, slash, hyphen, or underscore.";
      }
    }

    if (itemType === "CONSUMABLE") {
      if (!normalizedInitialQuantity) {
        nextErrors.initialQuantity = "Initial quantity is required.";
      } else if (!isValidDecimal(normalizedInitialQuantity, 2) || Number(normalizedInitialQuantity) <= 0) {
        nextErrors.initialQuantity = "Enter a quantity greater than zero.";
      }

      if (!normalizedMinThreshold) {
        nextErrors.minThreshold = "Minimum threshold is required.";
      } else if (!isValidDecimal(normalizedMinThreshold, 2) || Number(normalizedMinThreshold) < 0) {
        nextErrors.minThreshold = "Enter a valid threshold of zero or more.";
      }

      if (!unit) {
        nextErrors.unit = "Unit is required.";
      }

      if (
        normalizedInitialQuantity &&
        normalizedMinThreshold &&
        isValidDecimal(normalizedInitialQuantity, 2) &&
        isValidDecimal(normalizedMinThreshold, 2) &&
        Number(normalizedMinThreshold) > Number(normalizedInitialQuantity)
      ) {
        nextErrors.minThreshold = "Minimum threshold cannot exceed initial quantity.";
      }
    }

    for (const field of customFields) {
      const value = getCustomFieldValue(field, customValues, existingDynamicData);
      const customError = validateCustomField(field, value);
      if (customError) {
        nextErrors[`custom:${field.id}`] = customError;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validateForm()) {
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedItemNumber = itemNumber.trim();
    const trimmedDepartment = department.trim();
    const trimmedManufacturer = manufacturer.trim();
    const trimmedDescription = description.trim();
    const normalizedPrice = price.trim();
    const normalizedInitialQuantity = initialQuantityValue.trim();
    const normalizedMinThreshold = minThresholdValue.trim();
    const dynamicData = buildDynamicData(customFields, customValues, existingDynamicData);

    const amount =
      itemType === "CONSUMABLE"
        ? (Number(normalizedPrice || 0) * Number(normalizedInitialQuantity || 0)).toFixed(2)
        : Number(normalizedPrice || 0).toFixed(2);

    try {
      const savedItem =
        isEditMode && item
          ? await updateItem({
              id: item.id,
              category: Number(categoryId),
              office: Number(officeId),
              title: trimmedTitle,
              item_number: trimmedItemNumber || null,
              item_type: itemType,
              status,
              amount,
              price: normalizedPrice,
              currency,
              department: trimmedDepartment,
              manufacturer: trimmedManufacturer,
              purchased_date: purchaseDate || null,
              image: imageFile,
              pi_document: piDocumentFile,
              warranty_document: itemType === "FIXED_ASSET" ? warrantyDocumentFile : null,
              description: trimmedDescription,
              dynamic_data: dynamicData,
            }).unwrap()
          : await createItem({
              category: Number(categoryId),
              office: Number(officeId),
              title: trimmedTitle,
              item_number: trimmedItemNumber || null,
              item_type: itemType,
              status,
              amount,
              price: normalizedPrice,
              currency,
              department: trimmedDepartment,
              manufacturer: trimmedManufacturer,
              purchased_date: purchaseDate || null,
              image: imageFile,
              pi_document: piDocumentFile,
              warranty_document: itemType === "FIXED_ASSET" ? warrantyDocumentFile : null,
              description: trimmedDescription,
              dynamic_data: dynamicData,
            }).unwrap();

      if (itemType === "FIXED_ASSET") {
        if (isEditMode && fixedAsset) {
          await updateFixedAsset({
            id: fixedAsset.id,
            serial_number: serialNumberValue.trim(),
            purchase_date: purchaseDate || null,
          }).unwrap();
        } else {
          await createFixedAsset({
            item: savedItem.id,
            serial_number: serialNumberValue.trim(),
            purchase_date: purchaseDate || null,
          }).unwrap();
        }
      }

      if (itemType === "CONSUMABLE") {
        const stockPayload = {
          item: savedItem.id,
          initial_quantity: normalizedInitialQuantity,
          quantity: isEditMode && stock ? stock.quantity : normalizedInitialQuantity,
          min_threshold: normalizedMinThreshold,
          reorder_alert_enabled: reorderAlertValue,
          unit: unitValue,
        };

        if (isEditMode && stock) {
          await updateConsumableStock({ id: stock.id, ...stockPayload }).unwrap();
        } else {
          await createConsumableStock(stockPayload).unwrap();
        }
      }

      onClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md hover:bg-gray-50"
        aria-label="Close drawer"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      <div className="relative flex h-full w-[640px] flex-col overflow-y-auto bg-white shadow-xl">
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? "Edit Item" : "Add New Item"}</h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-8 pb-6">
            <div className="flex flex-col gap-3">
              {(
                assetTypes.length
                  ? assetTypes.map((type) => ({
                      value: type.code as ItemType,
                      label: type.code === "CONSUMABLE" ? "Consumable Item" : type.label,
                    }))
                  : [
                      { value: "FIXED_ASSET" as ItemType, label: "Fixed Asset" },
                      { value: "CONSUMABLE" as ItemType, label: "Consumable Item" },
                    ]
              ).map((type) => (
                <label key={type.value} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="itemType"
                    value={type.value}
                    checked={itemType === type.value}
                    onChange={() => handleTypeChange(type.value)}
                    disabled={isEditMode}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {type.label}
                </label>
              ))}
            </div>
            {isEditMode ? (
              <p className="mt-2 text-xs text-gray-500">Item type is locked during edit to protect subtype data.</p>
            ) : null}
          </div>
        </div>

        <div className="px-8 py-5">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              required
              value={String(categoryId)}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : "");
                setCustomValues({});
                setErrors((current) => clearError(current, "categoryId"));
              }}
              error={errors.categoryId}
              options={filteredCategories.map((category) => ({
                value: String(category.id),
                label: category.name,
              }))}
            />

            <FormInput
              label="Item Name"
              required
              placeholder="Enter item name"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((current) => clearError(current, "title"));
              }}
              error={errors.title}
            />

            <FormFile
              label="Image"
              accept="image/*"
              onChange={(event) => handleFileChange(event, setImageFile, "image", "image")}
              error={errors.image}
            />

            <FormSelect
              label="Status"
              required
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setErrors((current) => clearError(current, "status"));
              }}
              error={errors.status}
              options={STATUS_OPTIONS}
            />

            {itemType === "FIXED_ASSET" ? (
              <FormInput
                label="Serial Number"
                required
                placeholder="Enter serial number"
                value={serialNumberValue}
                onChange={(e) => {
                  setSerialNumber(e.target.value);
                  setErrors((current) => clearError(current, "serialNumber"));
                }}
                error={errors.serialNumber}
              />
            ) : (
              <FormInput
                label="Initial Quantity"
                required
                placeholder="Enter initial quantity"
                inputMode="decimal"
                value={initialQuantityValue}
                onChange={(e) => {
                  setInitialQuantity(e.target.value);
                  setErrors((current) => clearError(current, "initialQuantity"));
                }}
                error={errors.initialQuantity}
              />
            )}

            <FormInput
              label="Item Number"
              placeholder="Enter item number"
              value={itemNumber}
              onChange={(e) => {
                setItemNumber(e.target.value);
                setErrors((current) => clearError(current, "itemNumber"));
              }}
              error={errors.itemNumber}
            />

            <FormSelect
              label="Office"
              required
              value={String(officeId)}
              onChange={(e) => {
                setOfficeId(e.target.value ? Number(e.target.value) : "");
                setErrors((current) => clearError(current, "officeId"));
              }}
              error={errors.officeId}
              options={offices.map((office) => ({ value: String(office.id), label: office.name }))}
            />

            <FormInput label="Amount" value={amountValue} readOnly />

            <FormInput
              label="Price"
              required
              placeholder="Enter price"
              inputMode="decimal"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setErrors((current) => clearError(current, "price"));
              }}
              error={errors.price}
            />

            <FormInput
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => {
                setPurchaseDate(e.target.value);
                setErrors((current) => clearError(current, "purchaseDate"));
              }}
              error={errors.purchaseDate}
            />

            <FormSelect label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={CURRENCY_OPTIONS} />

            <FormFile
              label="PI Document"
              accept=".pdf,image/*"
              onChange={(event) => handleFileChange(event, setPiDocumentFile, "piDocument", "document")}
              error={errors.piDocument}
            />

            {itemType === "FIXED_ASSET" ? (
              <FormFile
                label="Warranty Document"
                accept=".pdf,image/*"
                onChange={(event) =>
                  handleFileChange(event, setWarrantyDocumentFile, "warrantyDocument", "document")
                }
                error={errors.warrantyDocument}
              />
            ) : (
              <FormInput
                label="Min Threshold"
                required
                placeholder="Enter minimum threshold"
                inputMode="decimal"
                value={minThresholdValue}
                onChange={(e) => {
                  setMinThreshold(e.target.value);
                  setErrors((current) => clearError(current, "minThreshold"));
                }}
                error={errors.minThreshold}
              />
            )}

            <FormInput
              label="Department"
              placeholder="Enter department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setErrors((current) => clearError(current, "department"));
              }}
              error={errors.department}
            />

            <FormInput
              label="Manufacturer"
              placeholder="Enter manufacturer"
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value);
                setErrors((current) => clearError(current, "manufacturer"));
              }}
              error={errors.manufacturer}
            />

            {itemType === "CONSUMABLE" ? (
              <FormSelect
                label="Unit"
                required
                value={unitValue}
                onChange={(e) => {
                  setUnit(e.target.value);
                  setErrors((current) => clearError(current, "unit"));
                }}
                  error={errors.unit}
                  options={UNIT_OPTIONS}
                />
            ) : null}
          </div>

          {itemType === "CONSUMABLE" ? (
            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={reorderAlertValue}
                  onChange={(e) => setReorderAlertEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Reorder alert enabled
              </label>
            </div>
          ) : null}

          {customFields.length ? (
            <section className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Category-specific Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <CustomFieldInput
                    key={field.id}
                    field={field}
                    value={getCustomFieldValue(field, customValues, existingDynamicData)}
                    error={errors[`custom:${field.id}`]}
                    onValueChange={(nextValue) => {
                      setCustomValues((current) => ({ ...current, [field.id]: nextValue }));
                      setErrors((current) => clearError(current, `custom:${field.id}`));
                    }}
                    onFileChange={(event) => handleCustomFileChange(field.id, event)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((current) => clearError(current, "description"));
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.description ? <p className="mt-1 text-xs text-red-600">{errors.description}</p> : null}
          </div>

          {submitError ? <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p> : null}
        </div>

        <div className="mt-auto flex justify-center gap-4 border-t px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button onClick={onClose} className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-100">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  required,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  inputMode,
  readOnly = false,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
        readOnly={readOnly}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function FormSelect({
  label,
  required,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Choose {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function FormFile({
  label,
  required,
  accept,
  onChange,
  error,
}: {
  label: string;
  required?: boolean;
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  error,
  onValueChange,
  onFileChange,
}: {
  field: CustomFieldDefinitionApi;
  value: CustomValue;
  error?: string;
  onValueChange: (value: CustomValue) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  if (field.field_type === "BOOLEAN") {
    return (
      <div className="pt-7">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onValueChange(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          {field.label}
        </label>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (field.field_type === "SELECT") {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700">
          {field.label} {field.required ? <span className="text-red-500">*</span> : null}
        </label>
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onValueChange(event.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Choose {field.label}</option>
          {field.select_options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  if (field.field_type === "FILE") {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700">
          {field.label} {field.required ? <span className="text-red-500">*</span> : null}
        </label>
        <input
          type="file"
          onChange={onFileChange}
          className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
        />
        {typeof value === "string" && value ? <p className="mt-1 text-xs text-gray-500">Current: {value}</p> : null}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {field.label} {field.required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={field.field_type === "DATE" ? "date" : "text"}
        inputMode={field.field_type === "NUMBER" ? "decimal" : undefined}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onValueChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function clearError(current: FormErrors, key: string) {
  const next = { ...current };
  delete next[key];
  return next;
}

function validateFile(file: File, acceptedCategory: "image" | "document") {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return "File size must be 5MB or less.";
  }

  if (acceptedCategory === "image" && !file.type.startsWith("image/")) {
    return "Upload a valid image file.";
  }

  if (
    acceptedCategory === "document" &&
    !["application/pdf"].includes(file.type) &&
    !file.type.startsWith("image/")
  ) {
    return "Upload a PDF or image file.";
  }

  return "";
}

function validateCustomField(field: CustomFieldDefinitionApi, value: CustomValue) {
  if (field.field_type === "BOOLEAN") {
    return field.required && value !== true ? "This field is required." : "";
  }

  if (field.field_type === "FILE") {
    if (field.required && !value) {
      return "This field is required.";
    }
    if (value instanceof File) {
      return validateFile(value, "document");
    }
    return "";
  }

  const stringValue = typeof value === "string" ? value.trim() : "";
  if (field.required && !stringValue) {
    return "This field is required.";
  }
  if (!stringValue) {
    return "";
  }
  if (field.field_type === "NUMBER" && !isValidDecimal(stringValue, 2)) {
    return "Enter a valid number.";
  }
  if (field.field_type === "DATE" && Number.isNaN(Date.parse(stringValue))) {
    return "Enter a valid date.";
  }
  if (field.field_type === "SELECT" && !field.select_options.includes(stringValue)) {
    return "Select a valid option.";
  }
  return "";
}

function getCustomFieldValue(
  field: CustomFieldDefinitionApi,
  values: Record<number, CustomValue>,
  existingDynamicData: Record<string, unknown>
) {
  if (field.id in values) {
    return values[field.id];
  }

  const rawValue = existingDynamicData[field.label];
  if (field.field_type === "BOOLEAN") {
    return Boolean(rawValue);
  }
  if (field.field_type === "FILE") {
    return typeof rawValue === "string" ? rawValue : null;
  }
  if (rawValue !== undefined && rawValue !== null) {
    return String(rawValue);
  }
  return "";
}

function buildDynamicData(
  fields: CustomFieldDefinitionApi[],
  values: Record<number, CustomValue>,
  existingDynamicData: Record<string, unknown>
) {
  const dynamicData: Record<string, unknown> = {};

  for (const field of fields) {
    const value = getCustomFieldValue(field, values, existingDynamicData);
    if (value === null || value === undefined || value === "") {
      continue;
    }

    if (field.field_type === "BOOLEAN") {
      dynamicData[field.label] = Boolean(value);
    } else if (field.field_type === "NUMBER" && typeof value === "string") {
      dynamicData[field.label] = Number(value);
    } else if (field.field_type === "FILE" && value instanceof File) {
      dynamicData[field.label] = value.name;
    } else {
      dynamicData[field.label] = value;
    }
  }

  return dynamicData;
}

function getComputedAmount(itemType: ItemType, price: string, initialQuantity: string) {
  const normalizedPrice = price.trim();
  if (!normalizedPrice || !isValidDecimal(normalizedPrice, 2)) {
    return "";
  }

  if (itemType === "CONSUMABLE") {
    const normalizedQuantity = initialQuantity.trim();
    if (!normalizedQuantity || !isValidDecimal(normalizedQuantity, 2)) {
      return "";
    }
    return (Number(normalizedPrice) * Number(normalizedQuantity)).toFixed(2);
  }

  return Number(normalizedPrice).toFixed(2);
}

function isValidDecimal(value: string, maxDecimals: number) {
  return new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`).test(value);
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null
  ) {
    const entries = Object.entries(error.data as Record<string, unknown>);
    if (entries.length) {
      const [key, value] = entries[0];
      if (Array.isArray(value) && value[0]) {
        return `${key}: ${String(value[0])}`;
      }
      if (typeof value === "string") {
        return `${key}: ${value}`;
      }
    }
  }

  return "Failed to save item. Check permissions and input values.";
}
