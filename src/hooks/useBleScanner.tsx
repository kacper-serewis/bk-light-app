import { useRef, useState } from "react";
import * as blec from "@mnlphlp/plugin-blec";

export function useBleScanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<blec.BleDevice[]>([]);
    const scanTimeoutRef = useRef< ReturnType<typeof setTimeout> | null>(null);


    function startScan() {
        setIsScanning(true);
        blec.startScan((devices) => {
            setDevices(devices.filter(d => d.name.includes("LED_BLE_")));
        }, 8000, false);
        if(scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
        }

        scanTimeoutRef.current = setTimeout(() => {
            stopScan();
        }, 8000);
    }
    function stopScan() {
        setIsScanning(false);
        blec.stopScan();
        if(scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
        }
    }


    return {devices, startScan, stopScan, isScanning}
}