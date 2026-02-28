import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Package, Truck, Clock, MapPin, DollarSign, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      
      if (data.user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/client");
      }
      
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      toast.error("Falha no login. Verifique suas credenciais.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Features */}
          <div className="text-white space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                MultBoy
              </h1>
              <p className="text-xl text-gray-300 mb-2">
                Sua plataforma de delivery e frete inteligente
              </p>
              <p className="text-gray-400">
                Conectando clientes, motoboys e oportunidades em tempo real
              </p>
            </div>

            {/* Features Grid */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Delivery Rápido</h3>
                  <p className="text-sm text-gray-400">
                    Solicite entregas em menos de 30 minutos com rastreamento em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-400/50 transition">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Fretes Personalizados</h3>
                  <p className="text-sm text-gray-400">
                    Descreva seu serviço e receba propostas de motoboys qualificados
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-green-400/50 transition">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Sistema de Créditos</h3>
                  <p className="text-sm text-gray-400">
                    Compre créditos via PIX e pague seus serviços de forma segura
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-yellow-400/50 transition">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Google Maps Integrado</h3>
                  <p className="text-sm text-gray-400">
                    Visualize rotas, calcule distâncias e acompanhe entregas ao vivo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-400/50 transition">
                <div className="flex-shrink-0">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Notificações em Tempo Real</h3>
                  <p className="text-sm text-gray-400">
                    Receba atualizações instantâneas sobre suas solicitações
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:border-pink-400/50 transition">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Agendamentos Flexíveis</h3>
                  <p className="text-sm text-gray-400">
                    Escolha o horário que melhor se adequa à sua necessidade
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">1000+</p>
                <p className="text-sm text-gray-400">Entregas Realizadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-indigo-400">500+</p>
                <p className="text-sm text-gray-400">Motoboys Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">98%</p>
                <p className="text-sm text-gray-400">Satisfação</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Bem-vindo ao MultBoy
                  </h2>
                  <p className="text-gray-600">
                    Acesse sua conta para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário
                    </label>
                    <Input
                      type="text"
                      placeholder="Digite seu usuário"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-4">
                    Credenciais de Demonstração:
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">Admin:</span> gael / 10203040
                      </p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-gray-900">Cliente:</span> user1 / password123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
