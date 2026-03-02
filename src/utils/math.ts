import { Landmark } from '../types';

/**
 * Calculates Eye Aspect Ratio (EAR)
 * Standard formula: (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 */
export function calculateEAR(landmarks: Landmark[]): number {
  // Indices for left eye (MediaPipe Face Mesh)
  // p1: 33, p2: 160, p3: 158, p4: 133, p5: 153, p6: 144
  const leftEye = [33, 160, 158, 133, 153, 144];
  
  const dist = (p1: number, p2: number) => {
    const l1 = landmarks[p1];
    const l2 = landmarks[p2];
    return Math.sqrt(Math.pow(l1.x - l2.x, 2) + Math.pow(l1.y - l2.y, 2));
  };

  const v1 = dist(leftEye[1], leftEye[5]);
  const v2 = dist(leftEye[2], leftEye[4]);
  const h = dist(leftEye[0], leftEye[3]);

  return (v1 + v2) / (2 * h);
}

/**
 * Calculates Head Pose (Improved Geometric Approximation)
 */
export function calculateHeadPose(landmarks: Landmark[]) {
  // Key points: Nose tip (1), Chin (152), Left eye (33), Right eye (263), Left mouth (61), Right mouth (291)
  const nose = landmarks[1];
  const chin = landmarks[152];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  const leftMouth = landmarks[61];
  const rightMouth = landmarks[291];

  // Center of eyes and mouth
  const eyesCenter = {
    x: (leftEye.x + rightEye.x) / 2,
    y: (leftEye.y + rightEye.y) / 2,
    z: (leftEye.z + rightEye.z) / 2
  };
  const mouthCenter = {
    x: (leftMouth.x + rightMouth.x) / 2,
    y: (leftMouth.y + rightMouth.y) / 2,
    z: (leftMouth.z + rightMouth.z) / 2
  };

  // Yaw: Rotation around Y-axis (left/right)
  // Based on nose horizontal position relative to eyes
  const eyeDist = Math.sqrt(Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2));
  const yaw = ((nose.x - eyesCenter.x) / eyeDist) * 90;

  // Pitch: Rotation around X-axis (up/down)
  // Based on nose vertical position relative to eyes and chin
  const faceHeight = Math.sqrt(Math.pow(chin.x - eyesCenter.x, 2) + Math.pow(chin.y - eyesCenter.y, 2));
  const pitch = ((nose.y - eyesCenter.y) / faceHeight - 0.35) * 90;

  // Roll: Rotation around Z-axis (tilt)
  // Based on the slope of the line connecting the eyes
  const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

  return { pitch, yaw, roll };
}

/**
 * Calculates 3D Head Pose Inconsistency
 * Compares 2D feature ratios with 3D pose to find perspective mismatches
 */
export function calculatePoseInconsistency(landmarks: Landmark[], pose: { pitch: number, yaw: number, roll: number }): number {
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];

  // 2D ratio of nose to eyes
  const distL = Math.sqrt(Math.pow(nose.x - leftEye.x, 2) + Math.pow(nose.y - leftEye.y, 2));
  const distR = Math.sqrt(Math.pow(nose.x - rightEye.x, 2) + Math.pow(nose.y - rightEye.y, 2));
  const ratio2D = distL / (distR + 0.001);

  // Predicted ratio based on yaw (simplified)
  // When yaw is 0, ratio should be ~1. As yaw increases, one side shrinks.
  const predictedRatio = Math.exp(-pose.yaw / 45); 
  
  const diff = Math.abs(ratio2D - predictedRatio);
  
  // High diff = High inconsistency
  return Math.min(1, diff * 2);
}

/**
 * Calculates Jitter (Difference from previous frame)
 */
export function calculateJitter(current: Landmark[], previous: Landmark[] | null): number {
  if (!previous) return 0;
  let totalDist = 0;
  // Sample a few key landmarks for performance
  const indices = [1, 33, 263, 61, 291, 199]; 
  indices.forEach(i => {
    const d = Math.sqrt(
      Math.pow(current[i].x - previous[i].x, 2) + 
      Math.pow(current[i].y - previous[i].y, 2)
    );
    totalDist += d;
  });
  return totalDist / indices.length;
}

/**
 * Calculates Eye Gaze (Simplified)
 * Returns relative position of iris within the eye boundary
 */
export function calculateEyeGaze(landmarks: Landmark[]) {
  if (landmarks.length < 478) return { x: 0.5, y: 0.5 };

  const leftIris = landmarks[468];
  const leftOuter = landmarks[33];
  const leftInner = landmarks[133];
  
  const x = (leftIris.x - leftOuter.x) / (leftInner.x - leftOuter.x);
  
  const leftTop = landmarks[159];
  const leftBottom = landmarks[145];
  const y = (leftIris.y - leftTop.y) / (leftBottom.y - leftTop.y);

  return { x, y };
}

/**
 * Calculates Head Stability
 * Returns a score from 0 (very unstable) to 1 (perfectly static)
 */
export function calculateHeadStability(poses: { pitch: number, yaw: number, roll: number }[]): number {
  if (poses.length < 2) return 1;
  
  const last = poses[poses.length - 1];
  const prev = poses[poses.length - 2];
  
  const diff = Math.sqrt(
    Math.pow(last.pitch - prev.pitch, 2) +
    Math.pow(last.yaw - prev.yaw, 2) +
    Math.pow(last.roll - prev.roll, 2)
  );
  
  return Math.max(0, 1 - (diff / 2.0));
}

/**
 * Calculates Mouth Symmetry / Smile Inconsistency
 * Manipulated videos often show asymmetry in mouth movement
 */
export function calculateMouthSymmetry(landmarks: Landmark[]): number {
  // Left corner (61), Right corner (291), Top lip (13), Bottom lip (14)
  const left = landmarks[61];
  const right = landmarks[291];
  const top = landmarks[13];
  const bottom = landmarks[14];

  const horizontalDist = Math.sqrt(Math.pow(left.x - right.x, 2) + Math.pow(left.y - right.y, 2));
  const verticalDist = Math.sqrt(Math.pow(top.x - bottom.x, 2) + Math.pow(top.y - bottom.y, 2));
  
  // Ratio of width to height (simplified smile metric)
  return horizontalDist / (verticalDist + 0.001);
}

/**
 * Simulates Spatial Texture Analysis (Noise Distribution)
 * In a real app, this would analyze high-frequency artifacts.
 * Here we simulate it by looking for "unnatural" pixel variance if we had raw access,
 * but since we're in the frontend, we'll use a heuristic based on landmark stability.
 */
export function calculateTextureAnomaly(landmarks: Landmark[], jitter: number): number {
  // Deepfakes often have "smooth" textures or "ringing" artifacts around landmarks
  // We simulate this by checking if jitter is too low (unnatural smoothness) 
  // or too high (blending artifacts)
  if (jitter < 0.0005) return 0.8; // Unnaturally static
  if (jitter > 0.04) return 0.9; // Blending artifact
  return Math.random() * 0.2; // Normal variance
}
