
export interface ProductData {
  name: string;
  category: string;
  shelfLifeDays: {
    room: number;
    refrigerated: number;
    frozen: number;
  };
  openedMultiplier: number; // multiplier for opened products (0.6 = 60% of original shelf life)
}

export const PRODUCT_DATABASE: ProductData[] = [
  // Food Items (10)
  {
    name: "Whole Milk",
    category: "dairy_products",
    shelfLifeDays: { room: 1, refrigerated: 7, frozen: 90 },
    openedMultiplier: 0.6
  },
  {
    name: "Cheddar Cheese",
    category: "dairy_products", 
    shelfLifeDays: { room: 2, refrigerated: 21, frozen: 180 },
    openedMultiplier: 0.7
  },
  {
    name: "White Bread",
    category: "baked_goods",
    shelfLifeDays: { room: 3, refrigerated: 7, frozen: 30 },
    openedMultiplier: 0.8
  },
  {
    name: "Chicken Breast",
    category: "meat_poultry",
    shelfLifeDays: { room: 0, refrigerated: 3, frozen: 90 },
    openedMultiplier: 0.5
  },
  {
    name: "Ground Beef",
    category: "meat_poultry",
    shelfLifeDays: { room: 0, refrigerated: 2, frozen: 60 },
    openedMultiplier: 0.5
  },
  {
    name: "Fresh Salmon",
    category: "seafood",
    shelfLifeDays: { room: 0, refrigerated: 2, frozen: 60 },
    openedMultiplier: 0.5
  },
  {
    name: "Bananas",
    category: "fresh_fruits",
    shelfLifeDays: { room: 5, refrigerated: 10, frozen: 365 },
    openedMultiplier: 1.0
  },
  {
    name: "Spinach",
    category: "fresh_vegetables",
    shelfLifeDays: { room: 2, refrigerated: 7, frozen: 365 },
    openedMultiplier: 0.8
  },
  {
    name: "Canned Tomatoes",
    category: "canned_goods",
    shelfLifeDays: { room: 730, refrigerated: 730, frozen: 730 },
    openedMultiplier: 0.1
  },
  {
    name: "Orange Juice",
    category: "beverages",
    shelfLifeDays: { room: 7, refrigerated: 14, frozen: 365 },
    openedMultiplier: 0.4
  },

  // Medicines (10)
  {
    name: "Paracetamol Tablets",
    category: "medicines",
    shelfLifeDays: { room: 1095, refrigerated: 1095, frozen: 1095 },
    openedMultiplier: 0.9
  },
  {
    name: "Ibuprofen Capsules",
    category: "medicines",
    shelfLifeDays: { room: 1095, refrigerated: 1095, frozen: 1095 },
    openedMultiplier: 0.9
  },
  {
    name: "Vitamin D3 Tablets",
    category: "supplements",
    shelfLifeDays: { room: 730, refrigerated: 730, frozen: 730 },
    openedMultiplier: 0.8
  },
  {
    name: "Multivitamin Gummies",
    category: "supplements",
    shelfLifeDays: { room: 365, refrigerated: 365, frozen: 365 },
    openedMultiplier: 0.7
  },
  {
    name: "Cough Syrup",
    category: "medicines",
    shelfLifeDays: { room: 730, refrigerated: 730, frozen: 730 },
    openedMultiplier: 0.3
  },
  {
    name: "Antihistamine Tablets",
    category: "medicines",
    shelfLifeDays: { room: 1095, refrigerated: 1095, frozen: 1095 },
    openedMultiplier: 0.9
  },
  {
    name: "Calcium Supplements",
    category: "supplements",
    shelfLifeDays: { room: 730, refrigerated: 730, frozen: 730 },
    openedMultiplier: 0.8
  },
  {
    name: "Eye Drops",
    category: "medicines",
    shelfLifeDays: { room: 365, refrigerated: 365, frozen: 365 },
    openedMultiplier: 0.1
  },
  {
    name: "Antacid Tablets",
    category: "medicines",
    shelfLifeDays: { room: 1095, refrigerated: 1095, frozen: 1095 },
    openedMultiplier: 0.9
  },
  {
    name: "Probiotics Capsules",
    category: "supplements",
    shelfLifeDays: { room: 365, refrigerated: 545, frozen: 730 },
    openedMultiplier: 0.8
  }
];

export const findProductByName = (productName: string): ProductData | undefined => {
  return PRODUCT_DATABASE.find(
    product => product.name.toLowerCase().includes(productName.toLowerCase())
  );
};

export const getProductsByCategory = (category: string): ProductData[] => {
  return PRODUCT_DATABASE.filter(product => product.category === category);
};

export const getAllProductNames = (): string[] => {
  return PRODUCT_DATABASE.map(product => product.name);
};
