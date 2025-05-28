// Gestor de Puntos de Interés (POI) para modos de juego NEXO en Unity
using UnityEngine;
using System.Collections.Generic;

public class GameModePOIManager : MonoBehaviour {
    public List<Vector3> pointsOfInterest = new List<Vector3>();
    public GameObject poiPrefab;

    public void SetPOIs(List<Vector3> pois) {
        pointsOfInterest = pois;
        RenderPOIs();
    }

    public void RenderPOIs() {
        foreach(var poi in pointsOfInterest) {
            GameObject marker = Instantiate(poiPrefab, poi + Vector3.up * 2, Quaternion.identity);
            marker.transform.localScale = Vector3.one * 2;
            marker.name = "POI_Marker";
        }
    }

    public void ClearPOIs() {
        foreach(var obj in GameObject.FindGameObjectsWithTag("POI")) {
            Destroy(obj);
        }
    }
}
