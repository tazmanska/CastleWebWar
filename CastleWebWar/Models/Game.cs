using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace CastleWebWar.Models
{
    public enum GameStage
    {
        WaitingForPlayers,
        WaitingForStart,
        Player1,
        Player1Fired,
        Player2,
        Player2Fired,
        End
    }

    public class Game
    {
        public Game()
        {
            Stage = GameStage.WaitingForPlayers;
        }

        public GameStage Stage { get; set; }

        public string Id { get; set; }

        public string PlayerLeft { get; set; }
        public int PlayerLeftPower { get; set; }
        public int PlayerLeftAngle { get; set; }

        public string PlayerRight { get; set; }
        public int PlayerRightPower { get; set; }
        public int PlayerRightAngle { get; set; }

        public bool HasPlayerJoined(string playerId)                
        {
            return PlayerLeft == playerId || PlayerRight == playerId;
        }

        public bool HasAdminJoin
        {
            get { return !string.IsNullOrEmpty(PlayerLeft); }
        }

        public bool CanJoin
        {
            get { return string.IsNullOrEmpty(PlayerLeft) || string.IsNullOrEmpty(PlayerRight); }
        }

        public string Join(string playerId)
        {
            if (!CanJoin)
            {
                throw new InvalidOperationException();
            }

            if (string.IsNullOrEmpty(PlayerLeft))
            {
                PlayerLeft = "Player 1";
                return PlayerLeft;
            }

            PlayerRight = "Player 2";

            Stage = GameStage.WaitingForStart;

            return PlayerRight;
        }

        public void Start()
        {
            if (Stage == GameStage.WaitingForStart)
            {
                Stage = GameStage.Player1;
            }
        }

        public string GetPlayerForMove()
        {
            switch (Stage)
            {
                case GameStage.Player1:
                    return PlayerLeft;

                case GameStage.Player2:
                    return PlayerRight;

                default:
                    return null;
            }
        }

        public Tuple<string, int, int> GetPlayerMove()
        {
            switch (Stage)
            {
                case GameStage.Player1:
                    return new Tuple<string, int, int>(PlayerLeft, PlayerLeftPower, PlayerLeftAngle);

                case GameStage.Player2:
                    return new Tuple<string, int, int>(PlayerRight, PlayerRightPower, PlayerRightAngle);

                default:
                    return null;
            }
        }

        public void PlayerFired(int power)
        {
            switch (Stage)
            {
                case GameStage.Player1:
                    Stage = GameStage.Player1Fired;
                    return;

                case GameStage.Player2:
                    Stage = GameStage.Player2Fired;
                    return;
            }
        }

        public bool NextStage()
        {
            switch (Stage)
            {
                case GameStage.Player1Fired:
                    Stage = GameStage.Player2;
                    return true;

                case GameStage.Player2Fired:
                    Stage = GameStage.Player1;
                    return true;

                default:
                    return false;
            }
        }

        public void PlayerMove(string player, int power, int angle)
        {
            if (player == PlayerLeft)
            {
                PlayerLeftPower = power;
                PlayerLeftAngle = angle;
            }
            else
            {
                PlayerRightPower = power;
                PlayerRightAngle = angle;
            }
        }
    }
}