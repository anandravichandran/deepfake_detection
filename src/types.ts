/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FrameAnalysis {
  timestamp: number;
  ear: number; // Eye Aspect Ratio
  jitter: number; // Facial Landmark Jitter
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
  eyeGaze: {
    x: number;
    y: number;
  };
  headStability: number; // Stability score (0-1)
  mouthSymmetry: number; // Mouth/Smile symmetry score
  textureAnomaly: number; // Spatial texture anomaly score (0-1)
  poseInconsistency: number; // 3D Pose inconsistency score (0-1)
  cnnScore: number; // Spatial anomaly score
  lstmScore: number; // Temporal anomaly score
  transformerScore: number; // Global anomaly score
}

export interface ForensicResult {
  isFake: boolean;
  confidence: number;
  analysis: FrameAnalysis[];
  summary: string;
  manipulationType?: 'FaceSwap' | 'DeepFaceLab' | 'NeuralTextures' | 'Face2Face' | 'Original';
}
