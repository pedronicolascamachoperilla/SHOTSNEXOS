// Unity C# script for loading NEXO map data from StreamingAssets
// Place this script in Assets/Scripts/Map/MapDataLoader.cs
using UnityEngine;
using System.IO;
using System.Collections.Generic;

[System.Serializable]
public class EntornoZone {
    public string type;
    public float x, y, width, height;
}
[System.Serializable]
public class EntornoCoverPoint {
    public string type;
    public float x, y, width, height;
}
[System.Serializable]
public class EntornoHighGround {
    public string type;
    public float x, y, width, height;
}
[System.Serializable]
public class EntornoRiskRewardZone {
    public string type;
    public float x, y, width, height;
    public string loot;
    public string buff;
    public bool exposed;
}
[System.Serializable]
public class EntornoLandmark {
    public string type;
    public float x, y;
    public string description;
}
[System.Serializable]
public class EntornoMapData {
    public string name;
    public string description;
    public System.Collections.Generic.List<EntornoZone> zones;
    public System.Collections.Generic.List<EntornoCoverPoint> coverPoints;
    public System.Collections.Generic.List<EntornoHighGround> highGround;
    public System.Collections.Generic.List<EntornoRiskRewardZone> riskRewardZones;
    public System.Collections.Generic.List<EntornoLandmark> landmarks;
}

public class MapDataLoader : MonoBehaviour {
    public string jsonFileName = "diseno_entornos.json";
    public EntornoMapData loadedMapData;
    public GameObject zonePrefab;
    public GameObject coverPrefab;
    public GameObject highGroundPrefab;
    public GameObject lootZonePrefab;
    public GameObject landmarkPrefab;
    public GameModeSupport gameModeSupport;
    public GameModeType detectedMode = GameModeType.Deathmatch;

    public void Load() {
        string path = Path.Combine(Application.streamingAssetsPath, jsonFileName);
        if(File.Exists(path)) {
            string json = File.ReadAllText(path);
            loadedMapData = JsonUtility.FromJson<EntornoMapData>(json);
        } else {
            Debug.LogError("No se encontró el archivo de entorno: " + path);
        }
    }

    // --- Ejemplo de integración avanzada: instanciar todo el entorno ---
    public void RenderAll() {
        if (loadedMapData == null) { Debug.LogError("No hay datos de entorno cargados"); return; }
        // Zonas
        if (loadedMapData.zones != null && zonePrefab != null) {
            foreach(var zone in loadedMapData.zones) {
                var go = Instantiate(zonePrefab, new Vector3(zone.x + zone.width/2, 0, zone.y + zone.height/2), Quaternion.identity);
                go.transform.localScale = new Vector3(zone.width, 2, zone.height);
                go.name = "Zone_" + zone.type;
            }
        }
        // Coberturas
        if (loadedMapData.coverPoints != null && coverPrefab != null) {
            foreach(var cov in loadedMapData.coverPoints) {
                var go = Instantiate(coverPrefab, new Vector3(cov.x + cov.width/2, 0, cov.y + cov.height/2), Quaternion.identity);
                go.transform.localScale = new Vector3(cov.width, 1, cov.height);
                go.name = "Cover_" + cov.type;
            }
        }
        // High ground
        if (loadedMapData.highGround != null && highGroundPrefab != null) {
            foreach(var hg in loadedMapData.highGround) {
                var go = Instantiate(highGroundPrefab, new Vector3(hg.x + hg.width/2, 0, hg.y + hg.height/2), Quaternion.identity);
                go.transform.localScale = new Vector3(hg.width, 2, hg.height);
                go.name = "HighGround_" + hg.type;
            }
        }
        // Zonas de riesgo/recompensa
        if (loadedMapData.riskRewardZones != null && lootZonePrefab != null) {
            foreach(var rz in loadedMapData.riskRewardZones) {
                var go = Instantiate(lootZonePrefab, new Vector3(rz.x + rz.width/2, 0, rz.y + rz.height/2), Quaternion.identity);
                go.transform.localScale = new Vector3(rz.width, 1, rz.height);
                go.name = "RiskReward_" + rz.type;
            }
        }
        // Landmarks
        if (loadedMapData.landmarks != null && landmarkPrefab != null) {
            foreach(var lm in loadedMapData.landmarks) {
                var go = Instantiate(landmarkPrefab, new Vector3(lm.x, 0, lm.y), Quaternion.identity);
                go.name = "Landmark_" + lm.type;
            }
        }
    }

    public void SetupGameModeFromMap() {
        if (loadedMapData == null) return;
        // Detectar modo de juego desde el JSON (puedes agregar un campo "mode" en el JSON de mapa)
        if (!string.IsNullOrEmpty(loadedMapData.name) && loadedMapData.name.ToLower().Contains("royale"))
            detectedMode = GameModeType.BattleRoyale;
        // Puedes mejorar la detección según tus datos
        // Configurar zonas y puntos de interés según el modo
        if (gameModeSupport == null) gameModeSupport = FindObjectOfType<GameModeSupport>();
        if (gameModeSupport != null) {
            gameModeSupport.currentMode = detectedMode;
            gameModeSupport.SetupZonesForMode(detectedMode);
            gameModeSupport.RenderZones();
        }
    }

    // --- Utilidades de consulta (similares a EntornoUtils) ---
    public List<EntornoZone> GetZonesByType(string type) {
        if (loadedMapData == null || loadedMapData.zones == null) return new List<EntornoZone>();
        return loadedMapData.zones.FindAll(z => z.type == type);
    }
    public EntornoCoverPoint GetNearestCover(Vector3 position) {
        if (loadedMapData == null || loadedMapData.coverPoints == null) return null;
        EntornoCoverPoint nearest = null;
        float minDist = float.MaxValue;
        foreach(var cov in loadedMapData.coverPoints) {
            float dist = Vector2.Distance(new Vector2(cov.x, cov.y), new Vector2(position.x, position.z));
            if(dist < minDist) { minDist = dist; nearest = cov; }
        }
        return nearest;
    }
    public List<EntornoHighGround> GetHighGrounds() {
        if (loadedMapData == null) return new List<EntornoHighGround>();
        return loadedMapData.highGround;
    }
    public List<EntornoRiskRewardZone> GetRiskRewardZones() {
        if (loadedMapData == null) return new List<EntornoRiskRewardZone>();
        return loadedMapData.riskRewardZones;
    }
    public List<EntornoLandmark> GetLandmarks() {
        if (loadedMapData == null) return new List<EntornoLandmark>();
        return loadedMapData.landmarks;
    }

    // --- Ejemplo de uso en Unity ---
    void Start() {
        Load();
        RenderAll();
        SetupGameModeFromMap();
    }
}
