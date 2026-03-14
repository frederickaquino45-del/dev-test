using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Queries.ClientByIdQuery
{
    public class ClientByIdQueryHandler : IRequestHandler<ClientByIdQueryRequest, ClientByIdQueryResponse>
    {
        private readonly IClientControlContext _context;

        public ClientByIdQueryHandler(IClientControlContext context)
        {
            _context = context;
        }

        public async Task<ClientByIdQueryResponse> Handle(ClientByIdQueryRequest request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .Where(x=>x.Id == request.Id)
                .Select(x => new ClientByIdQueryResponse
                {
                    Id = x.Id,
                    CreatedAt = x.CreatedAt,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    BirthDate = x.BirthDate,
                    Email = x.Email,
                    PhoneNumber = x.PhoneNumber,
                    DocumentNumber = x.DocumentNumber,
                    Address = new Models.AddressModel
                    {
                        PostalCode = x.Address.PostalCode,
                        AddressLine = x.Address.AddressLine,
                        Number = x.Address.Number,
                        Complement = x.Address.Complement,
                        Neighborhood = x.Address.Neighborhood,
                        City = x.Address.City,
                        State = x.Address.State
                    }
                })
                .FirstOrDefaultAsync();

            return client;
        }
    }
}
