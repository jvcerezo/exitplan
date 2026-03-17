import { RentVsBuyCalculator } from "@/components/tools/rent-vs-buy-calculator";

export default function RentVsBuyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rent vs Buy</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Should you keep renting or buy a home with a Pag-IBIG loan? Compare the numbers.
        </p>
      </div>
      <RentVsBuyCalculator />
    </div>
  );
}
