using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Persistence.Configurations
{
    public class ClientImportJobRecordConfiguration : BaseEntityTypeConfiguration<ClientImportJobRecord>
    {
        public override void Configure(EntityTypeBuilder<ClientImportJobRecord> builder)
        {
            builder.ToTable("ClientImportJobRecord");
            builder.Property(r => r.State).IsRequired();
            builder.Property(r => r.ProcessedAt);
            builder.Property(r => r.ResultJson).HasColumnType("longtext");
            builder.Property(r => r.ErrorMessage).HasColumnType("varchar(2000)");
        }
    }
}
