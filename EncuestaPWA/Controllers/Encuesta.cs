using EncuestaPWA.Models.DTOs;
using EncuestaPWA.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace EncuestaPWA.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EncuestaController : ControllerBase  
    {
        public EncuestaController(ItesrcneIntegracionContext context)
        {
            Context = context;
        }

        public ItesrcneIntegracionContext Context { get; }



        public ActionResult Index()
        {
            var data = Context.Encuesta.Select(x => new
            {
                x.Id,
                x.Pregunta
            });

            return Ok(data);
        }

        [HttpGet("Resultados")]
        public IActionResult Resultados()
        {
            var data = Context.Encuesta.Select(x => new
            {
                x.Criterio,
                x.MuyMalo,
                x.Malo,
                x.Regular,
                x.Bueno,
                x.Excelente,
                EncuestasRealizadas = x.MuyMalo + x.Malo + x.Regular + x.Bueno + x.Excelente
            }).ToList();
            var total = data.Max(x => x.EncuestasRealizadas);
            return Ok(new
            {
                TotalEncuestas =
                total,
                Puntuacion = total == 0 ? 0 : data.Max(x => x.Bueno + x.Excelente) / (double)total * 100.0,
                Criterios = data
            });
        }

        [HttpPost]
        public IActionResult Responder(RespuestaDTO[] respuestas)
        {
            var preguntas = Context.Encuesta.ToList();
            foreach (var item in respuestas)
            {
                var p = preguntas.FirstOrDefault(x => x.Id == item.Id);

                if (p != null)
                {
                    if (item.Valor == 1)
                    {
                        p.MuyMalo++;
                    }
                    if (item.Valor == 2)
                    {
                        p.Malo++;
                    }
                    if (item.Valor == 3)
                    {
                        p.Regular++;
                    }
                    if (item.Valor == 4)
                    {
                        p.Bueno++;
                    }
                    if (item.Valor == 5)
                    {
                        p.Excelente++;
                    }
                }


            }
            Context.SaveChanges();

            return Ok();
        }


    }
}
