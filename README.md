# HeroForce API

Backend do portal **HeroForce** — sistema de gestão e vendas de projetos heroicos. Construído com NestJS, TypeORM e PostgreSQL.

## Tecnologias

- **NestJS** — framework Node.js
- **TypeORM** + **PostgreSQL** — banco de dados relacional
- **JWT** — autenticação stateless
- **Swagger** — documentação interativa da API
- **Docker** — ambiente containerizado

## Funcionalidades

- Cadastro e autenticação de heróis (usuários) com JWT
- CRUD de projetos com metas e status de andamento
- Controle de acesso por papel: `admin` e `hero`
- Documentação interativa em `/api/docs`
- Rate limiting, headers de segurança (Helmet) e CORS configuráveis

## Pré-requisitos

- Node.js 22+ **ou** Docker + Docker Compose

## Executando com Docker (recomendado)

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd backendinn

# 2. Configure as variáveis de ambiente
cp .env.example .env
# edite o .env com suas configurações

# 3. Suba a API e o banco
docker compose up --build
```

A API estará disponível em `http://localhost:3000`.

## Executando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Inicie em modo desenvolvimento
npm run start:dev
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz com as seguintes variáveis:

```env
# Servidor
PORT=3000
CORS_ORIGIN=*

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=heroforce

# JWT
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=1d
```

## Endpoints

| Método | Rota           | Descrição                    | Auth    |
|--------|----------------|------------------------------|---------|
| POST   | /auth/register | Cadastrar herói              | Público |
| POST   | /auth/login    | Autenticar e obter token JWT | Público |
| GET    | /user          | Listar heróis                | JWT     |
| GET    | /user/:id      | Buscar herói por ID          | JWT     |
| PUT    | /user/:id      | Atualizar herói              | JWT     |
| DELETE | /user/:id      | Remover herói                | JWT     |
| GET    | /project       | Listar projetos              | JWT     |
| GET    | /project/:id   | Buscar projeto por ID        | JWT     |
| POST   | /project       | Criar projeto                | Admin   |
| PUT    | /project/:id   | Atualizar projeto            | Admin   |
| DELETE | /project/:id   | Remover projeto              | Admin   |
| GET    | /health        | Health check                 | Público |

Documentação completa e interativa: `http://localhost:3000/api/docs`

## Estrutura do projeto

```
src/
├── controllers/   # Camada HTTP (rotas)
├── services/      # Regras de negócio
├── repositories/  # Acesso ao banco
├── models/        # Entidades TypeORM
├── dtos/          # Validação de entrada
├── guards/        # JWT e Admin guard
├── filters/       # Exception filter global
├── decorators/    # SessionUser decorator
└── modules/       # Configuração dos módulos NestJS
```

## Scripts

```bash
npm run start:dev   # desenvolvimento com hot-reload
npm run build       # compilar para produção
npm run start:prod  # iniciar build de produção
npm run test        # rodar testes
npm run test:cov    # cobertura de testes
```

## Decisões Técnicas

### Arquitetura em camadas
O projeto foi construido utilizando uma arquitetura em camadas com separação clara de responsabilidades: 
- **Controllers** cuidam apenas do HTTP (rotas, validação de entrada, status codes);
- **Services** concentram as regras de negócio; 
- **Repositories** abstraem o acesso ao banco;
- **Models** definem o schema;

Isso facilita a manutenção, torna cada parte testável de forma isolada e permite trocar implementações (ex: banco de dados) sem afetar as outras camadas.

### Stack principal
**NestJS**, **TypeORM** e **PostgreSQL** foram adotados como requisito obrigatório do projeto. O NestJS fornece a estrutura para a construção da API, o TypeORM abstrai as queries SQL, e o PostgreSQL toda a parte de banco de dados.
- **JWT**: autenticação sem sessão no servidor, o token carrega as propriedades `sub`, `email` e `role`, evitando consultas extras ao banco por requisição.
- **Guards compostos** (`JwtAuthGuard` + `AdminGuard`): separam autenticação de autorização, permitindo aplicar cada proteção de forma declarativa e independente por rota.
- **Dtos**: validação e transformação de entrada centralizada nos DTOs, sem lógica de validação espalhada nos controllers ou services.
- **Swagger automático**: documentação gerada a partir dos decorators dos DTOs e controllers, sempre sincronizada com o código.
- **Helmet**: headers de segurança HTTP e rate limiting (60 req/60s) como camada extra de proteção sem lógica customizada.
- **Tipo JSONB para Goals**: metas armazenadas como array JSON dentro do projeto. Por serem sempre acessadas junto ao projeto e sem necessidade de queries independentes, JSONB evita uma tabela extra e JOIN adicional.

## Sugestões de Melhoria

1. **Padronização de respostas**: criar um interceptor global que envolva todos os retornos em um envelope `{ data, meta, error }` — atualmente cada rota retorna formatos distintos, o que complica o tratamento no cliente.
2. **Rotas de indicadores**: endpoints como `GET /project/stats` (projetos agrupados por status) e `GET /user/:id/stats` (metas concluídas vs. pendentes) para alimentar dashboards e gráficos sem processamento no front-end.
3. **Filtro de exceções globalizados**: padronizar todos os erros HTTP com estrutura consistente, em vez de depender do comportamento padrão do NestJS.
4. **Testes automatizados**: adicionar testes unitários nos services e testes de integração nos controllers.
5. **Utilizar migrations em vez de `synchronize`**: substituir `synchronize: false` por migrations TypeORM para controlar alterações no schema com rastreabilidade.
6. **Endpoint de reset de senha**: fluxo de recuperação via e-mail com token temporário, já que hoje não há como recuperar acesso sem intervenção direta no banco.
