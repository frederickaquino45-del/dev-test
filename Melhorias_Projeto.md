# Melhorias do Projeto

Este documento descreve as melhorias implementadas no projeto, abrangendo o frontend e o backend quando aplicável.

---

## 1. Aplicação de máscaras nos inputs

### Objetivo
Padronizar a entrada de dados e melhorar a experiência do usuário com formatação visual em tempo real (documento, telefone, CEP, data de nascimento).

### Implementação

- **Helpers de formatação** (`frontend/src/helpers/format.ts`):
  - **Documento (CPF/CNPJ):** máscara `###.###.###-##` (CPF) ou `##.###.###/####-##` (CNPJ), com exibição na listagem e no formulário.
  - **Telefone:** formatação `(XX) XXXXX-XXXX` ou `(XX) XXXX-XXXX` conforme quantidade de dígitos.
  - **CEP:** máscara `#####-###`.
  - **Data de nascimento:** exibição em `DD/MM/YYYY` e conversão para `YYYY-MM-DD` no envio à API.
  - **Função genérica `toMask`:** aplica máscaras no padrão `#` para dígitos.
  - **`unmask`:** remove caracteres não numéricos para envio à API ou validação.

- **Componente `InputMask`** (`frontend/src/components/form/InputMask.tsx`):
  - Encapsula a biblioteca `react-input-mask` para uso nos formulários.

- **Uso no formulário de cliente** (`ClientForm.tsx`):
  - **Documento:** máscara `###.###.###-##`.
  - **CEP:** máscara `#####-###`.
  - As máscaras são aplicadas nos campos do endereço e na listagem de clientes (telefone, documento, data de nascimento).

Com isso, o usuário visualiza os dados já formatados e o sistema envia apenas os dígitos quando necessário (por exemplo, documento e CEP sem pontuação).

---

## 2. Implementação do ViaCEP no endereço do cliente

### Objetivo
Preencher automaticamente logradouro, bairro, cidade e estado quando o usuário informar um CEP válido, reduzindo erros e tempo de preenchimento.

### Implementação

- **Serviço ViaCEP** (`frontend/src/services/ViaCepService.ts`):
  - Método `getAddressByPostalCode(postalCode)` que consulta a API pública `https://viacep.com.br/ws/{cep}/json/`.
  - Valida CEP com 8 dígitos (apenas números).
  - Retorna `null` em caso de CEP inválido ou não encontrado.
  - Mapeia a resposta para: `logradouro`, `bairro`, `localidade`, `uf`, `complemento`, etc.

- **Constante de estados** (`frontend/src/constants/BrazilStates.ts`):
  - Lista dos 27 estados brasileiros (sigla e nome) para uso no select de UF, alinhado aos retornos do ViaCEP.

- **Integração no formulário de cliente** (`ClientForm.tsx`):
  - No campo **CEP**, ao sair do campo (onBlur) ou ao completar 8 dígitos, é feita a chamada ao `ViaCepService.getAddressByPostalCode`.
  - Em caso de sucesso, são preenchidos automaticamente:
    - **Endereço** (logradouro)
    - **Bairro**
    - **Cidade** (localidade)
    - **Estado** (UF)
  - Evita-se nova requisição quando o CEP não mudou (controle com `lastPostalCodeRef`).
  - O número e o complemento continuam sendo preenchidos manualmente pelo usuário.

Assim, o cadastro de endereço fica mais rápido e consistente com a base do Correios.

---

## 3. Implementação do método de deletar cliente

### Objetivo
Permitir a exclusão de clientes com confirmação explícita para evitar remoções acidentais.

### Backend (CQRS)

- **Comando** `DeleteClientCommandRequest` (`Application.Client.Commands.DeleteClient`):
  - Contém o `Id` (Guid) do cliente.
  - Implementa `IRequest` (MediatR).

- **Handler** `DeleteClientCommandHandler`:
  - Busca o cliente no banco; se não existir, lança `NotFoundException`.
  - Remove o cliente e persiste com `SaveChangesAsync`.

- **Validador** `DeleteClientCommandValidator`:
  - Regra: `Id` obrigatório (FluentValidation).

- **API** (`ClientController`):
  - Endpoint `DELETE api/client/{id}` retornando **204 No Content**.

### Frontend

- **ClientService** (`frontend/src/services/ClientService.ts`):
  - Método `delete(id: string)` que chama o endpoint de exclusão.

- **Listagem de clientes** (`ClientListing.tsx`):
  - **Botão de lixeira** (ícone `HiOutlineTrash`) na coluna "Ações" de cada linha.
  - **Modal de confirmação:**
    - Título: "Excluir cliente?"
    - Texto informando o nome do cliente e que a ação é irreversível.
    - Campo onde o usuário deve digitar exatamente **"deletar"** (case insensitive) para habilitar o botão "Excluir".
    - O input **não permite colar nem copiar** (`onPaste` e `onCopy` com `preventDefault`), garantindo que a confirmação seja digitada.
  - Após exclusão com sucesso: exibe toast de sucesso, fecha o modal e **recarrega a página** para atualizar a tabela sem o cliente removido.

O fluxo garante confirmação consciente e atualização imediata da lista após a deleção.

---

## 4. Página de erro Unauthorized (403)

### Objetivo
Exibir uma tela clara quando o usuário não tem permissão para acessar um recurso (acesso negado), em vez de apenas um erro genérico.

### Implementação

- **Página 403** (`frontend/src/pages/errors/Page403.tsx`):
  - Título da página: "Acesso negado" (via `Helmet`).
  - Ícone de cadeado (`HiOutlineLockClosed`) em destaque.
  - Mensagem explicando que o usuário não tem autorização e sugerindo contato com o administrador.
  - Botão **"Retornar ao site"** que redireciona de forma contextual:
    - Se o usuário for **Operador**, volta para a listagem de clientes.
    - Caso contrário, volta para o **Dashboard**.

- **Rota** (`frontend/src/routes.tsx`):
  - Rota **`/403`** configurada com `AuthLayout`, tendo a `Page403` como componente.
  - `errorElement` da rota continua sendo a `Page500` para erros não tratados.

- **Constantes** (`frontend/src/constants.ts`):
  - `NAVIGATION_PATH.ERROR_PAGES.PAGE_403` definido como `"/403"` para uso centralizado.

- **AuthGuard** (`frontend/src/components/guards/AuthGuard.tsx`):
  - Quando o usuário está autenticado mas **não pertence** a nenhum dos perfis permitidos para a rota (`belongsTo`), é feito redirecionamento para `NAVIGATION_PATH.ERROR_PAGES.PAGE_403` (página 403).

- **Axios** (`frontend/src/utils/axios.ts`):
  - No interceptor de resposta, quando a API retorna status **403**, a promise é rejeitada com uma mensagem de "Recurso proibido", permitindo que a aplicação trate o erro (por exemplo, exibindo toast ou redirecionando para a página 403, conforme a regra de negócio).

Com isso, acessos não autorizados são tratados de forma consistente e o usuário recebe feedback claro e um caminho para voltar à área permitida.

---

## Resumo

| Melhoria                    | Área        | Principais arquivos / conceitos                          |
|----------------------------|-------------|----------------------------------------------------------|
| Máscaras nos inputs        | Frontend    | `format.ts`, `InputMask.tsx`, `TextFormField`, `ClientForm` |
| ViaCEP no endereço         | Frontend    | `ViaCepService.ts`, `BrazilStates.ts`, `ClientForm.tsx`  |
| Deletar cliente            | Back + Front| Command/Handler/Validator DeleteClient, `ClientController`, `ClientService`, `ClientListing` (modal + botão lixeira) |
| Página 403 (Unauthorized)  | Frontend    | `Page403.tsx`, rotas, `AuthGuard`, constantes, axios    |
