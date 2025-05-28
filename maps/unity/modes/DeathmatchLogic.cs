// Lógica base para modo Deathmatch en NEXO Unity
using UnityEngine;

public class DeathmatchLogic : MonoBehaviour {
    public int scoreToWin = 20;
    public void OnPlayerKill(string playerId) {
        // Lógica de puntuación y victoria
        Debug.Log($"Jugador {playerId} hizo un kill en Deathmatch");
    }
}
