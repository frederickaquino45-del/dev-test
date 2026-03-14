using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Queries.AllClientsQuery
{
    public class AllClientsQueryHandler : IRequestHandler<AllClientsQueryRequest, IEnumerable<AllClientsQueryResponse>>
    {
        private readonly IClientControlContext _context;

        public AllClientsQueryHandler(IClientControlContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AllClientsQueryResponse>> Handle(AllClientsQueryRequest request, CancellationToken cancellationToken)
        {
            var query = _context.Clients.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Document))
                query = query.Where(x => x.DocumentNumber == request.Document);
            
            var clients = await query
                .Select(x => new AllClientsQueryResponse
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
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ToListAsync(cancellationToken);

            return clients;
        }
    }
}
