using Microsoft.AspNetCore.Identity.UI.Services;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class DummyEmailSender : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            // Logg til konsollen i stedet for å sende e-post
            Console.WriteLine($"E-post sendt til: {email}, Emne: {subject}, Innhold: {message}");
            return Task.CompletedTask;
        }
    }
}