import { usePanel } from "@/hooks/usePanel";
import { Text } from "./text";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import MinecraftClock from "./minecraft-clock";


function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}



export default function DeviceCard({ deviceAddress }: { deviceAddress: string | null }) {

  const panel = usePanel({ deviceAddress });


  return (
    <Card>
      <CardHeader>
        <CardTitle>Device</CardTitle>
        <CardDescription>
          Configure your device here.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">

        <section className="flex flex-col">
          <Text variant="muted">Device Address: {deviceAddress ?? "Pair your device first."}</Text>
          <Text variant="muted">State: {panel.state}</Text>
          <Text variant="muted">Error: {panel.error ?? "No error"}</Text>
        </section>



        <MinecraftClock disabled={panel.state !== "connected"} onPng={(png) => {
          if (panel.state !== "connected") {
            return;
          }
          const rawBase64 = png.replace("data:image/png;base64,", "")
          panel.sendPng(base64ToArrayBuffer(rawBase64))
        }} />


      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant={panel.state === "connected" ? "destructive" : "default"} onClick={() => { if (panel.state === "connected") { panel.disconnect() } else { panel.connect() } }} disabled={panel.state === "connecting" || panel.state === "scanning"}>{panel.state !== "connected" ? "Connect" : "Disconnect"}</Button>
      </CardFooter>
    </Card>
  )
} 