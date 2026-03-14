using MediatR;
using System.Collections.Generic;
using System.Text;

namespace Application.Client.Queries.AllClientsQuery
{
    public class AllClientsQueryRequest(string? document) : IRequest<IEnumerable<AllClientsQueryResponse>>
    {
        public string Document { get; set; } = document;
    }
}
