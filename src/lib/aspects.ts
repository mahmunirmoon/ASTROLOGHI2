import { ASPECT_FA } from "../data/planets";
import type { AspectType, ChartAspect, PlanetPosition } from "../types";

/** Smallest angular separation between two ecliptic longitudes (0–180) */
export const angularSeparation = (a: number, b: number): number => {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
};

const ASPECT_TYPES: AspectType[] = ["conjunction", "sextile", "square", "trine", "opposition"];

/**
 * Major aspects between planetary positions using classical orbs.
 * Aspects are pure geometry derived from the computed ecliptic longitudes.
 */
export const computeAspects = (positions: PlanetPosition[]): ChartAspect[] => {
  const aspects: ChartAspect[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const sep = angularSeparation(positions[i].longitude, positions[j].longitude);
      for (const type of ASPECT_TYPES) {
        const meta = ASPECT_FA[type];
        const orb = Math.abs(sep - meta.angle);
        if (orb <= meta.orb) {
          aspects.push({
            p1: positions[i].planet,
            p2: positions[j].planet,
            type,
            angle: Math.round(sep * 10) / 10,
            orb: Math.round(orb * 10) / 10,
          });
        }
      }
    }
  }
  // Tightest orbs first
  return aspects.sort((a, b) => a.orb - b.orb);
};
