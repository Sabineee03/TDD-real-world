import { CalculatePriceUseCase } from "@/calcul-price.usecase";
import { InMemoryReductionGateway } from "@/in-memory-reduction-gateway";
import cors from "cors";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/totalPrice", async (req: Request, res: Response) => {
  const { products, codes, date } = req.body;

  const gateway = new InMemoryReductionGateway();
  const usecase = new CalculatePriceUseCase(gateway);

  const total = await usecase.execute(
    products,
    codes,
    date ? new Date(date) : new Date()
  );

  return res.json({ total });
});

app.get("/baskets", (request: Request, response: Response) => {});

export default app;
