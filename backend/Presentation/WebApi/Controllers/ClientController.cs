using Application.Client.Commands.CreateClient;
using Application.Client.Commands.ImportClients;
using Application.Client.Commands.UpdateClient;
using Application.Client.Queries.AllClientsQuery;
using Application.Client.Queries.ClientByIdQuery;
using Application.Client.Queries.ImportJobStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientController : ControllerBase
    {
        private const int MaxImportFileSizeBytes = 5 * 1024 * 1024; // 5 MB

        private readonly IMediator _mediator;

        public ClientController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
        public async Task<IActionResult> Create([FromBody] CreateClientCommandRequest request)
        {
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<AllClientsQueryResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get([FromQuery] string? document)
        {
            var result = await _mediator.Send(new AllClientsQueryRequest(document));
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ClientByIdQueryResponse), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetById([FromRoute] Guid id)
        {
            var response = await _mediator.Send(new ClientByIdQueryRequest { Id = id });

            return Ok(response);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Guid), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update([FromRoute] Guid id, [FromBody] UpdateClientCommandRequest request)
        {
            request.Id = id;
            var response = await _mediator.Send(request);
            return Ok(response);
        }

        [HttpPost("import")]
        [ProducesResponseType(StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Import([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Nenhum arquivo enviado.");

            var extension = Path.GetExtension(file.FileName);
            if (!string.Equals(extension, ".csv", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Apenas arquivos .csv são permitidos.");

            if (file.Length > MaxImportFileSizeBytes)
                return BadRequest("O arquivo excede o tamanho máximo de 5 MB.");

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var csvContent = memoryStream.ToArray();

            var jobId = await _mediator.Send(new ImportClientsCommand { CsvContent = csvContent });

            return AcceptedAtAction(nameof(ImportStatus), new { jobId }, new { jobId });
        }

        [HttpGet("import/{jobId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ImportStatus([FromRoute] Guid jobId)
        {
            var status = await _mediator.Send(new ImportJobStatusQuery { JobId = jobId });
            if (status == null)
                return NotFound();

            return Ok(status);
        }
    }
}
