using System;
using System.Collections.Generic;

namespace EncuestaPWA.Models.Entities;

public partial class Encuesta
{
    public int Id { get; set; }

    public string Criterio { get; set; } = null!;

    public string Pregunta { get; set; } = null!;

    public int Excelente { get; set; }

    public int Bueno { get; set; }

    public int Regular { get; set; }

    public int Malo { get; set; }

    public int MuyMalo { get; set; }
}
