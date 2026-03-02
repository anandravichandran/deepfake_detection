import { GoogleGenAI } from "@google/genai";
import { ForensicResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateForensicReport(result: ForensicResult): Promise<string> {
  const prompt = `
    As a Digital Forensics Expert, analyze the following deepfake detection results:
    - Overall Confidence: ${(result.confidence * 100).toFixed(2)}%
    - Classification: ${result.isFake ? 'FAKE (Manipulated)' : 'REAL (Pristine)'}
    - Manipulation Type: ${result.manipulationType || 'Unknown'}
    
    Technical Metrics:
    - Average Eye Aspect Ratio (EAR): ${result.analysis.reduce((acc, f) => acc + f.ear, 0) / result.analysis.length}
    - Average Landmark Jitter: ${result.analysis.reduce((acc, f) => acc + f.jitter, 0) / result.analysis.length}
    - Average Head Stability: ${result.analysis.reduce((acc, f) => acc + f.headStability, 0) / result.analysis.length}
    - Average Pose Inconsistency: ${result.analysis.reduce((acc, f) => acc + f.poseInconsistency, 0) / result.analysis.length}
    - Eye Gaze Variance: ${calculateGazeVariance(result.analysis)}
    - Spatial Anomaly Score (CNN): ${result.analysis.reduce((acc, f) => acc + f.cnnScore, 0) / result.analysis.length}
    - Temporal Anomaly Score (LSTM): ${result.analysis.reduce((acc, f) => acc + f.lstmScore, 0) / result.analysis.length}
    - Global Anomaly Score (Transformer): ${result.analysis.reduce((acc, f) => acc + f.transformerScore, 0) / result.analysis.length}

    Provide a concise, professional forensic report explaining the findings. 
    Highlight specific anomalies like "unnatural blinking patterns", "spatial texture inconsistencies", "frozen head pose", or "unnatural eye movement".
    Use technical but accessible language.
  `;

function calculateGazeVariance(analysis: any[]) {
  if (analysis.length < 2) return 0;
  const avgX = analysis.reduce((acc, f) => acc + f.eyeGaze.x, 0) / analysis.length;
  const avgY = analysis.reduce((acc, f) => acc + f.eyeGaze.y, 0) / analysis.length;
  const varX = analysis.reduce((acc, f) => acc + Math.pow(f.eyeGaze.x - avgX, 2), 0) / analysis.length;
  const varY = analysis.reduce((acc, f) => acc + Math.pow(f.eyeGaze.y - avgY, 2), 0) / analysis.length;
  return (varX + varY) / 2;
}

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Failed to generate report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Forensic analysis unavailable due to API error.";
  }
}
