import { PayslipDecoder } from "@/components/tools/payslip-decoder";

export default function PayslipDecoderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payslip Decoder</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          See exactly where every peso of your salary goes.
        </p>
      </div>
      <PayslipDecoder />
    </div>
  );
}
