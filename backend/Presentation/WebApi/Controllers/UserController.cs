using Application.User.Commands.CreateUser;
using Application.User.Commands.UpdateUser;
using Application.User.Queries.AllUsersQuery;
using Application.User.Queries.UserByIdQuery;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Administrator")]
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UserController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserCommandRequest request)
        {
            var userId = await _mediator.Send(request);
            return CreatedAtAction(nameof(GetById), new { id = userId }, request);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _mediator.Send(new AllUsersQueryRequest());
            return Ok(users);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _mediator.Send(new UserByIdQueryRequest { Id = id });
            return Ok(user);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommandRequest request)
        {
            if (id != request.Id)
            {
                return BadRequest();
            }

            await _mediator.Send(request);
            return NoContent();
        }
    }
}
