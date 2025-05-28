// Unity C# script for loading and using NEXO environment map data
// Compatible with the exported JSON structure from diseno_entornos.json
// Place this script in Assets/Scripts/Map/EntornoLoader.cs
using System.Collections.Generic;
using UnityEngine;
using System.IO;

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
    public List<EntornoZone> zones;
    public List<EntornoCoverPoint> coverPoints;
    public List<EntornoHighGround> highGround;
    public List<EntornoRiskRewardZone> riskRewardZones;
    public List<EntornoLandmark> landmarks;
}

public class EntornoLoader : MonoBehaviour {
    public string jsonFileName = "diseno_entornos.json";
    public EntornoMapData mapData;

    void Start() {
        LoadMapData();
        // Ejemplo: crear zonas en la escena
        foreach(var zone in mapData.zones) {
            CreateZone(zone);
        }
        // Puedes hacer lo mismo para coverPoints, highGround, etc.
    }

    void LoadMapData() {
        string path = Path.Combine(Application.streamingAssetsPath, jsonFileName);
        if(File.Exists(path)) {
            string json = File.ReadAllText(path);
            mapData = JsonUtility.FromJson<EntornoMapData>(json);
        } else {
            Debug.LogError("No se encontró el archivo de entorno: " + path);
        }
    }

    void CreateZone(EntornoZone zone) {
        // Ejemplo: crear un GameObject para la zona
        GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.transform.position = new Vector3(zone.x + zone.width/2, 0, zone.y + zone.height/2);
        go.transform.localScale = new Vector3(zone.width, 2, zone.height);
        go.name = "Zone_" + zone.type;
        // Puedes personalizar el color/material según el tipo
    }
}
