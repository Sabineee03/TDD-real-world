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
  getReductionByCode(code?: string | string[]): Promise<
    (
      | { type: "PERCENTAGE"; amount: number }
      | { type: "FIXED"; amount: number }
      | { type: "FREE_PRODUCT"; productType: ProductsType }
    )[]
  >;
}

export class CalculatePriceUseCase {
  constructor(private reductionGateway?: ReductionGateway) {}

  async execute(products: Product[], code?: string | string[]
  ) {
    let total = products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );

    const reductions = await this.reductionGateway?.getReductionByCode(code) || [];

    const freeProduct = reductions.find(
      (r) => r.type === "FREE_PRODUCT"
    ) as { type: "FREE_PRODUCT"; productType: ProductsType } | undefined;


    if (freeProduct) {
      total = products.reduce((sum, product) => {
        if (product.type === freeProduct.productType) {
          const payable = Math.ceil(product.quantity / 2);
          return sum + payable * product.price;
        }
        return sum + product.price * product.quantity;
      }, 0);
    }

    const percentage = reductions.find(
      (r) => r.type === "PERCENTAGE"
    ) as { type: "PERCENTAGE"; amount: number } | undefined;
  
    if (percentage) {
      total = total - (total * percentage.amount) / 100;
    }

    const fixed = reductions.find(
      (r) => r.type === "FIXED"
    ) as { type: "FIXED"; amount: number } | undefined;
    
    if (fixed) {
      total = Math.max(0, total - fixed.amount);
    }

    return total;
  }
}
