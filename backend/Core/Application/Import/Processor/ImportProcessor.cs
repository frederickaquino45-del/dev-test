using Application.Client.Commands.CreateClient;
using Application.Client.Models;
using Application.Common.Exceptions;
using Application.Import.Models;
using CsvHelper;
using CsvHelper.Configuration;
using MediatR;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Import.Processor
{
    public class ImportProcessor : IImportProcessor
    {
        private readonly IMediator _mediator;

        public ImportProcessor(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task<ClientImportResult> ProcessImportAsync(Stream csvStream, CancellationToken cancellationToken = default)
        {
            var result = new ClientImportResult();
            var errors = new List<ClientImportRowError>();

            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null,
                HeaderValidated = null
            };

            using var reader = new StreamReader(csvStream);
            using var csv = new CsvReader(reader, config);

            csv.Read();
            csv.ReadHeader();
            var rowNumber = 1;

            while (await csv.ReadAsync())
            {
                rowNumber++;
                cancellationToken.ThrowIfCancellationRequested();

                string documentNumber = "";
                try
                {
                    var row = csv.GetRecord<ClientCsvRowDto>();
                    if (row == null)
                    {
                        errors.Add(new ClientImportRowError { RowNumber = rowNumber, Message = "Linha vazia ou inválida." });
                        result.FailureCount++;
                        continue;
                    }

                    documentNumber = row.DocumentNumber?.Trim() ?? "";

                    if (!TryParseRow(row, rowNumber, errors, out var request))
                    {
                        result.FailureCount++;
                        continue;
                    }

                    await _mediator.Send(request, cancellationToken);
                    result.SuccessCount++;
                }
                catch (BadRequestException ex)
                {
                    errors.Add(new ClientImportRowError { RowNumber = rowNumber, DocumentNumber = documentNumber, Message = ex.Message });
                    result.FailureCount++;
                }
                catch (Exception ex)
                {
                    errors.Add(new ClientImportRowError { RowNumber = rowNumber, DocumentNumber = documentNumber, Message = ex.Message });
                    result.FailureCount++;
                }
            }

            result.TotalRows = rowNumber - 1;
            result.Errors = errors;
            return result;
        }

        private static bool TryParseRow(ClientCsvRowDto row, int rowNumber, List<ClientImportRowError> errors, out CreateClientCommandRequest request)
        {
            request = null!;

            if (string.IsNullOrWhiteSpace(row.FirstName) || string.IsNullOrWhiteSpace(row.LastName) ||
                string.IsNullOrWhiteSpace(row.DocumentNumber) || string.IsNullOrWhiteSpace(row.Email) ||
                string.IsNullOrWhiteSpace(row.PhoneNumber) || string.IsNullOrWhiteSpace(row.PostalCode) ||
                string.IsNullOrWhiteSpace(row.AddressLine) || string.IsNullOrWhiteSpace(row.Number) ||
                string.IsNullOrWhiteSpace(row.Neighborhood) || string.IsNullOrWhiteSpace(row.City) ||
                string.IsNullOrWhiteSpace(row.State))
            {
                errors.Add(new ClientImportRowError
                {
                    RowNumber = rowNumber,
                    DocumentNumber = row.DocumentNumber ?? "",
                    Message = "Campos obrigatórios faltando."
                });
                return false;
            }

            if (!DateTime.TryParse(row.BirthDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out var birthDate))
            {
                errors.Add(new ClientImportRowError
                {
                    RowNumber = rowNumber,
                    DocumentNumber = row.DocumentNumber ?? "",
                    Message = "Data de nascimento inválida. Use o formato yyyy-MM-dd."
                });
                return false;
            }

            request = new CreateClientCommandRequest
            {
                FirstName = row.FirstName.Trim(),
                LastName = row.LastName.Trim(),
                BirthDate = birthDate,
                PhoneNumber = row.PhoneNumber.Trim(),
                Email = row.Email.Trim(),
                DocumentNumber = row.DocumentNumber.Trim(),
                Address = new AddressModel
                {
                    PostalCode = row.PostalCode.Trim(),
                    AddressLine = row.AddressLine.Trim(),
                    Number = row.Number.Trim(),
                    Complement = row.Complement?.Trim() ?? "",
                    Neighborhood = row.Neighborhood.Trim(),
                    City = row.City.Trim(),
                    State = row.State.Trim()
                }
            };
            return true;
        }
    }
}
