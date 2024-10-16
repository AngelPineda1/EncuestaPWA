using EncuestaPWA.Models.Entities;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddDbContext<ItesrcneIntegracionContext>(x
    => x.UseMySql("server=itesrc.net;user=itesrcne_integra;password=integra1;database=itesrcne_integracion", Microsoft.EntityFrameworkCore.ServerVersion.Parse("10.11.8-mariadb"))
);
var app = builder.Build();

app.MapRazorPages();
app.MapControllers();
app.UseStaticFiles();

app.Run();
