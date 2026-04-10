import { CalculatePriceUseCase } from "../app/calcul-price.usecase";
import { test, describe, expect } from "vitest";

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
});