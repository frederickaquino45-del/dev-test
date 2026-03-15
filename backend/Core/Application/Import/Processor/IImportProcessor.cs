using Application.Import.Models;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Import.Processor
{
    public interface IImportProcessor
    {
        Task<ClientImportResult> ProcessImportAsync(Stream csvStream, CancellationToken cancellationToken = default);
    }
}
