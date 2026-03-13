using Application.Client.Queries.ClientByIdQuery;
using MediatR;

namespace Application.Client.Queries.ClientByDocumentoQuery
{
    public class ClientByDocumentQueryRequest(string document) : IRequest<ClientByDocumentQueryResponse>
    {
        public string Document { get; set; } = document;
    }
}
