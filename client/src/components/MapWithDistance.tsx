import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface MapWithDistanceProps {
  pickupLocation: string;
  deliveryLocation: string;
  onDistanceCalculated?: (distance: string) => void;
}

export default function MapWithDistance({
  pickupLocation,
  deliveryLocation,
  onDistanceCalculated,
}: MapWithDistanceProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = async () => {
    if (!pickupLocation || !deliveryLocation) {
      setError("Preencha ambos os locais");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simular cálculo de distância
      // Em produção, isso usaria a Google Maps Distance Matrix API
      const mockDistance = (Math.random() * 20 + 1).toFixed(1);
      setDistance(mockDistance);
      onDistanceCalculated?.(mockDistance);
    } catch (err) {
      setError("Erro ao calcular distância");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calcular Distância</CardTitle>
        <CardDescription>
          Use o Google Maps para calcular a distância entre os locais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Local de Coleta</label>
          <Input
            value={pickupLocation}
            disabled
            placeholder="Local de coleta"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Local de Entrega</label>
          <Input
            value={deliveryLocation}
            disabled
            placeholder="Local de entrega"
          />
        </div>

        <Button
          onClick={calculateDistance}
          disabled={loading || !pickupLocation || !deliveryLocation}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculando...
            </>
          ) : (
            "Calcular Distância"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {distance && (
          <div className="p-3 bg-green-50 text-green-700 rounded">
            <p className="text-sm font-medium">Distância Estimada:</p>
            <p className="text-2xl font-bold">{distance} km</p>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-64 bg-gray-200 rounded border border-gray-300"
          style={{ minHeight: "300px" }}
        >
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Mapa do Google Maps (integração em produção)
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
