import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Package, Truck, CreditCard, History, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Request {
  id: number;
  type: "delivery" | "frete";
  pickupLocation: string;
  deliveryLocation: string;
  description?: string | null;
  status: string;
  quotedPrice?: string | null;
  orderNumber?: string | null;
  pickupCode?: string | null;
  createdAt: string | Date;
}

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [freteDescription, setFreteDescription] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creatingDelivery, setCreatingDelivery] = useState(false);
  const [creatingFrete, setCreatingFrete] = useState(false);
  const [addingCredits, setAddingCredits] = useState(false);

  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  
  const { data: balanceData, refetch: refetchBalance } = trpc.credits.getBalance.useQuery(
    undefined,
    { enabled: !!user }
  );

  const { data: requestsData, refetch: refetchRequests } = trpc.requests.getUserRequests.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createDeliveryMutation = trpc.requests.createDelivery.useMutation({
    onSuccess: () => {
      toast.success("Solicitação de delivery criada com sucesso!");
      setPickupLocation("");
      setDeliveryLocation("");
      refetchRequests();
    },
    onError: (error) => {
      toast.error("Erro ao criar solicitação");
      console.error(error);
    },
  });

  const createFreteMutation = trpc.requests.createFrete.useMutation({
    onSuccess: () => {
      toast.success("Solicitação de frete criada com sucesso!");
      setPickupLocation("");
      setDeliveryLocation("");
      setFreteDescription("");
      refetchRequests();
    },
    onError: (error) => {
      toast.error("Erro ao criar solicitação");
      console.error(error);
    },
  });

  const addCreditsMutation = trpc.credits.addCredits.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados com sucesso!");
      setCreditAmount("");
      refetchBalance();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar créditos");
      console.error(error);
    },
  });

  const acceptRequestMutation = trpc.requests.acceptRequest.useMutation({
    onSuccess: () => {
      toast.success("Pedido aceito! Créditos debitados.");
      refetchRequests();
      refetchBalance();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao aceitar pedido");
    },
  });

  const rejectRequestMutation = trpc.requests.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("Pedido recusado");
      refetchRequests();
    },
    onError: () => {
      toast.error("Erro ao recusar pedido");
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

  const handleCreateDelivery = async () => {
    if (!pickupLocation || !deliveryLocation) {
      toast.error("Preencha todos os campos");
      return;
    }

    setCreatingDelivery(true);
    await createDeliveryMutation.mutateAsync({
      pickupLocation,
      deliveryLocation,
    });
    setCreatingDelivery(false);
  };

  const handleCreateFrete = async () => {
    if (!pickupLocation || !deliveryLocation || !freteDescription) {
      toast.error("Preencha todos os campos");
      return;
    }

    setCreatingFrete(true);
    await createFreteMutation.mutateAsync({
      pickupLocation,
      deliveryLocation,
      description: freteDescription,
    });
    setCreatingFrete(false);
  };

  const handleAddCredits = async () => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    setAddingCredits(true);
    await addCreditsMutation.mutateAsync({
      amount: creditAmount,
    });
    setAddingCredits(false);
  };

  const handleAcceptRequest = (requestId: number) => {
    acceptRequestMutation.mutate({ requestId });
  };

  const handleRejectRequest = (requestId: number) => {
    rejectRequestMutation.mutate({ requestId });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const balance = balanceData?.balance || "0.00";

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
              <h1 className="text-2xl font-bold text-white">MultBoy</h1>
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
        {/* Balance Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-6 w-6" />
              Saldo de Créditos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-5xl font-bold">R$ {parseFloat(balance).toFixed(2)}</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                    + Adicionar Créditos
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Adicionar Créditos</DialogTitle>
                    <DialogDescription>
                      Simule uma compra de créditos via PIX
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Valor (R$)</label>
                      <Input
                        type="number"
                        placeholder="100.00"
                        value={creditAmount}
                        onChange={(e) => setCreditAmount(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <Button 
                      onClick={handleAddCredits} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={addingCredits}
                    >
                      {addingCredits ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Confirmar Compra"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="new-request" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 border border-white/20">
            <TabsTrigger value="new-request" className="text-white data-[state=active]:bg-blue-600">Nova Solicitação</TabsTrigger>
            <TabsTrigger value="requests" className="text-white data-[state=active]:bg-blue-600">Minhas Solicitações</TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-blue-600">Histórico</TabsTrigger>
          </TabsList>

          {/* New Request Tab */}
          <TabsContent value="new-request" className="space-y-4">
            <Tabs defaultValue="delivery" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                <TabsTrigger value="delivery" className="text-white data-[state=active]:bg-blue-600">Delivery</TabsTrigger>
                <TabsTrigger value="frete" className="text-white data-[state=active]:bg-blue-600">Frete</TabsTrigger>
              </TabsList>

              {/* Delivery */}
              <TabsContent value="delivery">
                <Card className="bg-white/95 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="mr-2 h-5 w-5 text-blue-600" />
                      Solicitar Delivery
                    </CardTitle>
                    <CardDescription>
                      Informe o local de coleta e entrega
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Local de Coleta</label>
                      <Input
                        placeholder="Ex: Rua A, 123 - Centro"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Local de Entrega</label>
                      <Input
                        placeholder="Ex: Rua B, 456 - Bairro"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateDelivery} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={creatingDelivery}
                    >
                      {creatingDelivery ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Solicitar Delivery"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Frete */}
              <TabsContent value="frete">
                <Card className="bg-white/95 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5 text-indigo-600" />
                      Solicitar Frete
                    </CardTitle>
                    <CardDescription>
                      Descreva o serviço que você precisa
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Local de Coleta</label>
                      <Input
                        placeholder="Ex: Rua A, 123 - Centro"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Local de Entrega</label>
                      <Input
                        placeholder="Ex: Rua B, 456 - Bairro"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Descrição do Serviço</label>
                      <Input
                        placeholder="Descreva o serviço que precisa"
                        value={freteDescription}
                        onChange={(e) => setFreteDescription(e.target.value)}
                      />
                    </div>
                    <Button 
                      onClick={handleCreateFrete} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      disabled={creatingFrete}
                    >
                      {creatingFrete ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        "Solicitar Frete"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-4">
              {requests.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur">
                  <CardContent className="pt-6 text-center text-gray-500">
                    Você não tem solicitações pendentes
                  </CardContent>
                </Card>
              ) : (
                requests.map((request) => (
                  <Card key={request.id} className="bg-white/95 backdrop-blur border-white/20">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {request.type === "delivery" ? "📦 Delivery" : "🚚 Frete"}
                          </CardTitle>
                          <CardDescription>
                            Status: <span className="font-semibold text-gray-900">
                              {request.status === "aguardando_resposta" && "Aguardando Resposta"}
                              {request.status === "cotado" && "Cotado"}
                              {request.status === "aceito" && "Aceito"}
                              {request.status === "concluido" && "Concluído"}
                              {request.status === "cancelado" && "Cancelado"}
                            </span>
                          </CardDescription>
                        </div>
                        {request.quotedPrice && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              R$ {parseFloat(request.quotedPrice).toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">De:</p>
                        <p className="font-medium">{request.pickupLocation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Para:</p>
                        <p className="font-medium">{request.deliveryLocation}</p>
                      </div>
                      {request.description && (
                        <div>
                          <p className="text-sm text-gray-600">Descrição:</p>
                          <p className="font-medium">{request.description}</p>
                        </div>
                      )}
                      {request.status === "aceito" && request.orderNumber && request.pickupCode && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
                          <p className="text-sm font-semibold text-green-900">Pedido Aceito!</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-green-700">Número do Pedido</p>
                              <p className="text-2xl font-bold text-green-600">{request.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-green-700">Código de Coleta</p>
                              <p className="text-2xl font-bold text-green-600">{request.pickupCode}</p>
                            </div>
                          </div>
                          <p className="text-xs text-green-700 mt-2">Aguardando motoboy...</p>
                        </div>
                      )}
                      {request.status === "cotado" && request.quotedPrice && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white" 
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={acceptRequestMutation.isPending}
                          >
                            {acceptRequestMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              "u2713 Aceitar"
                            )}
                          </Button>
                          <Button 
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={rejectRequestMutation.isPending}
                          >
                            {rejectRequestMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              "u2715 Recusar"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Histórico de transações de créditos</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
