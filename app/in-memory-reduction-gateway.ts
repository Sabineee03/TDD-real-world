import { ReductionGateway } from "./calcul-price.usecase";

export class InMemoryReductionGateway implements ReductionGateway {
  async getReductionByCode(code?: string | string[]) {
    const codes = Array.isArray(code) ? code : [code];

    const reductions: any[] = [];

    for (const c of codes) {
      if (c === "PROMO10") {
        reductions.push({ type: "PERCENTAGE", amount: 10 });
      }

      if (c === "PROMO30") {
        reductions.push({ type: "FIXED", amount: 30 });
      }

      if (c === "BOGO") {
        reductions.push({ type: "FREE_PRODUCT", productType: "TSHIRT" });
      }

      if (c === "BLACK_FRIDAY") {
        reductions.push({ type: "BLACK_FRIDAY" });
      }
    }

    return reductions;
  }
}