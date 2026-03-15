using Application.Import.Models;
using Application.Import.Store;
using Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Text.Json;

namespace Persistence.Services
{
    public class ClientImportJobStatusStore : IClientImportJobStatusStore
    {
        private readonly ClientControlContext _context;
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        public ClientImportJobStatusStore(ClientControlContext context)
        {
            _context = context;
        }

        public void SetStatus(Guid jobId, ClientImportJobStatus status)
        {
            var record = _context.ClientImportJobRecords.Find(jobId);
            if (record == null)
            {
                record = new ClientImportJobRecord
                {
                    Id = jobId,
                    State = (int)status.State,
                    ProcessedAt = status.ProcessedAt,
                    ResultJson = status.Result != null ? JsonSerializer.Serialize(status.Result, JsonOptions) : null,
                    ErrorMessage = status.ErrorMessage
                };
                _context.ClientImportJobRecords.Add(record);
            }
            else
            {
                record.State = (int)status.State;
                record.ProcessedAt = status.ProcessedAt;
                record.ResultJson = status.Result != null ? JsonSerializer.Serialize(status.Result, JsonOptions) : null;
                record.ErrorMessage = status.ErrorMessage;
                _context.Entry(record).State = EntityState.Modified;
            }
            _context.SaveChanges();
        }

        public ClientImportJobStatus? GetStatus(Guid jobId)
        {
            var record = _context.ClientImportJobRecords.Find(jobId);
            if (record == null)
                return null;

            ClientImportResult? result = null;
            if (!string.IsNullOrEmpty(record.ResultJson))
            {
                result = JsonSerializer.Deserialize<ClientImportResult>(record.ResultJson, JsonOptions);
            }

            return new ClientImportJobStatus
            {
                JobId = record.Id,
                State = (ClientImportJobState)record.State,
                ProcessedAt = record.ProcessedAt,
                Result = result,
                ErrorMessage = record.ErrorMessage
            };
        }
    }
}
