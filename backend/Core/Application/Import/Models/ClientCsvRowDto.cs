using CsvHelper.Configuration.Attributes;

namespace Application.Import.Models
{
    public class ClientCsvRowDto
    {
        [Name("FirstName")]
        public string FirstName { get; set; } = string.Empty;

        [Name("LastName")]
        public string LastName { get; set; } = string.Empty;

        [Name("BirthDate")]
        public string BirthDate { get; set; } = string.Empty;

        [Name("PhoneNumber")]
        public string PhoneNumber { get; set; } = string.Empty;

        [Name("Email")]
        public string Email { get; set; } = string.Empty;

        [Name("DocumentNumber")]
        public string DocumentNumber { get; set; } = string.Empty;

        [Name("PostalCode")]
        public string PostalCode { get; set; } = string.Empty;

        [Name("AddressLine")]
        public string AddressLine { get; set; } = string.Empty;

        [Name("Number")]
        public string Number { get; set; } = string.Empty;

        [Name("Complement")]
        public string Complement { get; set; } = string.Empty;

        [Name("Neighborhood")]
        public string Neighborhood { get; set; } = string.Empty;

        [Name("City")]
        public string City { get; set; } = string.Empty;

        [Name("State")]
        public string State { get; set; } = string.Empty;
    }
}
