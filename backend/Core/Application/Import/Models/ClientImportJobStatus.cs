using System;

namespace Application.Import.Models
{
    public class ClientImportJobStatus
    {
        public Guid JobId { get; set; }
        public ClientImportJobState State { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public ClientImportResult? Result { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public enum ClientImportJobState
    {
        Pending,
        Running,
        Completed,
        Failed
    }
}
