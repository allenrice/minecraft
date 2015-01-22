using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace minecraft.Controllers
{
    public class TestController : ApiController
    {
        public minecraft.Models.TypeLiteDemoClass Post([FromBody]minecraft.Models.TypeLiteDemoClass value)
        {
            // increment / flip / add to some properties to show modifications
            value.NumberProperty++;
            value.BoolProperty = !value.BoolProperty;
            value.ListProperty.Add("new value from server: " + DateTime.Now.ToString());
            return value;
        }

    }
}
