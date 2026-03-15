using Application.Import.Models;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Import.Queue
{
    public interface IClientImportQueue
    {
        ValueTask EnqueueAsync(ClientImportJob job, CancellationToken cancellationToken = default);
        ValueTask<ClientImportJob> DequeueAsync(CancellationToken cancellationToken = default);
    }
}
