import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, MapPin, DollarSign, Loader2, Map, CheckCircle, Clock } from "lucide-react";
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
  status: string;
  quotedPrice?: string | null;
  estimatedDistance?: string | null;
  orderNumber?: string | null;
  pickupCode?: string | null;
  createdAt: string | Date;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [estimatedDistance, setEstimatedDistance] = useState("");
  const [respondingRequest, setRespondingRequest] = useState(false);

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();

  const { data: requestsData, refetch: refetchRequests } = trpc.requests.getPending.useQuery(
    undefined,
    { 
      enabled: !!user && user?.role === "admin",
    }
  );

  useEffect(() => {
    if (!user || user?.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const respondMutation = trpc.requests.respondToRequest.useMutation({
    onSuccess: () => {
      toast.success("Solicitação respondida com sucesso!");
      setSelectedRequest(null);
      setQuotedPrice("");
      setEstimatedDistance("");
      refetchRequests();
    },
    onError: (error) => {
      toast.error("Erro ao responder solicitação");
      console.error(error);
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
      toast.success("Logout realizado com sucesso!");
    },
  });

  useEffect(() => {
    if (requestsData) {
      setRequests(requestsData);
    }
  }, [requestsData]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRespondRequest = async () => {
    if (!selectedRequest || !quotedPrice) {
      toast.error("Preencha o valor da cotação");
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

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const pendingCount = requests.filter(r => r.status === "aguardando_resposta").length;
  const quotedCount = requests.filter(r => r.status === "cotado").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MultBoy Admin</h1>
              <p className="text-gray-300 text-sm">Bem-vindo, {user?.name || user?.username}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-100 flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Aguardando Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-indigo-100 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Cotadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{quotedCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-purple-100">
                Total de Solicitações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{requests.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card className="bg-white/95 backdrop-blur border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Solicitações Pendentes</CardTitle>
            <CardDescription>
              Clique em uma solicitação para responder com um valor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma solicitação pendente</p>
                <p className="text-sm mt-2">Todas as solicitações foram respondidas!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {request.type === "delivery" ? "📦 Delivery" : "🚚 Frete"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          ID: <span className="font-mono font-bold">#{request.id}</span> | Status: <span className="font-medium inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                            {request.status === "aguardando_resposta" && "Aguardando Resposta"}
                            {request.status === "cotado" && "Cotado"}
                            {request.status === "aceito" && "Aceito"}
                            {request.status === "concluido" && "Concluído"}
                            {request.status === "cancelado" && "Cancelado"}
                          </span>
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              setQuotedPrice("");
                              setEstimatedDistance("");
                            }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Responder
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                          <DialogHeader>
                            <DialogTitle>Responder Solicitação #{selectedRequest?.id}</DialogTitle>
                            <DialogDescription>
                              Informe o valor do serviço e a distância estimada
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {selectedRequest && (
                              <MapWithDistance
                                pickupLocation={selectedRequest.pickupLocation}
                                deliveryLocation={selectedRequest.deliveryLocation}
                                onDistanceCalculated={(distance) => setEstimatedDistance(distance)}
                              />
                            )}
                            <div>
                              <label className="text-sm font-medium">Valor (R$)</label>
                              <Input
                                type="number"
                                placeholder="100.00"
                                value={quotedPrice}
                                onChange={(e) => setQuotedPrice(e.target.value)}
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Distância Estimada (km)</label>
                              <Input
                                type="number"
                                placeholder="5.5"
                                value={estimatedDistance}
                                onChange={(e) => setEstimatedDistance(e.target.value)}
                                step="0.1"
                                min="0"
                              />
                            </div>
                            <Button
                              onClick={handleRespondRequest}
                              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                              disabled={respondingRequest}
                            >
                              {respondingRequest ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                "Confirmar Resposta"
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-600 mb-2 font-semibold">DE (Coleta)</p>
                        <p className="font-medium flex items-start text-gray-900">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                          {request.pickupLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-2 font-semibold">PARA (Entrega)</p>
                        <p className="font-medium flex items-start text-gray-900">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-red-600" />
                          {request.deliveryLocation}
                        </p>
                      </div>
                    </div>

                    {request.description && (
                      <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-xs text-gray-600 mb-2 font-semibold">DESCRIÇÃO DO SERVIÇO</p>
                        <p className="text-sm text-gray-900">{request.description}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
                      <span>
                        Criado em: <span className="font-medium">{new Date(request.createdAt).toLocaleString("pt-BR")}</span>
                      </span>
                      {request.quotedPrice && (
                        <span className="font-semibold text-indigo-600 text-base">
                          Cotado: R$ {parseFloat(request.quotedPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
