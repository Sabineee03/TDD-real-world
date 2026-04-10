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


export class CalculatePriceUseCase {
  async execute(
    products: { price: number; name: string; quantity: number }[]
  ) {
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  }
}