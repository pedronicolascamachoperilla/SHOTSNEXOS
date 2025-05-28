// Unity C# script for rendering landmarks and risk/reward zones in the scene
// Place this script in Assets/Scripts/Map/EntornoRenderer.cs
using UnityEngine;

public class EntornoRenderer : MonoBehaviour {
    public EntornoMapData mapData;
    public GameObject landmarkPrefab;
    public GameObject lootZonePrefab;

    void Start() {
        RenderLandmarks();
        RenderRiskRewardZones();
    }

    void RenderLandmarks() {
        foreach(var lm in mapData.landmarks) {
            GameObject go = Instantiate(landmarkPrefab, new Vector3(lm.x, 0, lm.y), Quaternion.identity);
            go.name = "Landmark_" + lm.type;
            // Puedes mostrar el nombre/descripción con un TextMesh o UI
        }
    }

    void RenderRiskRewardZones() {
        foreach(var rz in mapData.riskRewardZones) {
            GameObject go = Instantiate(lootZonePrefab, new Vector3(rz.x + rz.width/2, 0, rz.y + rz.height/2), Quaternion.identity);
            go.transform.localScale = new Vector3(rz.width, 1, rz.height);
            go.name = "RiskReward_" + rz.type;
            // Puedes cambiar color/material según rz.exposed o rz.loot
        }
    }
}
