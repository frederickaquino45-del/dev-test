using System;
using System.IO;

namespace Application.Import.Models
{
    public class ClientImportJob
    {
        public Guid JobId { get; set; }
        public MemoryStream CsvContent { get; set; } = null!;
        public DateTime UploadedAt { get; set; }
    }
}
