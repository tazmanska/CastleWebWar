using CastleWebWar.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CastleWebWar.Code
{
    public static class GameCollection
    {
        private static List<Game> __games = new List<Game>();

        public static List<Game> All()
        {
            return new List<Game>(__games);
        }

        public static Game Get(string id)
        {
            return __games.FirstOrDefault(x => x.Id == id);
        }

        public static void Set(Game game)
        {
            Game existing = Get(game.Id);
            if (existing != null)
            {
                __games.Remove(existing);
            }
            __games.Add(game);
        }


    }
}