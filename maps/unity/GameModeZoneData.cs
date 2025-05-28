// Estructura de datos para zonas de modos de juego NEXO en Unity
using UnityEngine;
using System.Collections.Generic;

[System.Serializable]
public class GameModeZone {
    public string id;
    public GameModeType mode;
    public bool isSymmetric;
    public Vector3 center;
    public float width, height;
    public List<Vector3> pointsOfInterest;
}
