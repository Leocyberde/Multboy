import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, MapPin, DollarSign, Loader2, Map, CheckCircle, Clock, Package, User, Home } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import MapWithDistance from "@/components/MapWithDistance";

interface Request {
  id: number;
  userId: number;
  type: "delivery" | "frete";
  pickupLocation: string;
  deliveryLocation: string;
  description?: string | null;
  customerName?: string | null;
  customerWhatsapp?: string | null;
  observations?: string | null;
  status: string;
  quotedPrice?: string | null;
  estimatedDistance?: string | null;
  orderNumber?: string | null;
  pickupCode?: string | null;
  createdAt: string | Date;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [estimatedDistance, setEstimatedDistance] = useState("");
  const [respondingRequest, setRespondingRequest] = useState(false);

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  const { data: pendingData, refetch: refetchPending } = trpc.requests.getPending.useQuery(
    undefined,
    { enabled: !!user && user?.role === "admin" }
  );

  const { data: acceptedData, refetch: refetchAccepted } = trpc.requests.getAccepted.useQuery(
    undefined,
    { enabled: !!user && user?.role === "admin" }
  );

  useEffect(() => {
    if (user && user?.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const respondMutation = trpc.requests.respondToRequest.useMutation({
    onSuccess: () => {
      toast.success("Solicitação respondida!");
      setSelectedRequest(null);
      setQuotedPrice("");
      setEstimatedDistance("");
      refetchPending();
    },
    onError: () => {
      toast.error("Erro ao responder");
    },
  });

  const updateStatusMutation = trpc.requests.updateRequestStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetchAccepted();
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
      toast.success("Logout realizado com sucesso!");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRespondRequest = async () => {
    if (!selectedRequest || !quotedPrice) {
      toast.error("Preencha o valor");
      return;
    }

    setRespondingRequest(true);
    await respondMutation.mutateAsync({
      requestId: selectedRequest.id,
      quotedPrice,
      estimatedDistance: estimatedDistance || undefined,
    });
    setRespondingRequest(false);
  };

  const handleUpdateStatus = (requestId: number, status: "concluido" | "cancelado") => {
    updateStatusMutation.mutate({ requestId, status });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MB</span>
            </div>
            <h1 className="text-2xl font-bold text-white">MultBoy Admin</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-white border-white/20">
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="pending" className="text-white">Aguardando Resposta</TabsTrigger>
            <TabsTrigger value="accepted" className="text-white">Pedidos em Andamento</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-blue-400 p-0 h-auto flex items-center gap-2 mb-6"
                  onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const firstTab = tabsList?.querySelector('[role="tab"]') as HTMLElement;
                    firstTab?.click();
                  }}
                >
                  <Home className="h-4 w-4" />
                  Voltar para o Início
                </Button>
              </div>
              <div className="grid gap-4">
                {!pendingData || pendingData.length === 0 ? (
                <Card className="bg-white/95"><CardContent className="py-10 text-center text-gray-500">Nenhuma solicitação pendente</CardContent></Card>
              ) : (
                pendingData.map((req: any) => (
                  <Card key={req.id} className="bg-white/95">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {req.type === "delivery" ? "📦 Delivery" : "🚚 Frete"}
                          {req.customerName && <span className="ml-2 text-sm text-gray-500">- {req.customerName}</span>}
                        </CardTitle>
                        <CardDescription>ID: #{req.id}</CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button onClick={() => setSelectedRequest(req as Request)}>Responder</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white">
                          <DialogHeader>
                            <DialogTitle>Responder Solicitação #{selectedRequest?.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedRequest && (
                              <MapWithDistance
                                pickupLocation={selectedRequest.pickupLocation}
                                deliveryLocation={selectedRequest.deliveryLocation}
                                onDistanceCalculated={setEstimatedDistance}
                              />
                            )}
                            <Input
                              type="number"
                              placeholder="Valor R$"
                              value={quotedPrice}
                              onChange={(e) => setQuotedPrice(e.target.value)}
                            />
                            <Button className="w-full" onClick={handleRespondRequest} disabled={respondingRequest}>
                              Confirmar Cotação
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500">COLETA</p>
                        <p className="text-sm">{req.pickupLocation}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500">ENTREGA</p>
                        <p className="text-sm">{req.deliveryLocation}</p>
                      </div>
                      {req.customerWhatsapp && (
                        <div className="col-span-2 flex items-center gap-2 text-sm text-green-600 font-bold">
                          WhatsApp: {req.customerWhatsapp}
                        </div>
                      )}
                      {req.observations && (
                        <div className="col-span-2 p-2 bg-gray-100 rounded text-sm italic">
                          Obs: {req.observations}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </div>
          </TabsContent>

          <TabsContent value="accepted">
            <div className="space-y-4">
              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-blue-400 p-0 h-auto flex items-center gap-2 mb-6"
                  onClick={() => {
                    const tabsList = document.querySelector('[role="tablist"]');
                    const firstTab = tabsList?.querySelector('[role="tab"]') as HTMLElement;
                    firstTab?.click();
                  }}
                >
                  <Home className="h-4 w-4" />
                  Voltar para o Início
                </Button>
              </div>
              <div className="grid gap-4">
                {!acceptedData || acceptedData.length === 0 ? (
                  <Card className="bg-white/95"><CardContent className="py-10 text-center text-gray-500">Nenhum pedido em andamento</CardContent></Card>
                ) : (
                  acceptedData.map((req: any) => (
                    <Card key={req.id} className="bg-white/95 border-l-4 border-green-500">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          #{req.orderNumber} - {req.customerName || "Cliente"}
                        </CardTitle>
                        <CardDescription>
                          Status: <span className="font-bold text-blue-600 uppercase">
                            {req.status === "aceito" && "Aguardando Preparo"}
                            {req.status === "preparo" && "Em Preparo"}
                            {req.status === "pronto" && "Pronto para Coleta"}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleUpdateStatus(req.id, "cancelado")}>Cancelar</Button>
                        <Button size="sm" className="bg-green-600" onClick={() => handleUpdateStatus(req.id, "concluido")}>Concluir</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-bold text-gray-500">CÓDIGO COLETA</p>
                          <p className="text-xl font-mono">{req.pickupCode}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-500">VALOR PAGO</p>
                          <p className="text-xl font-bold text-blue-600">R$ {parseFloat(req.quotedPrice).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded space-y-2">
                        <div className="flex gap-2 text-sm"><MapPin className="h-4 w-4 text-green-600"/> <b>De:</b> {req.pickupLocation}</div>
                        <div className="flex gap-2 text-sm"><MapPin className="h-4 w-4 text-red-600"/> <b>Para:</b> {req.deliveryLocation}</div>
                        {req.customerWhatsapp && <div className="text-sm font-bold text-green-600">WhatsApp: {req.customerWhatsapp}</div>}
                        {req.observations && <div className="text-xs italic">Obs: {req.observations}</div>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
