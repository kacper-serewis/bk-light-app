import { useBleScanner } from "@/hooks/useBleScanner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Text } from "./text";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import * as blec from "@mnlphlp/plugin-blec";

export default function PairingCard({onSelectDevice}: {onSelectDevice?: (device: blec.BleDevice) => void}) {
    const { devices, startScan, stopScan, isScanning } = useBleScanner();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pairing</CardTitle>
                <CardDescription>
                    Pair your device with the app.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">

                <Button onClick={() => {
                    if(isScanning) {
                        stopScan();
                    } else {
                        startScan();
                    }
                }}>{isScanning ? "Stop Searching" : "Start Searching"}</Button>

                <Text variant="muted">Found {devices.length} devices.</Text>


                <Table>
                    <TableCaption>Found Devices</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="max-h-[100px] overflow-y-auto">
                        {devices.map((device) => {
                            return <TableRow key={device.address}>
                                <TableCell>{device.name}</TableCell>
                                <TableCell>{device.address}</TableCell>
                                <TableCell>
                                    <Button onClick={() => {
                                        stopScan();
                                        onSelectDevice?.(device);
                                    }} disabled={onSelectDevice === undefined}>
                                        Use
                                    </Button>
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
               
            </CardContent>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}