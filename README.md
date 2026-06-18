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

## Branches principais

- `original` - Branch com a versão original do projeto.
- `main` - Branch com as correções propostas.

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

---

## Problemas Identificados, Soluções e Testes

Durante a análise do código-fonte da HeroForce API foram identificados **6 code smells** distribuídos nos módulos de autenticação, usuários e projetos. A seguir, cada problema é descrito com sua respectiva solução e os testes unitários criados para cobrir os comportamentos críticos dos serviços.

### Problemas e Soluções

#### 1. DTO Inline (Primitive Obsession)

**Problema:** os métodos `register` (AuthService) e `create` (UserService) recebem objetos anônimos inline como parâmetro, sem uma abstração tipada e reutilizável. Isso dificulta validação, documentação automática via Swagger e reuso entre camadas.

**Solução:** criar classes de DTO dedicadas — `CreateUserDto` e `RegisterDto` — decoradas com `class-validator` e `@ApiProperty`, centralizando a validação e tornando a API autodocumentada.

```typescript
// Antes
async create(data: { name: string; email: string; password: string; role: UserRole }) { ... }

// Depois
async create(dto: CreateUserDto) { ... }
```

---

#### 2. Magic Number

**Problema:** o número de rounds do `bcrypt` está definido diretamente na chamada da função como o valor literal `10`, sem nenhum contexto semântico.

```typescript
// Antes
const hashed = await bcrypt.hash(password, 10);
```

**Solução:** extrair o valor para uma constante nomeada, preferencialmente em um arquivo de configuração ou como variável de ambiente.

```typescript
// Depois
const BCRYPT_SALT_ROUNDS = 10;
const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
```

---

#### 3. Uso de `any` (Type Abuse)

**Problema:** o tipo `any` é utilizado em pontos críticos do código, eliminando a verificação estática de tipos que é a principal vantagem do TypeScript e aumentando o risco de erros em tempo de execução.

**Solução:** substituir todos os usos de `any` por tipos explícitos — interfaces, tipos utilitários (`Partial<T>`, `Pick<T>`) ou tipos gerados pelo TypeORM/NestJS. Habilitar `"noImplicitAny": true` no `tsconfig.json` para prevenir regressões.

---

#### 4. Ausência de Tratamento de Erros Padronizado

**Problema:** os serviços lançam exceções HTTP diretamente com mensagens de erro como strings literais espalhadas pelo código, dificultando manutenção e internacionalização.

```typescript
// Antes
throw new NotFoundException('User not found');
throw new ConflictException('Email already in use');
```

**Solução:** centralizar as mensagens em um arquivo de constantes e, idealmente, criar um `ExceptionFilter` global que padronize o envelope de erro retornado ao cliente.

```typescript
// constants/error-messages.ts
export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  EMAIL_IN_USE: 'Email already in use',
};

// Uso
throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
```

---

#### 5. Nomes de Variáveis Pouco Expressivos

**Problema:** variáveis intermediárias como `rest` são nomeadas de forma genérica, sem comunicar sua intenção real (dados do projeto sem o campo `userId`).

```typescript
// Antes
const { userId, ...rest } = dto;
await this.repo.save(rest);
```

**Solução:** renomear para nomes que expressem a intenção do dado.

```typescript
// Depois
const { userId, ...projectData } = dto;
await this.repo.save(projectData);
```

---

#### 6. Regra de Autorização Espalhada nos Services

**Problema:** a lógica de verificação de permissões está implementada diretamente dentro dos métodos de serviço (`findById`, `delete` do ProjectService), misturando responsabilidades de negócio com controle de acesso.

**Solução:** extrair a lógica de autorização para um `Guard` dedicado ou uma camada de política (`Policy`), mantendo os services focados exclusivamente nas regras de negócio. Em NestJS, isso pode ser implementado com `CanActivate` ou com uma biblioteca como `casl`.

```typescript
// Antes: autorização dentro do service
if (project.user.id !== sessionUser.sub && sessionUser.role !== UserRole.ADMIN) {
  throw new ForbiddenException();
}

// Depois: Guard ou Policy dedicado
@UseGuards(ProjectOwnerGuard)
async findById(id: string) { ... }
```

---

### Testes Criados

Foram criados testes unitários com Jest para os três serviços principais da aplicação, cobrindo os fluxos de sucesso e os casos de erro esperados.

#### UserService (`user.service.spec.ts`)

| Método     | Cenário testado                                              |
|------------|--------------------------------------------------------------|
| `findAll`  | Retorna usuários paginados delegando ao repositório          |
| `findById` | Retorna o usuário quando encontrado                          |
| `findById` | Lança `NotFoundException` quando o usuário não existe        |
| `create`   | Hasheia a senha com bcrypt e salva o novo usuário            |
| `create`   | Lança `ConflictException` quando o e-mail já está em uso     |
| `update`   | Atualiza o usuário e retorna o ID                            |
| `update`   | Lança `NotFoundException` quando o usuário não existe        |
| `delete`   | Deleta o usuário quando encontrado                           |
| `delete`   | Lança `NotFoundException` quando o usuário não existe        |

#### ProjectService (`project.service.spec.ts`)

| Método     | Cenário testado                                                        |
|------------|------------------------------------------------------------------------|
| `findAll`  | Delega para o repositório com os filtros fornecidos                    |
| `findById` | Retorna o projeto quando solicitado por um admin                       |
| `findById` | Retorna o projeto quando solicitado pelo próprio proprietário          |
| `findById` | Lança `ForbiddenException` quando um herói tenta acessar projeto alheio|
| `findById` | Lança `NotFoundException` quando o projeto não existe                  |
| `save`     | Salva e retorna o ID do projeto                                        |
| `save`     | Salva sem usuário quando `userId` não é fornecido                      |
| `update`   | Atualiza e retorna o ID do projeto                                     |
| `update`   | Lança `NotFoundException` quando o projeto atualizado não é encontrado |
| `delete`   | Deleta o projeto quando solicitado por um admin                        |
| `delete`   | Lança `ForbiddenException` quando um não proprietário tenta deletar    |

#### AuthService (`auth.service.spec.ts`)

| Método  | Cenário testado                                                     |
|---------|---------------------------------------------------------------------|
| `login` | Retorna o access token e os dados do usuário autenticado            |
| `login` | Lança `UnauthorizedException` quando o usuário não é encontrado     |
| `login` | Lança `UnauthorizedException` quando a senha está incorreta         |

Todos os testes utilizam mocks isolados dos repositórios e serviços dependentes, garantindo que cada unidade seja testada de forma independente, sem necessidade de banco de dados ou rede.
