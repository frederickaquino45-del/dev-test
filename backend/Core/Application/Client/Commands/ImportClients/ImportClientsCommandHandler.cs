using Application.Import.Models;
using Application.Import.Queue;
using Application.Import.Store;
using MediatR;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Client.Commands.ImportClients
{
    public class ImportClientsCommandHandler : IRequestHandler<ImportClientsCommand, Guid>
    {
        private readonly IClientImportQueue _queue;
        private readonly IClientImportJobStatusStore _statusStore;

        public ImportClientsCommandHandler(
            IClientImportQueue queue,
            IClientImportJobStatusStore statusStore)
        {
            _queue = queue;
            _statusStore = statusStore;
        }

        public async Task<Guid> Handle(ImportClientsCommand request, CancellationToken cancellationToken)
        {
            var jobId = Guid.NewGuid();
            var job = new ClientImportJob
            {
                JobId = jobId,
                CsvContent = new MemoryStream(request.CsvContent),
                UploadedAt = DateTime.UtcNow
            };

            _statusStore.SetStatus(jobId, new ClientImportJobStatus
            {
                JobId = jobId,
                State = ClientImportJobState.Pending
            });

            await _queue.EnqueueAsync(job, cancellationToken);
            return jobId;
        }
    }
}
