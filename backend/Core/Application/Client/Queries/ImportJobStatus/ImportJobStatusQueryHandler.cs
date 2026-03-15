using Application.Import.Models;
using Application.Import.Store;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Queries.ImportJobStatus
{
    public class ImportJobStatusQueryHandler : IRequestHandler<ImportJobStatusQuery, ClientImportJobStatus?>
    {
        private readonly IClientImportJobStatusStore _statusStore;

        public ImportJobStatusQueryHandler(IClientImportJobStatusStore statusStore)
        {
            _statusStore = statusStore;
        }

        public Task<ClientImportJobStatus?> Handle(ImportJobStatusQuery request, CancellationToken cancellationToken)
            => Task.FromResult(_statusStore.GetStatus(request.JobId));
    }
}
