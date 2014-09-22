using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using CastleWebWar.Models;
using CastleWebWar.Code;
using System.Threading;

namespace CastleWebWar
{
    public class Broadcaster
    {
        private readonly static Lazy<Broadcaster> _instance =
            new Lazy<Broadcaster>(() => new Broadcaster());
        // We're going to broadcast to all clients a maximum of 25 times per second
        private readonly TimeSpan BroadcastInterval =
            TimeSpan.FromMilliseconds(40);
        private readonly IHubContext _hubContext;
        private Timer _broadcastLoop;
        private bool _modelUpdated;
        public Broadcaster()
        {
            // Save our hub context so we can easily use it aaaa
            // to send to its connected clients
            _hubContext = GlobalHost.ConnectionManager.GetHubContext<GameHub>();
            // Start the broadcast loop
            _broadcastLoop = new Timer(
                BroadcastShape,
                null,
                BroadcastInterval,
                BroadcastInterval);
        }
        public void BroadcastShape(object state)
        {
            foreach (Game game in GameCollection.All())
            {
                if (game.NextStage())
                {
                    string player = game.GetPlayerForMove();
                    if (player != null)
                    {
                        _hubContext.Clients.Group(game.Id).playerFire(player);
                        continue;
                    }
                }
                else
                {
                    if (game.GetPlayerForMove() != null)
                    {
                        var move = game.GetPlayerMove();
                        if (move != null)
                        {
                            _hubContext.Clients.Group(game.Id).playerMove(move.Item1, move.Item2, move.Item3);
                        }
                    }
                }
            }
        }

        public static Broadcaster Instance
        {
            get
            {
                return _instance.Value;
            }
        }
    }


    public class GameHub : Hub
    {
	    // Is set via the constructor on each creation
	    private Broadcaster _broadcaster;

	    public GameHub()
	        : this(Broadcaster.Instance)
	    {
	    }

        public GameHub(Broadcaster broadcaster)
	    {
	        _broadcaster = broadcaster;
	    }

        public void join(string gameId, string playerId)
        {
            Game game = GameCollection.Get(gameId);
            Groups.Add(Context.ConnectionId, gameId);
            if (!game.HasPlayerJoined(playerId))
            {
                playerId = game.Join(playerId);                
                Clients.Group(gameId).playerJoined(playerId);
            }
        }

        public void start(string gameId)
        {
            Game game = GameCollection.Get(gameId);
            if (game != null)
            {
                game.Start();
                string player = game.GetPlayerForMove();
                if (player != null)
                {
                    Clients.Group(gameId).playerFire(player);
                }
            }
        }

        public void playerMoved(string gameId, string player, int power, int angle)
        {
            Game game = GameCollection.Get(gameId);
            if (game != null)
            {
                game.PlayerMove(player, power, angle);
            }
        }

        public void playerFired(string gameId, int power, int angle)
        {
            Game game = GameCollection.Get(gameId);
            if (game != null)
            {
                var player = game.GetPlayerForMove();
                game.PlayerFired(power);
                Clients.Group(gameId).playerFired(player, power, angle);
            }
        }

        public void bulletLanded(string gameId, string playerName)
        {
            Game game = GameCollection.Get(gameId);
            if (game != null)
            {
                game.BulletLanded(playerName);
            }
        }
    }
}
