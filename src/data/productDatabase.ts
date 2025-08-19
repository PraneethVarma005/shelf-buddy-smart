
export interface ProductData {
  name: string;
  category: string;
  // Backward-compatible fields used by existing UI:
  shelfLifeDays: {
    room: number;         // closed at room
    refrigerated: number; // closed in fridge
    frozen: number;       // closed in freezer
  };
  openedMultiplier: number; // conservative ratio when opened

  // New detailed fields for accuracy (optional, for future use):
  detailedShelfLife?: {
    room: { opened: number; closed: number };
    refrigerated: { opened: number; closed: number };
    frozen: { opened: number; closed: number };
  };
}

// Helper to build a product entry with both legacy and detailed values
function makeProduct(
  name: string,
  category: string,
  roomOpened: number, roomClosed: number,
  fridgeOpened: number, fridgeClosed: number,
  frozenOpened: number, frozenClosed: number
): ProductData {
  // Use closed values as the legacy base, and a conservative openedMultiplier
  const ratios = [
    roomClosed ? roomOpened / roomClosed : 1,
    fridgeClosed ? fridgeOpened / fridgeClosed : 1,
    frozenClosed ? frozenOpened / frozenClosed : 1,
  ].filter((n) => Number.isFinite(n) && n > 0);

  const conservativeMultiplier = ratios.length ? Math.max(0.01, Math.min(...ratios)) : 0.5;

  return {
    name,
    category,
    shelfLifeDays: {
      room: roomClosed,
      refrigerated: fridgeClosed,
      frozen: frozenClosed,
    },
    openedMultiplier: Number(conservativeMultiplier.toFixed(3)),
    detailedShelfLife: {
      room: { opened: roomOpened, closed: roomClosed },
      refrigerated: { opened: fridgeOpened, closed: fridgeClosed },
      frozen: { opened: frozenOpened, closed: frozenClosed },
    },
  };
}

export const PRODUCT_DATABASE: ProductData[] = [
  // Food Items (10)
  makeProduct("Milk (packet)", "dairy_products", 1, 2, 3, 7, 30, 90),
  makeProduct("Bread", "baked_goods", 2, 5, 5, 10, 30, 60),
  makeProduct("Rice (uncooked)", "staples", 90, 365, 180, 540, 365, 720),
  makeProduct("Wheat Flour", "staples", 30, 180, 90, 270, 180, 540),
  makeProduct("Biscuits", "snacks", 7, 180, 15, 240, 60, 365),
  makeProduct("Curd (dahi)", "dairy_products", 1, 3, 5, 14, 30, 90),
  makeProduct("Paneer", "dairy_products", 1, 2, 5, 10, 30, 90),
  makeProduct("Soft Drinks", "beverages", 2, 180, 5, 240, 30, 365),
  makeProduct("Pickles", "condiments", 180, 720, 365, 1080, 720, 1440),
  makeProduct("Potato Chips", "snacks", 5, 180, 10, 240, 60, 365),

  // Medicines (10)
  makeProduct("Paracetamol Tabs", "medicines", 30, 730, 60, 1095, 90, 1460),
  makeProduct("Ibuprofen Tabs", "medicines", 30, 730, 60, 1095, 90, 1460),
  makeProduct("Amoxicillin Caps", "medicines", 20, 730, 30, 1095, 60, 1460),
  makeProduct("ORS Sachet", "medicines", 1, 730, 2, 1095, 30, 1460),
  makeProduct("Cough Syrup", "medicines", 30, 365, 60, 540, 90, 720),
  makeProduct("Eye Drops (multi)", "medicines", 30, 730, 60, 1095, 90, 1460),
  makeProduct("Insulin Vial", "medicines", 30, 365, 60, 540, 90, 720),
  makeProduct("Vitamin C Tabs", "supplements", 60, 1095, 90, 1460, 180, 1825),
  makeProduct("Antacid Syrup", "medicines", 30, 365, 60, 540, 90, 720),
  makeProduct("Antibiotic Syrup", "medicines", 10, 365, 20, 540, 60, 720),
];

// Search helpers
export const findProductByName = (productName: string): ProductData | undefined => {
  return PRODUCT_DATABASE.find(
    (product) => product.name.toLowerCase().includes(productName.toLowerCase())
  );
};

export const getProductsByCategory = (category: string): ProductData[] => {
  return PRODUCT_DATABASE.filter((product) => product.category === category);
};

export const getAllProductNames = (): string[] => {
  return PRODUCT_DATABASE.map((product) => product.name);
};
