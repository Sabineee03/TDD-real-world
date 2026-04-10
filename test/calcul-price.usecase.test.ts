import { CalculatePriceUseCase, ReductionGateway } from "../app/calcul-price.usecase";
import { test, describe, expect } from "vitest";


export class StubReductionGateway implements ReductionGateway {
   reduction: any[] = [];

  async getReductionByCode(code?: string | string[]){
    return this.reduction;
  }
}

describe("CalculPriceUseCase", () => {
    test("Should return total price for one product without discount", async () => {
        const calculatePrice = new CalculatePriceUseCase();
        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 1, type: "TSHIRT" },
        ]);
        expect(result).toBe(10);
    });

    test("should calculate total price for multiple products", async () => {
        const calculatePrice = new CalculatePriceUseCase();

        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 1, type: "TSHIRT" },
            { price: 20, name: "PULL", quantity: 1, type: "PULL" },
        ]);

        expect(result).toBe(30);
    });

    test("should calculate total price with quantity", async () => {
        const calculatePrice = new CalculatePriceUseCase();

        const result = await calculatePrice.execute([
            { price: 10, name: "TSHIRT", quantity: 2, type: "TSHIRT" },
        ]);

        expect(result).toBe(20);
    });

    test("should apply percentage reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = [
            {
                type: "PERCENTAGE",
                amount: 10,
            }
        ];

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [
            { price: 100, name: "TSHIRT", quantity: 1, type: "TSHIRT" },
            ],
            "PROMO10"
        );

        expect(result).toBe(90);
    });

    test("should apply fixed reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = [
            {
                type: "FIXED",
                amount: 30,
            }
        ];

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 100, name: "TSHIRT", quantity: 1, type: "TSHIRT" }],
            "PROMO30"
        );

        expect(result).toBe(70);
    });

    test("should not go under zero with fixed reduction", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = [
            {
                type: "FIXED",
                amount: 200,
            }
        ];

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 100, name: "TSHIRT", quantity: 1, type: "TSHIRT" }],
            "PROMO200"
        );

        expect(result).toBe(0);
    });

    test("should buy one get one free on tshirt", async () => {
        const reductionGateway = new StubReductionGateway();
        reductionGateway.reduction = [
            {
                type: "FREE_PRODUCT",
                productType: "TSHIRT",
            }
        ];

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 10, name: "TSHIRT", quantity: 2, type: "TSHIRT" }],
            "BOGO"
        );

        expect(result).toBe(10);
    });

    test("should apply multiple promotions in correct order", async () => {
        const reductionGateway = new StubReductionGateway();

        reductionGateway.reduction = [
            { type: "FREE_PRODUCT", productType: "TSHIRT" },
            { type: "PERCENTAGE", amount: 10 },
        ];

        reductionGateway.getReductionByCode = async () => reductionGateway.reduction;

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 10, name: "TSHIRT", quantity: 2, type: "TSHIRT" }],
            ["BOGO", "PROMO10"]
        );

        expect(result).toBe(9);
    });

    test("should apply black friday discount when date is valid", async () => {
        const reductionGateway = new StubReductionGateway();

        reductionGateway.reduction = [
            { type: "BLACK_FRIDAY" },
        ];

        const calculatePrice = new CalculatePriceUseCase(reductionGateway);

        const result = await calculatePrice.execute(
            [{ price: 100, name: "TSHIRT", quantity: 1, type: "TSHIRT" }],
            ["BLACK_FRIDAY"],
            new Date("2025-11-29")
        );

        expect(result).toBe(50);
    });
});