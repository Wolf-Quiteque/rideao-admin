# RideAO — Painel de Administração

Next.js 16 (App Router, JavaScript) + Tailwind CSS 4 + Recharts. Centro de
operações da plataforma.

## Correr

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # produção
```

**Sem configuração corre em MODO DEMO**: login `admin@rideao.ao` / `rideao123`.
Os dados são simulados ao vivo — motoristas movem-se no mapa, corridas novas
aparecem e progridem, contadores atualizam sem refresh.

Para ligar ao Supabase real: copiar `.env.example` para `.env.local` e
preencher. A chave service role é usada apenas nos route handlers em
`app/api/**` (nunca chega ao browser) e cada mutação regista em `admin_actions`.

## Páginas

| Rota | Conteúdo |
|---|---|
| `/` | Dashboard: 6 métricas ao vivo + gráficos (corridas/dia, receita/dia) + atividade recente |
| `/live` | Mapa de operações: motoristas em movimento, corridas ativas, drawer de detalhe |
| `/rides` + `/rides/[id]` | Tabela com filtros/pesquisa · detalhe com timeline + cancelar corrida |
| `/drivers` + `/drivers/[id]` | Fila de verificação (Aprovar/Rejeitar) · tabela · detalhe + desativar |
| `/riders` + `/riders/[id]` | Passageiros: corridas, total gasto · detalhe + desativar |
| `/pricing` | Tarifas com pré-visualização ao vivo (os apps móveis leem esta tabela) |
| `/reports` | Corridas por dia da semana, horas de pico, receita mensal, top motoristas + export CSV |
| `/settings` | Conta admin + registo de auditoria |
