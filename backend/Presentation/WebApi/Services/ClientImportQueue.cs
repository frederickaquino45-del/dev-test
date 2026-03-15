using System.Threading;
using System.Threading.Tasks;
using System.Threading.Channels;
using Application.Import.Queue;
using Application.Import.Models;

namespace WebApi.Services
{
    public class ClientImportQueue : IClientImportQueue
    {
        private readonly Channel<ClientImportJob> _channel = Channel.CreateBounded<ClientImportJob>(
            new BoundedChannelOptions(10)
            {
                FullMode = BoundedChannelFullMode.Wait
            });

        public ValueTask EnqueueAsync(ClientImportJob job, CancellationToken cancellationToken = default)
            => _channel.Writer.WriteAsync(job, cancellationToken);

        public ValueTask<ClientImportJob> DequeueAsync(CancellationToken cancellationToken = default)
            => _channel.Reader.ReadAsync(cancellationToken);
    }
}
