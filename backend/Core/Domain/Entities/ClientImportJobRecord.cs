using System;

namespace Domain
{
    /// <summary>
    /// Registro de status de um job de importação de clientes (persistido no banco).
    /// State: 0=Pending, 1=Running, 2=Completed, 3=Failed.
    /// </summary>
    public class ClientImportJobRecord : BaseEntity
    {
        public int State { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? ResultJson { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
