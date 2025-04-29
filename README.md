# MatchMetrics - Back-end

## Visão geral

## Autenticação

## Endpoints

### DELETE /users

#### Descrição

#### Exemplo de requisição

- Método HTTP: DELETE
- URL: /users/me
- Autenticação: Autenticada
- Body:
  - password: string (a senha do usuário atual)

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
