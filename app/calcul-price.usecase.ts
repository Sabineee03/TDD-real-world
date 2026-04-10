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
  getReductionByCode(code?: string): Promise<{
    type: string;
    amount: number;
  } | undefined>;
}

export class CalculatePriceUseCase {
  constructor(private reductionGateway?: ReductionGateway) {}

  async execute(
    products: { price: number; name: string; quantity: number }[],
    code?: string
  ) {
    const total = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    const reduction = await this.reductionGateway?.getReductionByCode(code);

    if (reduction?.type === "PERCENTAGE") {
      return total - (total * reduction.amount) / 100;
    }

    if (reduction?.type === "FIXED") {
      return Math.max(0, total - reduction.amount);
    }
    
    return total;
  }
}
