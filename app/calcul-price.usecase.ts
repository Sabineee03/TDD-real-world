export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
  name: string;
  quantity: number;
  type: ProductsType;
  price: number;
};

export type Discount = {
  type: string;
};

export interface ReductionGateway {
  getReductionByCode(code?: string | string[]): Promise<any[]>;
}

interface PricingStrategy {
  apply(total: number, products: Product[], now: Date): number;
}

class FreeProductStrategy implements PricingStrategy {
  constructor(private reduction: any) {}

  apply(total: number, products: Product[]): number {
    return products.reduce((sum, product) => {
      if (product.type === this.reduction.productType) {
        const payable = Math.ceil(product.quantity / 2);
        return sum + payable * product.price;
      }
      return sum + product.price * product.quantity;
    }, 0);
  }
}

class PercentageStrategy implements PricingStrategy {
  constructor(private reduction: any) {}

  apply(total: number): number {
    return total - (total * this.reduction.amount) / 100;
  }
}

class FixedStrategy implements PricingStrategy {
  constructor(private reduction: any) {}

  apply(total: number): number {
    return Math.max(0, total - this.reduction.amount);
  }
}

class BlackFridayStrategy implements PricingStrategy {
  apply(total: number, products: Product[], now: Date): number {
    const start = new Date("2025-11-28T00:00:00");
    const end = new Date("2025-11-30T23:59:59");

    if (now >= start && now <= end) {
      return Math.max(1, total * 0.5);
    }

    return total;
  }
}

function createStrategy(reduction: any): PricingStrategy | null {
  switch (reduction.type) {
    case "FREE_PRODUCT":
      return new FreeProductStrategy(reduction);
    case "PERCENTAGE":
      return new PercentageStrategy(reduction);
    case "FIXED":
      return new FixedStrategy(reduction);
    case "BLACK_FRIDAY":
      return new BlackFridayStrategy();
    default:
      return null;
  }
}
export class CalculatePriceUseCase {
  constructor(private reductionGateway?: ReductionGateway) {}

  async execute(
    products: Product[],
    code?: string | string[],
    now: Date = new Date()
  ): Promise<number> {
    let total = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    const reductions =
      (await this.reductionGateway?.getReductionByCode(code)) || [];

    const orderedTypes = [
      "FREE_PRODUCT",
      "PERCENTAGE",
      "FIXED",
      "BLACK_FRIDAY",
    ];

    for (const type of orderedTypes) {
      const reduction = reductions.find((r) => r.type === type);
      if (!reduction) continue;

      const strategy = createStrategy(reduction);
      if (!strategy) continue;

      total = strategy.apply(total, products, now);
    }

    return total;
  }
}