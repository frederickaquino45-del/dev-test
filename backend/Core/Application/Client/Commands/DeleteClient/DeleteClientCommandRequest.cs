using MediatR;
using System;

namespace Application.Client.Commands.DeleteClient
{
    public class DeleteClientCommandRequest : IRequest
    {
        public Guid Id { get; set; }
    }
}
