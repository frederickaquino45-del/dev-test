using Application.Import.Models;
using System;

namespace Application.Import.Store
{
    public interface IClientImportJobStatusStore
    {
        void SetStatus(Guid jobId, ClientImportJobStatus status);
        ClientImportJobStatus? GetStatus(Guid jobId);
    }
}
