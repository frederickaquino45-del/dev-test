# TAREFA 1

# Observação sobre a implementação da rota de filtragem por documento

Durante a implementação da tarefa **"Filtragem de Clientes por Documento"**, foi solicitado criar a rota:
GET /clients?document={numeroDocumento}

Inicialmente, uma alternativa comum seria criar um endpoint separado como:
GET /clients/{document}

ou

GET /clients/by-document?document={numeroDocumento}

No entanto, optei por **não seguir essas abordagens**, pelos motivos abaixo.

---

## Conflito de rotas e impacto no Swagger

O projeto já possui o endpoint:
GET /clients/{id}

Se fosse criado um endpoint como:
GET /clients/{document}

isso geraria **ambiguidade de rota no ASP.NET**, pois ambos seriam resolvidos como parâmetros de rota.

Além disso, essa abordagem costuma causar problemas na geração da documentação automática via Swagger/OpenAPI, pois o Swagger pode não conseguir diferenciar corretamente os endpoints ou gerar documentação inconsistente.

---

## Interpretação da tarefa

A descrição da tarefa especificava explicitamente o formato:
GET /clients?document={numeroDocumento}

Isso indica que o filtro deveria ser aplicado **via query parameter**, e não por rota.

Por esse motivo, implementei a solução utilizando **um único endpoint `/clients`**, com um parâmetro opcional `document`.