# Plataforma de Delivery e Frete - TODO

## Fase 1: Banco de Dados e Autenticação
- [x] Configurar tabelas do banco de dados (usuários, solicitações, créditos, respostas)
- [x] Implementar autenticação simples com usuário/senha
- [x] Roteamento baseado em role (admin vs cliente)

## Fase 2: Painel do Cliente
- [x] Criar layout do painel do cliente
- [x] Funcionalidade: Solicitar delivery (coleta e entrega)
- [x] Funcionalidade: Solicitar frete (serviço personalizado)
- [x] Funcionalidade: Adicionar créditos via simulação PIX
- [x] Funcionalidade: Visualizar histórico de solicitações
- [x] Funcionalidade: Visualizar saldo de créditos

## Fase 3: Painel do Administrador
- [x] Criar layout do painel do administrador
- [x] Visualizar todas as solicitações pendentes
- [ ] Integração com Google Maps para calcular distâncias
- [x] Funcionalidade: Responder solicitações com valor do serviço
- [x] Visualizar detalhes de coleta e entrega

## Fase 4: Sistema de Notificações
- [x] Notificação automática ao admin quando cliente cria solicitação
- [x] Envio de email automático ao admin para novas solicitações (simulado, pronto para integração com Asaas)

## Fase 5: Testes e Refinamento
- [x] Testar fluxo completo de autenticação
- [x] Testar fluxo de solicitação de delivery
- [x] Testar fluxo de solicitação de frete
- [x] Testar sistema de créditos
- [x] Testar respostas do admin
- [x] Validar estilo visual e UX

## Fase 6: Melhorias e Rebranding MultBoy
- [x] Modernizar layout com design elegante
- [x] Rebranding para MultBoy
- [x] Traduzir status para português (aguardando_resposta → Aguardando Resposta, cotado → Cotado, etc)
- [x] Criar página de login com serviços e propaganda do app
- [x] Adicionar coluna de aceitação de solicitação no banco
- [x] Implementar funcionalidade de aceitar/recusar solicitações cotadas
- [x] Testar fluxo completo com novas funcionalidades

## Fase 7: Novas Melhorias
- [x] Implementar congelamento de créditos ao aceitar pedido
- [x] Adicionar ícone/logo do MultBoy na tela inicial
- [x] Modernizar layout do painel do cliente
- [x] Modernizar layout do painel do administrador
- [x] Testar fluxo completo com novas funcionalidades

## Fase 8: Notificações em Tempo Real e Números de Pedido
- [x] Adicionar campos de número do pedido e código de coleta no banco
- [x] Implementar geração de números (4 dígitos) ao aceitar pedido
- [x] Implementar notificação em tempo real para admin
- [x] Atualizar painel do admin para exibir pedidos aceitos
- [x] Testar fluxo completo com notificações
