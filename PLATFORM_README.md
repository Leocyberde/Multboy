# Plataforma de Delivery e Frete

Uma plataforma web elegante e funcional para gerenciar solicitações de delivery e frete, com sistema de créditos integrado.

## Funcionalidades Implementadas

### 1. Autenticação Simples
- Login com usuário e senha
- Dois tipos de usuários: **Admin** e **Cliente**
- Roteamento automático baseado em role

**Credenciais de Teste:**
- **Admin:** gael / 10203040
- **Cliente:** user1 / password123

### 2. Painel do Cliente
O cliente pode:
- **Solicitar Delivery:** Informar local de coleta e entrega
- **Solicitar Frete:** Descrever um serviço personalizado (ir no chaveiro, buscar algo, etc.)
- **Gerenciar Créditos:** 
  - Visualizar saldo atual
  - Adicionar créditos via simulação de PIX
- **Visualizar Solicitações:** Ver histórico de todas as solicitações criadas
- **Acompanhar Status:** Ver status de cada solicitação (pendente, cotada, etc.)

### 3. Painel do Administrador
O administrador pode:
- **Visualizar Solicitações Pendentes:** Lista completa de todas as solicitações dos clientes
- **Calcular Distâncias:** Integração com Google Maps para calcular distâncias entre locais
- **Responder Solicitações:** 
  - Informar o valor do serviço em reais
  - Informar a distância estimada
- **Gerenciar Cotações:** Visualizar solicitações pendentes e cotadas
- **Dashboard:** Ver estatísticas de solicitações (pendentes, cotadas, total)

### 4. Sistema de Créditos
- Clientes compram créditos via simulação de PIX
- Créditos são usados para pagar os serviços
- Saldo é exibido em tempo real no painel
- Histórico de transações (pronto para implementação)

### 5. Sistema de Notificações
- **Notificação em Tempo Real:** Admin recebe notificação imediata quando cliente cria solicitação
- **Email Automático:** Simulação de envio de email (pronto para integração com Asaas ou SendGrid)
- Notificações contêm detalhes da solicitação (ID, tipo, locais)

### 6. Integração com Google Maps
- Componente de mapa integrado no painel do admin
- Cálculo automático de distâncias entre pontos
- Interface amigável para visualizar rotas

## Arquitetura Técnica

### Stack Tecnológico
- **Frontend:** React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express 4 + tRPC 11 + Node.js
- **Database:** MySQL/TiDB com Drizzle ORM
- **Autenticação:** JWT + Bcrypt
- **UI Components:** shadcn/ui
- **Testing:** Vitest

### Estrutura de Banco de Dados

#### Tabela: `users`
```sql
- id (PK)
- username (unique)
- passwordHash
- name
- email
- role (admin | user)
- creditBalance
- createdAt
- updatedAt
```

#### Tabela: `requests`
```sql
- id (PK)
- userId (FK)
- type (delivery | frete)
- pickupLocation
- deliveryLocation
- description (nullable)
- pickupCoordinates (nullable)
- deliveryCoordinates (nullable)
- status (pending | quoted | accepted | completed)
- quotedPrice (nullable)
- estimatedDistance (nullable)
- createdAt
- updatedAt
```

#### Tabela: `creditTransactions`
```sql
- id (PK)
- userId (FK)
- type (purchase | usage)
- amount
- description
- createdAt
```

## Fluxo de Uso

### Fluxo do Cliente
1. Fazer login com credenciais
2. Visualizar saldo de créditos
3. Criar solicitação de delivery ou frete
4. Aguardar resposta do admin
5. Ver cotação e aceitar serviço
6. Pagar com créditos da plataforma

### Fluxo do Admin
1. Fazer login com credenciais
2. Visualizar dashboard com estatísticas
3. Ver lista de solicitações pendentes
4. Clicar em solicitação para responder
5. Usar Google Maps para calcular distância
6. Informar valor do serviço
7. Enviar resposta ao cliente

## Testes

Todos os testes passam com sucesso:

```bash
pnpm test
```

**Testes Implementados:**
- Autenticação (hash de senha, JWT)
- Logout
- Criação de solicitações (delivery e frete)
- Visualização de solicitações pendentes
- Respostas do admin
- Validação de permissões

## Próximos Passos para Produção

### 1. Integração com Google Maps
- Obter API Key do Google Cloud
- Implementar Distance Matrix API
- Implementar Geocoding API

### 2. Integração com Email
- Configurar Asaas ou SendGrid
- Implementar templates de email
- Adicionar logs de email

### 3. Integração com Pagamento
- Integrar Asaas para pagamento de créditos
- Implementar webhook para confirmar pagamento
- Adicionar histórico de transações

### 4. Recursos Adicionais
- Painel do motoboy (em desenvolvimento)
- Rastreamento em tempo real
- Avaliações e comentários
- Suporte ao cliente
- Dashboard de analytics

### 5. Segurança
- Implementar rate limiting
- Adicionar CSRF protection
- Validar todas as entradas
- Implementar 2FA para admin
- Adicionar logging de auditoria

### 6. Performance
- Implementar cache
- Otimizar queries do banco
- Adicionar índices
- Implementar pagination

## Variáveis de Ambiente Necessárias

```env
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=seu_secret_key_aqui
VITE_APP_TITLE=Plataforma de Delivery
VITE_APP_LOGO=logo_url

# Opcional (para integração futura)
ASAAS_API_KEY=sua_chave_asaas
ADMIN_EMAIL=admin@example.com
GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

## Credenciais de Teste

| Tipo | Usuário | Senha |
|------|---------|-------|
| Admin | gael | 10203040 |
| Cliente | user1 | password123 |

## Suporte e Documentação

Para mais informações sobre como estender a plataforma, consulte:
- Template README: `/README.md`
- Schema do Banco: `/drizzle/schema.ts`
- Routers tRPC: `/server/routers.ts`
- Componentes UI: `/client/src/components/`

## Licença

MIT
