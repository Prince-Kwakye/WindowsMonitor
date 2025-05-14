using Microsoft.AspNetCore.Mvc;
using WindowsMonitorApi.Services;

namespace WindowsMonitorApi.Controllers
{



    [ApiController]
    [Route("api/[controller]")]
    public class SystemController(SystemInfoService systemInfoService) : ControllerBase
    {
        private readonly SystemInfoService _systemInfoService = systemInfoService;

        [HttpGet]
        public IActionResult GetSystemInfo()
        {
            return Ok(_systemInfoService.GetSystemInfo());
        }
    }
}