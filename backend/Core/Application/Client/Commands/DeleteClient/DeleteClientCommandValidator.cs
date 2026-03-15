using FluentValidation;

namespace Application.Client.Commands.DeleteClient
{
    public class DeleteClientCommandValidator : AbstractValidator<DeleteClientCommandRequest>
    {
        public DeleteClientCommandValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Id do cliente é obrigatório.");
        }
    }
}
