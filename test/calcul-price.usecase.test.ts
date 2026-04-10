import { CalculatePriceUseCase, ReductionGateway } from "../app/calcul-price.usecase";
import { test, describe, expect } from "vitest";


export class StubReductionGateway implements ReductionGateway {
  reduction;

  async getReductionByCode(code?: string) {
    return this.reduction;
  }
}

describe("CalculPriceUseCase", () => {
    test("Should return total price for one product without discount", async () => {
        const calculatePrice = new CalculatePriceUseCase();
        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 1 },
        ]);
        expect(result).toBe(10);
    });

    test("should calculate total price for multiple products", async () => {
        const calculatePrice = new CalculatePriceUseCase();

        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 1 },
            { price: 20, name: "PULL", quantity: 1 },
        ]);

        expect(result).toBe(30);
    });

    test("should calculate total price with quantity", async () => {
        const calculatePrice = new CalculatePriceUseCase();

        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 2 },
        ]);

        expect(result).toBe(20);
    });

    test("should apply percentage reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = {
            type: "PERCENTAGE",
            amount: 10,
        };

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [
            { price: 100, name: "TSHIRT", quantity: 1 },
            ],
            "PROMO10"
        );

        expect(result).toBe(90);
    });

    test("should apply fixed reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = {
            type: "FIXED",
            amount: 30,
        };

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 100, name: "TSHIRT", quantity: 1 }],
            "PROMO30"
        );

        expect(result).toBe(70);
    });

    test("should not go under zero with fixed reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = {
            type: "FIXED",
            amount: 200,
        };

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 100, name: "TSHIRT", quantity: 1 }],
            "PROMO200"
        );

        expect(result).toBe(0);
    });
});