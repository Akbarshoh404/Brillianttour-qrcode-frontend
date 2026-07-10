export async function downloadQrImage(qrUrl: string, uuid: string): Promise<void> {
  const response = await fetch(qrUrl, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch QR code");

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = window.document.createElement("a");
  link.href = objectUrl;
  link.download = `${uuid}-qr.png`;
  window.document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}
