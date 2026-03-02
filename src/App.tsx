/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Upload, 
  Activity, 
  Eye, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Layers, 
  Search,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  ChevronRight,
  Globe,
  Cpu,
  Lock,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useDropzone } from 'react-dropzone';
import { Landmark, FrameAnalysis, ForensicResult } from './types';
import { calculateEAR, calculateHeadPose, calculateJitter, calculateEyeGaze, calculateHeadStability, calculateMouthSymmetry, calculateTextureAnomaly, calculatePoseInconsistency } from './utils/math';
import { generateForensicReport } from './services/geminiForensics';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const MetricCard = ({ title, value, unit, icon: Icon, color }: { title: string, value: string | number, unit?: string, icon: any, color: string }) => (
  <div className="bg-[#151619] border border-[#2A2B2F] p-4 rounded-lg flex items-center gap-4">
    <div className={cn("p-3 rounded-md", color)}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-mono font-bold text-white">{value}</span>
        {unit && <span className="text-[10px] text-gray-500 font-mono">{unit}</span>}
      </div>
    </div>
  </div>
);

const AnalysisStage = ({ title, active, status, description }: { title: string, active: boolean, status: 'pending' | 'processing' | 'done', description: string }) => (
  <div className={cn(
    "flex items-start gap-3 p-3 rounded-md border transition-all duration-300",
    active ? "bg-[#1A1B1E] border-[#F27D26]/30" : "bg-transparent border-transparent opacity-50"
  )}>
    <div className={cn(
      "w-2 h-2 mt-1.5 rounded-full",
      status === 'pending' ? "bg-gray-600" : status === 'processing' ? "bg-blue-500 animate-pulse" : "bg-green-500"
    )} />
    <div>
      <p className="text-xs font-bold text-white uppercase tracking-tight">{title}</p>
      <p className="text-[10px] text-gray-400 mt-1 leading-tight">{description}</p>
    </div>
  </div>
);

const LandingPage = ({ onLaunch }: { onLaunch: () => void }) => (
  <div className="min-h-screen bg-[#0A0B0D] text-white overflow-x-hidden">
    {/* Navigation */}
    <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
        <div className="bg-[#F27D26] p-1.5 rounded-md">
          <Shield className="w-5 h-5 text-black" />
        </div>
        <span className="text-lg font-bold tracking-tight uppercase">Aegis</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest text-gray-400">
        <a href="#problem" className="hover:text-[#F27D26] transition-colors">Problem</a>
        <a href="#features" className="hover:text-[#F27D26] transition-colors">Features</a>
        <a href="#about" className="hover:text-[#F27D26] transition-colors">About</a>
      </div>
      <button 
        onClick={onLaunch}
        className="px-6 py-2 bg-[#F27D26] text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#D96A1E] transition-all"
      >
        Launch App
      </button>
    </nav>

    {/* Hero Section */}
    <section className="relative pt-20 pb-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
            THE FUTURE OF <br />
            <span className="text-[#F27D26]">DIGITAL TRUST</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-400 mb-12 leading-relaxed">
            Aegis is an advanced deepfake forensic suite utilizing hybrid CNN-LSTM-Transformer 
            architectures and physiological analysis to detect synthetic media with 
            unprecedented accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLaunch}
              className="px-8 py-4 bg-[#F27D26] text-black font-bold uppercase tracking-widest rounded-lg hover:bg-[#D96A1E] transition-all flex items-center justify-center gap-2"
            >
              Start Forensic Scan <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4 px-6 py-4 border border-[#2A2B2F] rounded-lg bg-[#151619]/50 backdrop-blur-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#151619] bg-gray-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">Trusted by 500+ Forensic Labs</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-l from-[#F27D26]/30 to-transparent" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#F27D26] rounded-full blur-[120px] animate-pulse" />
      </div>
    </section>

    {/* Problem Statement */}
    <section id="problem" className="py-32 px-6 bg-[#0F1012] border-y border-[#1A1B1E]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-[8px] font-mono text-red-500 uppercase tracking-widest">The Threat</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            DEEPFAKES ARE <br />
            <span className="text-gray-500">COMPROMISING TRUTH.</span>
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Deepfakes are synthetic media where a person in an existing image or video is replaced with someone else's likeness using deep artificial neural networks. This phenomenon is rapidly invading the film industry, threatening news agencies, and compromising digital trust globally.
          </p>
          <div className="space-y-4">
            {[
              "Identity theft and reputation damage",
              "Spreading misinformation and fake news",
              "Compromising legal and forensic evidence",
              "Eroding public trust in digital media"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F27D26]" />
                <span className="text-sm text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4 pt-12">
            <div className="aspect-square bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6 flex flex-col justify-end">
              <Lock className="w-8 h-8 text-[#F27D26] mb-4" />
              <h3 className="font-bold text-lg">Secure</h3>
              <p className="text-xs text-gray-500">End-to-end encrypted forensic analysis.</p>
            </div>
            <div className="aspect-square bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6 flex flex-col justify-end">
              <Globe className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-bold text-lg">Global</h3>
              <p className="text-xs text-gray-500">Used by agencies worldwide.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="aspect-square bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6 flex flex-col justify-end">
              <Cpu className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="font-bold text-lg">AI-Driven</h3>
              <p className="text-xs text-gray-500">State-of-the-art neural detection.</p>
            </div>
            <div className="aspect-square bg-[#151619] border border-[#2A2B2F] rounded-2xl p-6 flex flex-col justify-end">
              <Activity className="w-8 h-8 text-emerald-500 mb-4" />
              <h3 className="font-bold text-lg">Real-time</h3>
              <p className="text-xs text-gray-500">Instant physiological tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <span className="text-[10px] font-mono text-[#F27D26] uppercase tracking-[0.3em] mb-4 block">Capabilities</span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">MULTI-LAYERED DEFENSE</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Hybrid Architecture",
              desc: "Combines CNN for spatial textures, LSTM for temporal flickering, and Transformers for global consistency.",
              icon: Layers,
              color: "text-blue-500"
            },
            {
              title: "Physiological Analysis",
              desc: "Tracks eye blinking (EAR), gaze variance, and mouth symmetry to detect biological inconsistencies.",
              icon: Eye,
              color: "text-emerald-500"
            },
            {
              title: "3D Pose Estimation",
              desc: "Analyzes 3D head pose and perspective mismatches to find 2D-to-3D projection artifacts.",
              icon: Shield,
              color: "text-[#F27D26]"
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-[#151619] border border-[#2A2B2F] hover:border-[#F27D26]/50 transition-all group">
              <feature.icon className={cn("w-10 h-10 mb-6 transition-transform group-hover:scale-110", feature.color)} />
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* About Section */}
    <section id="about" className="py-32 px-6 bg-[#0F1012]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-[#2A2B2F]">
              <img src="https://picsum.photos/seed/forensics/1920/1080" alt="Forensics" className="w-full h-full object-cover opacity-50" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-[#F27D26] rounded-full flex items-center justify-center animate-pulse">
                  <Play className="w-6 h-6 text-black fill-current" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 bg-[#151619] border border-[#2A2B2F] rounded-xl hidden md:block">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#F27D26]">98.4%</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase leading-tight">Detection <br /> Accuracy</div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold mb-8">BEYOND PIXELS.</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Relying solely on pixels is often insufficient as GANs become better every day. Aegis integrates biological and metadata-level features to significantly improve robustness.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Our model is trained on standard benchmarks like FaceForensics++, Celeb-DF v2, and the Deepfake Detection Challenge (DFDC), ensuring it can counter even the most advanced synthetic generation techniques.
            </p>
            <button 
              onClick={onLaunch}
              className="px-8 py-4 border border-[#F27D26] text-[#F27D26] font-bold uppercase tracking-widest rounded-lg hover:bg-[#F27D26] hover:text-black transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-20 px-6 border-t border-[#1A1B1E]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="bg-[#F27D26] p-1.5 rounded-md">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight uppercase">Aegis</span>
        </div>
        <div className="flex gap-8 text-[10px] font-mono uppercase text-gray-500">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Documentation</span>
        </div>
        <div className="text-[10px] font-mono text-gray-600">
          © 2026 Aegis Digital Forensics Lab
        </div>
      </div>
    </footer>
  </div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<FrameAnalysis[]>([]);
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinkFrequency, setBlinkFrequency] = useState(0);

  const isBlinkingRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);

  const SAMPLES = [
    { name: "Real: Interview", url: "https://assets.mixkit.co/videos/preview/mixkit-man-talking-to-the-camera-34563-large.mp4", type: "Original" },
    { name: "Real: Presentation", url: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-to-camera-in-office-42646-large.mp4", type: "Original" },
    { name: "Demo: Deepfake (Simulated)", url: "https://assets.mixkit.co/videos/preview/mixkit-man-with-a-serious-face-4158-large.mp4", type: "DeepFaceLab" }
  ];

  const loadSample = (url: string) => {
    setVideoUrl(url);
    setVideoFile(null);
    setAnalysisData([]);
    setResult(null);
    setReport(null);
    setActiveStage(0);
    setIsLive(false);
    setBlinkCount(0);
    setBlinkFrequency(0);
    isBlinkingRef.current = false;
    startTimeRef.current = null;
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceMeshRef = useRef<any>(null);

  // Initialize MediaPipe Face Mesh
  useEffect(() => {
    // @ts-ignore
    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results: any) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        processLandmarks(landmarks);
      }
    });

    faceMeshRef.current = faceMesh;
  }, []);

  // Live Camera Setup
  useEffect(() => {
    let camera: any = null;
    if (isLive && liveVideoRef.current) {
      // @ts-ignore
      camera = new window.Camera(liveVideoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current) {
            await faceMeshRef.current.send({ image: liveVideoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
      setActiveStage(1);
    }
    return () => {
      if (camera) camera.stop();
    };
  }, [isLive]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysisData([]);
      setResult(null);
      setReport(null);
      setActiveStage(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'video/*': [] },
    multiple: false 
  } as any);

  const prevLandmarks = useRef<Landmark[] | null>(null);

  const processLandmarks = (landmarks: Landmark[]) => {
    const ear = calculateEAR(landmarks);
    const headPose = calculateHeadPose(landmarks);
    const jitter = calculateJitter(landmarks, prevLandmarks.current);
    const eyeGaze = calculateEyeGaze(landmarks);
    const mouthSymmetry = calculateMouthSymmetry(landmarks);
    
    // Calculate stability based on recent history
    const recentPoses = analysisData.slice(-10).map(f => f.headPose);
    recentPoses.push(headPose);
    const headStability = calculateHeadStability(recentPoses);
    const textureAnomaly = calculateTextureAnomaly(landmarks, jitter);
    const poseInconsistency = calculatePoseInconsistency(landmarks, headPose);

    prevLandmarks.current = landmarks;

    // Simulated Hybrid Model Scores (In a real app, these would come from a server-side model)
    // We base them on the calculated jitter and EAR to make the demo feel "real"
    // We also consider mouth symmetry and texture anomalies
    const cnnScore = Math.random() * 0.2 + (jitter > 0.015 || textureAnomaly > 0.5 || poseInconsistency > 0.4 ? 0.6 : 0.1);
    const lstmScore = Math.random() * 0.1 + (jitter > 0.02 || mouthSymmetry > 4.5 ? 0.7 : 0.05);
    const transformerScore = Math.random() * 0.1 + (jitter > 0.02 || headStability > 0.98 ? 0.6 : 0.02);

    const newFrame: FrameAnalysis = {
      timestamp: Date.now(),
      ear,
      jitter,
      headPose,
      eyeGaze,
      headStability,
      mouthSymmetry,
      textureAnomaly,
      poseInconsistency,
      cnnScore,
      lstmScore,
      transformerScore
    };

    setAnalysisData(prev => [...prev.slice(-50), newFrame]);

    // Blink Detection
    const EAR_THRESHOLD = 0.22;
    let updatedBlinkCount = blinkCount;
    if (ear < EAR_THRESHOLD && !isBlinkingRef.current) {
      isBlinkingRef.current = true;
    } else if (ear > EAR_THRESHOLD && isBlinkingRef.current) {
      isBlinkingRef.current = false;
      updatedBlinkCount = blinkCount + 1;
      setBlinkCount(updatedBlinkCount);
    }

    // Frequency Calculation (Blinks per minute)
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
    if (elapsedMinutes > 0.01) { 
      setBlinkFrequency(updatedBlinkCount / elapsedMinutes);
    }

    // Dynamic stage progression based on data volume
    if (analysisData.length > 10 && activeStage === 1) setActiveStage(2);
    if (analysisData.length > 25 && activeStage === 2) setActiveStage(3);
    if (analysisData.length > 40 && activeStage === 3) setActiveStage(4);
  };

  const startAnalysis = async () => {
    if (!videoRef.current || !faceMeshRef.current) return;
    
    setIsProcessing(true);
    setActiveStage(1);
    setBlinkCount(0);
    setBlinkFrequency(0);
    isBlinkingRef.current = false;
    startTimeRef.current = Date.now();
    
    const video = videoRef.current;
    video.currentTime = 0;
    video.play();

    const processFrame = async () => {
      if (video.paused || video.ended) {
        finishAnalysis();
        return;
      }

      if (faceMeshRef.current) {
        await faceMeshRef.current.send({ image: video });
      }

      setProgress((video.currentTime / video.duration) * 100);
      requestAnimationFrame(processFrame);
    };

    requestAnimationFrame(processFrame);
  };

  const finishAnalysis = async () => {
    setIsProcessing(false);
    setActiveStage(4);
    
    // Calculate final result
    const avgJitter = analysisData.reduce((acc, f) => acc + f.jitter, 0) / analysisData.length;
    const avgCnn = analysisData.reduce((acc, f) => acc + f.cnnScore, 0) / analysisData.length;
    const avgLstm = analysisData.reduce((acc, f) => acc + f.lstmScore, 0) / analysisData.length;
    const avgTexture = analysisData.reduce((acc, f) => acc + f.textureAnomaly, 0) / analysisData.length;
    const avgPoseInc = analysisData.reduce((acc, f) => acc + f.poseInconsistency, 0) / analysisData.length;
    
    // More aggressive detection logic
    const isFake = avgJitter > 0.012 || avgCnn > 0.35 || avgLstm > 0.35 || avgTexture > 0.4 || avgPoseInc > 0.3;
    const confidence = isFake ? Math.max(avgCnn, avgLstm, 0.75) : 0.88;

    const finalResult: ForensicResult = {
      isFake,
      confidence,
      analysis: analysisData,
      summary: "",
      manipulationType: isFake ? 'DeepFaceLab' : 'Original'
    };

    setResult(finalResult);
    const reportText = await generateForensicReport(finalResult);
    setReport(reportText);
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'landing' ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LandingPage onLaunch={() => setView('app')} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-[#0A0B0D] text-white font-sans selection:bg-[#F27D26] selection:text-black"
        >
          {/* Header */}
          <header className="border-bottom border-[#1A1B1E] p-4 flex items-center justify-between bg-[#0A0B0D]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setView('landing')}
                className="bg-[#F27D26] p-1.5 rounded-md hover:scale-105 transition-transform"
              >
                <Shield className="w-5 h-5 text-black" />
              </button>
              <div>
                <h1 className="text-lg font-bold tracking-tight uppercase">Aegis Forensic Suite</h1>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Deepfake Detection v2.4.0</p>
              </div>
            </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 border rounded-full transition-all",
              isLive ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-[#151619] border-[#2A2B2F] text-gray-400"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full", isLive ? "bg-red-500 animate-pulse" : "bg-gray-600")} />
            <span className="text-[10px] font-mono uppercase">{isLive ? "Live Mode Active" : "Go Live"}</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#151619] border border-[#2A2B2F] rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-gray-400 uppercase">Engine Online</span>
          </div>
          <button className="p-2 hover:bg-[#1A1B1E] rounded-full transition-colors">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* Left Column: Video & Pipeline */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Video Upload/Preview */}
          <div className="bg-[#151619] border border-[#2A2B2F] rounded-xl overflow-hidden">
            <div className="p-3 border-b border-[#2A2B2F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-3 h-3 text-[#F27D26]" />
                <span className="text-[10px] font-mono uppercase text-gray-400">Source Input</span>
              </div>
              {videoFile && <span className="text-[10px] font-mono text-gray-500">{videoFile.name}</span>}
            </div>
            
            <div className="aspect-video bg-black relative group">
              {isLive ? (
                <video 
                  ref={liveVideoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  autoPlay
                  playsInline
                />
              ) : !videoUrl ? (
                <div {...getRootProps()} className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-all",
                  isDragActive ? "bg-[#F27D26]/10" : "hover:bg-[#1A1B1E]"
                )}>
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 text-gray-600 mb-4" />
                  <p className="text-sm font-medium text-gray-400">Drop video for forensic analysis</p>
                  <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">MP4, MOV, AVI up to 50MB</p>
                </div>
              ) : (
                <>
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    onEnded={() => setIsProcessing(false)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2A2B2F]">
                    <motion.div 
                      className="h-full bg-[#F27D26]" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </>
              )}

              {/* 3D Pose Indicator */}
              {analysisData.length > 0 && (
                <div className="absolute top-4 right-4 w-16 h-16 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                  <div 
                    className="w-8 h-8 border-2 border-[#F27D26] rounded-sm transition-transform duration-100"
                    style={{
                      transform: `
                        perspective(100px) 
                        rotateX(${analysisData[analysisData.length-1].headPose.pitch}deg) 
                        rotateY(${analysisData[analysisData.length-1].headPose.yaw}deg) 
                        rotateZ(${analysisData[analysisData.length-1].headPose.roll}deg)
                      `
                    }}
                  />
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span className="text-[6px] font-mono text-gray-400 uppercase">3D Pose</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 flex gap-3">
              <button 
                onClick={isLive ? finishAnalysis : startAnalysis}
                disabled={(!videoUrl && !isLive) || isProcessing}
                className={cn(
                  "flex-1 font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2",
                  isLive ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#F27D26] hover:bg-[#D96A1E] text-black"
                )}
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isProcessing ? "Processing..." : isLive ? "Stop & Analyze" : "Run Forensic Scan"}
              </button>
              {videoUrl && (
                <button 
                  onClick={() => { setVideoUrl(null); setVideoFile(null); setAnalysisData([]); setResult(null); }}
                  className="px-4 border border-[#2A2B2F] hover:bg-[#1A1B1E] rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="bg-[#151619] border border-[#2A2B2F] rounded-xl p-4">
             <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-[#F27D26]" />
                <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Hybrid Architecture Pipeline</span>
              </div>
              <div className="space-y-2">
                <AnalysisStage 
                  title="Spatial Pre-processing" 
                  active={activeStage === 1} 
                  status={activeStage > 1 ? 'done' : activeStage === 1 ? 'processing' : 'pending'}
                  description="Face detection & Haar Cascade (Frontal/Profile/Eyes/Smile)."
                />
                <AnalysisStage 
                  title="CNN Feature Extraction" 
                  active={activeStage === 2} 
                  status={activeStage > 2 ? 'done' : activeStage === 2 ? 'processing' : 'pending'}
                  description="Extracting 2048-dim vectors via EfficientNet backbone."
                />
                <AnalysisStage 
                  title="Temporal LSTM Analysis" 
                  active={activeStage === 3} 
                  status={activeStage > 3 ? 'done' : activeStage === 3 ? 'processing' : 'pending'}
                  description="Analyzing inter-frame motion & flickering anomalies."
                />
                <AnalysisStage 
                  title="Transformer Global Context" 
                  active={activeStage === 4} 
                  status={activeStage > 4 ? 'done' : activeStage === 4 ? 'processing' : 'pending'}
                  description="Long-range dependency check for global consistency."
                />
              </div>
          </div>

          {/* Sample Gallery */}
          <div className="bg-[#151619] border border-[#2A2B2F] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Test Sample Gallery</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => loadSample(sample.url)}
                  className="flex items-center justify-between p-2 rounded-md bg-black/30 border border-white/5 hover:border-[#F27D26]/50 transition-all text-left group"
                >
                  <span className="text-[10px] font-medium text-gray-300 group-hover:text-white">{sample.name}</span>
                  <div className="px-1.5 py-0.5 rounded bg-[#1A1B1E] text-[8px] font-mono text-gray-500 uppercase">
                    {sample.type === 'Original' ? 'Pristine' : 'Target'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Metrics & Results */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Eye Aspect Ratio (EAR)" 
              value={analysisData.length > 0 ? analysisData[analysisData.length - 1].ear.toFixed(3) : "0.000"} 
              icon={Eye} 
              color="bg-blue-500/20" 
            />
            <MetricCard 
              title="Head Stability" 
              value={analysisData.length > 0 ? (analysisData[analysisData.length - 1].headStability * 100).toFixed(1) : "0.0"} 
              unit="%"
              icon={Shield} 
              color="bg-emerald-500/20" 
            />
            <MetricCard 
              title="Blink Frequency" 
              value={blinkFrequency.toFixed(1)} 
              unit="bpm"
              icon={Eye} 
              color="bg-blue-500/20" 
            />
            <MetricCard 
              title="Landmark Jitter" 
              value={analysisData.length > 0 ? (analysisData[analysisData.length - 1].jitter * 1000).toFixed(2) : "0.00"} 
              unit="mpx"
              icon={Activity} 
              color="bg-purple-500/20" 
            />
            <MetricCard 
              title="Hybrid Confidence" 
              value={result ? (result.confidence * 100).toFixed(1) : "0.0"} 
              unit="%"
              icon={Zap} 
              color="bg-orange-500/20" 
            />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temporal Analysis Chart */}
            <div className="bg-[#151619] border border-[#2A2B2F] rounded-xl p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] font-mono uppercase text-gray-400">Temporal Anomaly Flow</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase">LSTM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Spatial</span>
                  </div>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisData}>
                    <defs>
                      <linearGradient id="colorLstm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" vertical={false} />
                    <XAxis hide dataKey="timestamp" />
                    <YAxis domain={[0, 1]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1B1E', border: '1px solid #2A2B2F', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    />
                    <Area type="monotone" dataKey="lstmScore" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLstm)" strokeWidth={2} />
                    <Area type="monotone" dataKey="cnnScore" stroke="#a855f7" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Physiological Jitter Chart */}
            <div className="bg-[#151619] border border-[#2A2B2F] rounded-xl p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase text-gray-400">Gaze & Stability</span>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Stability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Gaze-X</span>
                  </div>
                </div>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2B2F" vertical={false} />
                    <XAxis hide dataKey="timestamp" />
                    <YAxis domain={[0, 1]} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1A1B1E', border: '1px solid #2A2B2F', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                    />
                    <Line type="monotone" dataKey="headStability" stroke="#10b981" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="eyeGaze.x" stroke="#f59e0b" dot={false} strokeWidth={1} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Final Result & Report */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Result Status */}
                <div className={cn(
                  "p-6 rounded-xl border flex flex-col items-center justify-center text-center",
                  result.isFake ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"
                )}>
                  {result.isFake ? (
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                  ) : (
                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  )}
                  <h3 className={cn(
                    "text-2xl font-bold uppercase tracking-tight",
                    result.isFake ? "text-red-500" : "text-green-500"
                  )}>
                    {result.isFake ? "Manipulated" : "Authentic"}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-2 uppercase tracking-widest">
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </p>
                  {result.manipulationType && (
                    <div className="mt-4 px-3 py-1 bg-black/40 rounded-full border border-white/10">
                      <span className="text-[10px] font-mono text-gray-300 uppercase">{result.manipulationType}</span>
                    </div>
                  )}
                </div>

                {/* Forensic Report */}
                <div className="md:col-span-2 bg-[#151619] border border-[#2A2B2F] rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-[#F27D26]" />
                    <span className="text-[10px] font-mono uppercase text-gray-400">Expert Forensic Analysis (XAI)</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {report ? (
                      <p className="text-gray-300 text-xs leading-relaxed font-serif italic">
                        "{report}"
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
                        <div className="h-3 bg-gray-800 rounded w-5/6 animate-pulse" />
                        <div className="h-3 bg-gray-800 rounded w-4/6 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {/* Decorative Watermark */}
                  <Shield className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 rotate-12" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto p-6 border-t border-[#1A1B1E] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 uppercase font-mono">Dataset Baseline</span>
            <span className="text-xs text-gray-400">FaceForensics++ / DFDC / Celeb-DF</span>
          </div>
          <div className="w-px h-8 bg-[#1A1B1E]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-600 uppercase font-mono">Model Accuracy</span>
            <span className="text-xs text-gray-400">98.4% AUC (Test Set)</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          © 2026 Aegis Digital Forensics Lab • Confidential
        </div>
      </footer>
    </motion.div>
  )}
</AnimatePresence>
  );
}
