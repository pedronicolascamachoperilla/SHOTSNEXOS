// Unity C# script for utility functions compatible with NEXO environment maps
// Place this script in Assets/Scripts/Map/EntornoUtils.cs
using System.Collections.Generic;
using UnityEngine;

public static class EntornoUtils {
    public static List<EntornoZone> GetZonesByType(EntornoMapData mapData, string type) {
        return mapData.zones.FindAll(z => z.type == type);
    }
    public static EntornoCoverPoint GetNearestCover(EntornoMapData mapData, Vector3 position) {
        EntornoCoverPoint nearest = null;
        float minDist = float.MaxValue;
        foreach(var cov in mapData.coverPoints) {
            float dist = Vector2.Distance(new Vector2(cov.x, cov.y), new Vector2(position.x, position.z));
            if(dist < minDist) { minDist = dist; nearest = cov; }
        }
        return nearest;
    }
    public static List<EntornoHighGround> GetHighGrounds(EntornoMapData mapData) {
        return mapData.highGround;
    }
    public static List<EntornoRiskRewardZone> GetRiskRewardZones(EntornoMapData mapData) {
        return mapData.riskRewardZones;
    }
    public static List<EntornoLandmark> GetLandmarks(EntornoMapData mapData) {
        return mapData.landmarks;
    }
}
