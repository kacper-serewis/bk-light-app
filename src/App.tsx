
import { Text } from "./components/text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

import PairingCard from "./components/pairing-card";
import { usePersistedStorage } from "./hooks/usePersistedStorage";
import DeviceCard from "./components/device-card";


function App() {
  const [device, setDevice, isLoaded] = usePersistedStorage<string | null>("deviceAddress", null);

  return (
    <main className="p-6 flex flex-col gap-6">
      <Text variant="h1">Bk Light App</Text>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="device">
          <TabsList>
            <TabsTrigger value="device" disabled={!isLoaded}>Device</TabsTrigger>
            <TabsTrigger value="pairing" disabled={!isLoaded}>Pairing</TabsTrigger>
          </TabsList>
          <TabsContent value="device">
           <DeviceCard deviceAddress={device} />
          </TabsContent>
          <TabsContent value="pairing">
            <PairingCard onSelectDevice={(device) => {
              setDevice(device.address)
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default App;
