using Application.Import.Models;
using MediatR;
using System;

namespace Application.Client.Queries.ImportJobStatus
{
    public class ImportJobStatusQuery : IRequest<ClientImportJobStatus?>
    {
        public Guid JobId { get; set; }
    }
}
