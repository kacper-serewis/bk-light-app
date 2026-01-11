import { useState } from "react";
import * as blec from "@mnlphlp/plugin-blec"

const UUID_WRITE = "0000fa02-0000-1000-8000-00805f9b34fb"
const UUID_NOTIFY = "0000fa03-0000-1000-8000-00805f9b34fb"

const HANDSHAKE_FIRST = [0x08, 0x00, 0x01, 0x80, 0x0e, 0x06, 0x32, 0x00];
const HANDSHAKE_SECOND = [0x04, 0x00, 0x05, 0x80];

const ACK_STAGE_ONE = [0x0C, 0x00, 0x01, 0x80, 0x81, 0x06, 0x32, 0x00, 0x00, 0x01, 0x00, 0x01];
const ACK_STAGE_ONE_ALT = [0x0B, 0x00, 0x01, 0x80, 0x83, 0x06, 0x32, 0x00, 0x00, 0x01, 0x00];
const ACK_STAGE_TWO = [0x08, 0x00, 0x05, 0x80, 0x0B, 0x03, 0x07, 0x02];
const ACK_STAGE_TWO_ALT = [0x08, 0x00, 0x05, 0x80, 0x0E, 0x03, 0x07, 0x01];
const ACK_STAGE_THREE = [0x05, 0x00, 0x02, 0x00, 0x03];

function compare(a1: number[], a2: number[]): boolean {
    if (a1.length !== a2.length) return false;
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
}


function writeAndReadAck(data: number[], writeChar: string, notifyChar: string, writeType: "withResponse" | "withoutResponse" = "withoutResponse"): Promise<number[]> {
    return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout | null = null;

        blec.subscribe(notifyChar, (data) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            resolve(data);
        });

        blec.send(writeChar, data, writeType).then(() => {
            timeoutId = setTimeout(() => {
                reject(new Error("Timeout"));
            }, 5000);
        })
    })

}

function crc32(data: Uint8Array): number {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            if (crc & 1) {
                crc = (crc >>> 1) ^ 0xEDB88320;
            } else {
                crc = crc >>> 1;
            }
        }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}


export function usePanel({ deviceAddress }: { deviceAddress: string | null }) {
    const [error, setError] = useState<string | null>();
    const [state, setState] = useState<"idle" | "connecting" | "connected" | "disconnected">("idle");



    async function sendPng(pngBytes: Uint8Array) {
        const dataLength = pngBytes.length;
        const totalLength = dataLength + 15;

        const frame: number[] = [];

        // total_length as 2 bytes little endian
        frame.push(totalLength & 0xFF);
        frame.push((totalLength >> 8) & 0xFF);

        frame.push(0x02);

        frame.push(0x00, 0x00);

        // data_length as 2 bytes little endian
        frame.push(dataLength & 0xFF);
        frame.push((dataLength >> 8) & 0xFF);

        frame.push(0x00, 0x00);

        // CRC32 as 4 bytes little endian
        const crc = crc32(pngBytes);
        frame.push(crc & 0xFF);
        frame.push((crc >> 8) & 0xFF);
        frame.push((crc >> 16) & 0xFF);
        frame.push((crc >> 24) & 0xFF);

        frame.push(0x00, 0x65);

        // Append png bytes
        for (let i = 0; i < pngBytes.length; i++) {
            frame.push(pngBytes[i]);
        }

        // Print out like 0x00, 0x00
        console.log("Frame: " + frame.map(b => b.toString(16).padStart(2, '0')).join('-'));

        await blec.send(UUID_WRITE, frame, "withResponse");
    }


    async function sendFrame(frame: number[]) {
        await blec.send(UUID_WRITE, frame, "withResponse");
    }

    async function connect() {
        if (!deviceAddress) {
            setError("No device address provided.");
            return
        }

        await blec.connect(deviceAddress, () => {
            setState("disconnected");
        }, false);



        const services = await blec.listServices(deviceAddress);
        if (typeof services === "string") {
            setState("idle");
            setError(services);
            return
        }

        let writeChar: string | null = null;
        let notifyChar: string | null = null;

        for (const service of services) {
            if (!writeChar) {
                const pWriteChar = service.characteristics.find(c => c.uuid === UUID_WRITE);
                if (pWriteChar) {
                    writeChar = pWriteChar.uuid;
                }
            }
            if (!notifyChar) {
                const pNotifyChar = service.characteristics.find(c => c.uuid === UUID_NOTIFY);
                if (pNotifyChar) {
                    notifyChar = pNotifyChar.uuid;
                }
            }
        }

        if (!writeChar || !notifyChar) {
            setState("idle");
            setError(`No write or notify characteristic found. ${writeChar ? "Write: " + writeChar : ""} ${notifyChar ? "Notify: " + notifyChar : ""}`);
            return
        }


        setState("connecting")
        try {
            const handshakeAck = await writeAndReadAck(HANDSHAKE_FIRST, writeChar, notifyChar, "withoutResponse")
            if (!compare(handshakeAck, ACK_STAGE_ONE) && !compare(handshakeAck, ACK_STAGE_ONE_ALT)) {
                setState("idle")
                setError("Invalid handshake response. Expected " + ACK_STAGE_ONE.map(b => b.toString(16).padStart(2, '0')).join('-') + " or " + ACK_STAGE_ONE_ALT.map(b => b.toString(16).padStart(2, '0')).join('-') + " but got " + handshakeAck.map(b => b.toString(16).padStart(2, '0')).join('-'));
                return
            }

            const handshakeSecondAck = await writeAndReadAck(HANDSHAKE_SECOND, writeChar, notifyChar, "withoutResponse").catch(() => null)
            if (!handshakeSecondAck) {
                console.warn("No handshake second ack received");
            } else {
                if (!compare(handshakeSecondAck, ACK_STAGE_TWO) && !compare(handshakeSecondAck, ACK_STAGE_TWO_ALT)) {
                    setState("idle")
                    setError("Invalid handshake response. Expected " + ACK_STAGE_TWO.map(b => b.toString(16).padStart(2, '0')).join('-') + " or " + ACK_STAGE_TWO_ALT.map(b => b.toString(16).padStart(2, '0')).join('-') + " but got " + handshakeSecondAck.map(b => b.toString(16).padStart(2, '0')).join('-'));
                    return
                }
            }
            setState("connected");
        } catch (error) {
            setState("idle")
            setError("Error connecting to device: " + error);
        }
    }

    async function disconnect() {
        await blec.disconnect();
        setState("disconnected");
    }


    return {
        connect, disconnect, state, error, sendFrame, sendPng
    }

}