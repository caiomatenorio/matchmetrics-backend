# MatchMetrics - Back-end

## Visão geral

## Autenticação

## Endpoints

### - DELETE /users

#### Descrição

#### Exemplo de requisição

- Método HTTP: DELETE
- URL: /users/me
- Autenticação: Autenticada
- Body:
  - password: string (a senha do usuário atual)
 
#### Respostas

### - POST /admin/promote-user/:email

#### Descrição

#### Exemplo de requisição

- Método HTTP: POST
- URL: /admin/promote-user/:email
- Autenticação: Administrador
- Parametro:
  - email: string (e-mail do usuário)
  - password: string (senha do usuário)
 
#### Respostas

### - POST /log-in

#### Descrição

#### Exemplo de requisição

- Método HTTP: POST
- URL: /log-in
- Autenticação: Público
- Body:
  - e-mail: string (e-mail do usuário inválido)
  - password: string (senha do usuário inválido)

#### Respostas

### - GET /auth/status

#### Descrição

#### Exemplo de requisição

- Método HTTP: GET
- URL: /auth/status
- Autenticação: Público

#### Respostas

### - GET /whoami

#### Descrição

#### Exemplo de requisição
- Método HTTP: GET
- URL: /whoami
- Autenticação: Autenticada

#### Respostas

### - POST /log-out

#### Descrição

#### Exemplo de requisição
- Método HTTP: POST
- URL: /log-out
- Autenticação: Autenticada

### - POST /sign-up

#### Descrição

#### Exemplo de requisição

- Método HTTP: POST
- Autenticação: Público
- URL: /sign-up
- Body:
   - e-mail: string (e-mail do usuário)
   - password: string (mínimo de 8 caracteres, máximo de 25 caracteres e deve conter uma letra maiúscula, uma letra minúscula, e um       caracter especial)

#### Respostas

### - GET /championship

#### Descrição

#### Exemplo de requisição

- Método HTTP: GET
- Autenticação: Público
- URL: /championship
- Queries:
   - search: string (Nome do campeonato que vai ser pesquisado pelo usuário.)
   - year: number (Ano do campeonato que vai ser pesquisado pelo usuário.)
   - country: string (País do campeonato que vai ser pesquisado pelo usuário.)
   - favorited: enum (Se o campeonato pesquisado é ou não favorito do usuário.)
   - page: number (Página onde o campeonato pesquisado pelo o usuário está.)
 
#### Respostas

### - GET /championship/:slug

#### Descrição

#### Exemplo de requisição

- Método HTTP: GET
- Autenticação: Público
- URL: /championship/:slug/
- Parametros:
  - slug: string

#### Respostas

### GET championship/:slug/teams

#### Descrição

#### Exemplo de requisição

- Método HTTP: GET
- Autenticação: Público
- URL: championship/:slug/teams
- Parametros:
  - slug: string
- Queries:
  - search: string (time que vai ser pesquisado pelo usuário.)
  - page: string (Página onde o time que vai ser pesquisado pelo usuário está.)

#### Respostas

### GET championship/:slug/matches

#### Descrição

#### Exemplo de requisição

- Método HTTP: GET
- Autenticação: Público
- URL: championship/:slug/matches
- Parametros:
  - slug: string
- Queries:
  - search: string (Nome dos dois times que estão na partida que o usuário deseja encontrar.)
  - minDate: date (Data minima para a partida desejada pelo usuário ter acontecido.)
  - maxDate: date (Data máxima para a partida desejada pelo usuário ter acontecido.)
  - page: number (Página que a partida desejada pelo usuário está)

#### Respostas

### POST /championship

#### Descrição

#### Exemplo de requisição

- Método HTTP: POST
- Autenticação: administrador
- URL: /championship
- Body:
 - name: string (Nome do campeonato que vai ser criado. Minimo de 3 letras e máximo de 25)
 - slug: string
 - season: string (Temporada do campeonato que vai ser criado. Pode ser escrito em "YYYY" ou "YYYY-YYYY". Exemplo: 2023 ou 2023-2024)
 - countryslug: string (País do campeonato que vai ser criado.)

#### Respostas

## Tipos de erro

### E000 - UNKNOWN

Este código indica que ocorreu um erro desconhecido no servidor.

### E001 - EMAIL_ALREADY_IN_USE

Este código indica que o email informado já está em uso por outro usuário.

### E002 - VALIDATION_ERROR

Este código indica que ocorreu um erro de validação nos parâmetros, queries ou corpo inseridos na requisição.

### E003 - USER_DOES_NOT_EXIST

Este código indica que o usuário informado não existe no banco de dados.

### E004 - ROLE_UNAUTHORIZED

Este código indica que o cargo informado é inferior ao necessário para realizar a ação.

### E005 - INVALID_CREDENTIALS

Este código indica que as credenciais do usuário informadas não são válidas.

### E006 - PARAMETER_REQUIRES_AUTHENTICATION

Este código indica que o parâmetro informado requer autenticação para ser utilizado.

### E007 - USER_ALREADY_HAS_THIS_ROLE

Este código indica que o usuário informado já tem o cargo informado.

### E008 - ROOT_CREDENTIALS_NOT_DEFINED

Este código indica que as credenciais do usuário root (primeiro administrador) não estão definidas nas variáveis de ambiente.

### E009 - ROOT_CREDENTIALS_CONFLICT

Este código indica que as credenciais do usuário root (primeiro administrador) estão em conflito com as de outro usuário.

### E010 - CHAMPIONSHIP_NOT_FOUND

Este código indica que o campeonato não existe no banco de dados.

### E011 - CHAMPIONSHIP_ALREADY_EXISTS 

Este código indica que a slug do campeonato já está em uso por outro campeonato.

### E012 - COUNTRY_NOT_FOUND

Este código indica que o país não existe no banco de dados.
