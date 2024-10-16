using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace EncuestaPWA.Models.Entities;

public partial class ItesrcneIntegracionContext : DbContext
{
    public ItesrcneIntegracionContext()
    {
    }

    public ItesrcneIntegracionContext(DbContextOptions<ItesrcneIntegracionContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Encuesta> Encuesta { get; set; }

 
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb3_general_ci")
            .HasCharSet("utf8mb3");

        modelBuilder.Entity<Encuesta>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PRIMARY");

            entity.ToTable("encuesta");

            entity.Property(e => e.Id).HasColumnType("int(11)");
            entity.Property(e => e.Bueno).HasColumnType("int(11)");
            entity.Property(e => e.Criterio).HasMaxLength(45);
            entity.Property(e => e.Excelente).HasColumnType("int(11)");
            entity.Property(e => e.Malo).HasColumnType("int(11)");
            entity.Property(e => e.MuyMalo)
                .HasColumnType("int(11)")
                .HasColumnName("Muy malo");
            entity.Property(e => e.Pregunta).HasMaxLength(500);
            entity.Property(e => e.Regular).HasColumnType("int(11)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
