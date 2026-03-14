using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Commands.UpdateClient
{
    public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommandRequest, Guid>
    {
        private readonly IClientControlContext _context;

        public UpdateClientCommandHandler(IClientControlContext context)
        {
            _context = context;
        }

        public async Task<Guid> Handle(UpdateClientCommandRequest request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (client == null)
                throw new NotFoundException("Client not exist", request.Id);

            if (await _context.Clients.AnyAsync(x => x.DocumentNumber == request.DocumentNumber && x.Id != request.Id, cancellationToken))
                throw new BadRequestException("Document already exists");

            var address = new Address(
                request.Address.PostalCode,
                request.Address.AddressLine,
                request.Address.Number,
                request.Address.Complement,
                request.Address.Neighborhood,
                request.Address.City,
                request.Address.State);

            client.Update(
                request.FirstName,
                request.LastName,
                request.PhoneNumber,
                request.Email,
                request.DocumentNumber,
                address);

            await _context.SaveChangesAsync(cancellationToken);

            return client.Id;
        }
    }
}
