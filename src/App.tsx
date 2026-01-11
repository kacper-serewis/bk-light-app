
import { Text } from "./components/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import PairingCard from "./components/pairing-card";
import { usePersistedStorage } from "./hooks/usePersistedStorage";
import DeviceCard from "./components/device-card";
import { ScrollArea } from "./components/ui/scroll-area";


function App() {
  const [device, setDevice, isLoaded] = usePersistedStorage<string | null>("deviceAddress", null);

  return (
    <main className="p-6 flex flex-col gap-4" style={{ height: "100vh"}}>
      <Text variant="h1">Bk Light App</Text>
      <Tabs defaultValue="device" className="flex flex-col flex-1 min-h-0">
        <TabsList>
          <TabsTrigger value="device" disabled={!isLoaded}>Device</TabsTrigger>
          <TabsTrigger value="pairing" disabled={!isLoaded}>Pairing</TabsTrigger>
        </TabsList>

        <ScrollArea style={{ flex: 1, overflow: "auto" }}>
          <TabsContent value="device">
            <DeviceCard deviceAddress={device} />
          </TabsContent>
          <TabsContent value="pairing">
            <PairingCard onSelectDevice={(device) => {
              setDevice(device.address)
            }} />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </main>
  );
}

export default App;
