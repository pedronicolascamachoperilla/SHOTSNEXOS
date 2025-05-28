// Soporte para Modos de Juego en Unity (NEXO)
// Diseño modular para deathmatch, team, battle royale, etc.
using UnityEngine;
using System.Collections.Generic;

public enum GameModeType {
    Deathmatch,
    TeamDeathmatch,
    BattleRoyale,
    CaptureTheFlag,
    FreeForAll
}

[System.Serializable]
public class GameModeZone {
    public string id;
    public GameModeType mode;
    public bool isSymmetric;
    public Vector3 center;
    public float width, height;
    public List<Vector3> pointsOfInterest;
}

public class GameModeSupport : MonoBehaviour {
    public GameModeType currentMode = GameModeType.Deathmatch;
    public List<GameModeZone> modeZones;

    public void SetupZonesForMode(GameModeType mode) {
        // Limpia zonas previas
        foreach(var zone in modeZones) {
            // Aquí podrías destruir objetos de zona previos
        }
        modeZones = new List<GameModeZone>();
        // Ejemplo: zonas simétricas/asimétricas
        if (mode == GameModeType.TeamDeathmatch || mode == GameModeType.CaptureTheFlag) {
            // Zonas simétricas para equipos
            modeZones.Add(new GameModeZone {
                id = "TeamA",
                mode = mode,
                isSymmetric = true,
                center = new Vector3(-50,0,0),
                width = 40,
                height = 40,
                pointsOfInterest = new List<Vector3> { new Vector3(-60,0,0), new Vector3(-40,0,0) }
            });
            modeZones.Add(new GameModeZone {
                id = "TeamB",
                mode = mode,
                isSymmetric = true,
                center = new Vector3(50,0,0),
                width = 40,
                height = 40,
                pointsOfInterest = new List<Vector3> { new Vector3(60,0,0), new Vector3(40,0,0) }
            });
        } else if (mode == GameModeType.BattleRoyale) {
            // Zonas asimétricas y puntos de interés repartidos
            modeZones.Add(new GameModeZone {
                id = "BR_Center",
                mode = mode,
                isSymmetric = false,
                center = Vector3.zero,
                width = 100,
                height = 100,
                pointsOfInterest = new List<Vector3> {
                    new Vector3(0,0,0), new Vector3(30,0,30), new Vector3(-30,0,-30), new Vector3(50,0,-50)
                }
            });
        } else {
            // Free for all o deathmatch: múltiples puntos de interés
            modeZones.Add(new GameModeZone {
                id = "FFA",
                mode = mode,
                isSymmetric = false,
                center = Vector3.zero,
                width = 80,
                height = 80,
                pointsOfInterest = new List<Vector3> {
                    new Vector3(0,0,0), new Vector3(20,0,20), new Vector3(-20,0,-20), new Vector3(40,0,-40), new Vector3(-40,0,40)
                }
            });
        }
    }

    public void RenderZones() {
        foreach(var zone in modeZones) {
            GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
            go.transform.position = zone.center;
            go.transform.localScale = new Vector3(zone.width, 1, zone.height);
            go.name = $"Zone_{zone.id}_{zone.mode}";
            // Puedes personalizar color/material según simetría o modo
        }
        foreach(var zone in modeZones) {
            foreach(var poi in zone.pointsOfInterest) {
                GameObject marker = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                marker.transform.position = poi + Vector3.up * 2;
                marker.transform.localScale = Vector3.one * 2;
                marker.name = $"POI_{zone.id}";
            }
        }
    }

    void Start() {
        SetupZonesForMode(currentMode);
        RenderZones();
    }
}
