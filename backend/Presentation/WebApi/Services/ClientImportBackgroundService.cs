using Application.Import.Models;
using Application.Import.Processor;
using Application.Import.Queue;
using Application.Import.Store;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace WebApi.Services
{
    public class ClientImportBackgroundService : BackgroundService
    {
        private readonly IClientImportQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;

        public ClientImportBackgroundService(
            IClientImportQueue queue,
            IServiceScopeFactory scopeFactory)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var job = await _queue.DequeueAsync(stoppingToken);

                    using (job.CsvContent)
                    using (var scope = _scopeFactory.CreateScope())
                    {
                        var statusStore = scope.ServiceProvider.GetRequiredService<IClientImportJobStatusStore>();
                        var importProcessor = scope.ServiceProvider.GetRequiredService<IImportProcessor>();

                        statusStore.SetStatus(job.JobId, new ClientImportJobStatus
                        {
                            JobId = job.JobId,
                            State = ClientImportJobState.Running
                        });

                        try
                        {
                            job.CsvContent.Position = 0;
                            var result = await importProcessor.ProcessImportAsync(job.CsvContent, stoppingToken);

                            statusStore.SetStatus(job.JobId, new ClientImportJobStatus
                            {
                                JobId = job.JobId,
                                State = ClientImportJobState.Completed,
                                ProcessedAt = DateTime.UtcNow,
                                Result = result
                            });
                        }
                        catch (Exception ex)
                        {
                            statusStore.SetStatus(job.JobId, new ClientImportJobStatus
                            {
                                JobId = job.JobId,
                                State = ClientImportJobState.Failed,
                                ProcessedAt = DateTime.UtcNow,
                                ErrorMessage = ex.Message
                            });
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
        }
    }
}
