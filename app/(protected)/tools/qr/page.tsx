import QRCodeGenerator from "@/components/tools/qr/QRCodeGenerator";

export default function QRToolPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">QR Code Generator</h1>
            <QRCodeGenerator />
        </div>
    );
}
