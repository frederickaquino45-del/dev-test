using MediatR;
using System;

namespace Application.Client.Commands.ImportClients
{
    public class ImportClientsCommand : IRequest<Guid>
    {
        public byte[] CsvContent { get; set; } = Array.Empty<byte>();
    }
}
