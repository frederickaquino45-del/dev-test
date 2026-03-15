using System.Collections.Generic;

namespace Application.Import.Models
{
    public class ClientImportResult
    {
        public int TotalRows { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public IReadOnlyList<ClientImportRowError> Errors { get; set; } = new List<ClientImportRowError>();
    }

    public class ClientImportRowError
    {
        public int RowNumber { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
