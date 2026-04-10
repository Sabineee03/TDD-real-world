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
  getReductionByCode(code?: string): Promise<
    | { type: "PERCENTAGE"; amount: number }
    | { type: "FIXED"; amount: number }
    | { type: "FREE_PRODUCT"; productType: ProductsType }
    | undefined
  >;
}

export class CalculatePriceUseCase {
  constructor(private reductionGateway?: ReductionGateway) {}

  async execute(
    products: Product[],
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

    if (reduction?.type === "FREE_PRODUCT") {
      return products.reduce((sum, product) => {
        if (product.type === reduction.productType) {
          const payableQuantity = Math.ceil(product.quantity / 2);
          return sum + payableQuantity * product.price;
        }

        return sum + product.price * product.quantity;
      }, 0);
    }
    return total;
  }
}
