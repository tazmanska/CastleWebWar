using CastleWebWar.Code;
using CastleWebWar.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CastleWebWar.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult NewGame(string id = null)
        {
            if (string.IsNullOrEmpty(id))
            {
                id = Guid.NewGuid().ToString("N");
            }

            Game game = GameCollection.Get(id);
            if (game == null)
            {
                game = new Game() { Id = id };
                GameCollection.Set(game);
            }
            return RedirectToAction("Game", new { id = game.Id });
        }

        public ActionResult Game(string id)
        {
            Game game = GameCollection.Get(id);
            if (game == null || !game.CanJoin)
            {
                return RedirectToAction("NewGame");
            }
            string user = "Player 2";
            if (!game.HasAdminJoin)
            {
                user = game.Join(null);
            }
            GameView model = new GameView()
            {
                PlayerName = user,
                Game = game
            };
            return View(model);
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}