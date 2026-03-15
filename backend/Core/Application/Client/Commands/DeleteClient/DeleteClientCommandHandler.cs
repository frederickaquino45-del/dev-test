using Application.Common.Exceptions;
using Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Commands.DeleteClient
{
    public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommandRequest>
    {
        private readonly IClientControlContext _context;

        public DeleteClientCommandHandler(IClientControlContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteClientCommandRequest request, CancellationToken cancellationToken)
        {
            var client = await _context.Clients
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (client == null)
                throw new NotFoundException("Client", request.Id);

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
