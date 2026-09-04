/**
 * WebCodecs GPU-Accelerated AV1 Video Encoder
 * Fast client-side video re-encoding using browser-native hardware codecs
 */
import { Muxer as Mp4Muxer, ArrayBufferTarget as Mp4ArrayBufferTarget } from "mp4-muxer";
import { Muxer as WebmMuxer, ArrayBufferTarget as WebmArrayBufferTarget } from "webm-muxer";

/**
 * Detect if the device is a mobile or tablet device
 */
export function isMobileDevice() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return true;
  // 1. User-Agent Client Hints
  if (navigator.userAgentData?.mobile) return true;
  // 2. UA string regex
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile|Silk|Kindle/i.test(ua)) return true;
  // 3. iPadOS 13+ desktop-mode Safari
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  // 4. Touch points & screen size heuristic
  if (window.matchMedia && window.matchMedia("(pointer: coarse) and (max-width: 1024px)").matches) {
    return true;
  }
  return false;
}

/**
 * Get GPU hardware renderer string via WebGL debug extension or WebGPU
 */
export async function getGpuInfo() {
  if (typeof window === "undefined") return { raw: "Unknown", cleanName: "Unknown", vendor: "Unknown" };

  let renderer = "";
  let vendor = "";

  // 1. Try WebGPU if available
  try {
    if ("gpu" in navigator) {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter && adapter.info) {
        vendor = adapter.info.vendor || "";
        renderer = `${adapter.info.vendor || ""} ${adapter.info.architecture || ""} ${adapter.info.device || ""}`.trim();
      }
    }
  } catch (e) {}

  // 2. Try WebGL debug renderer info (standard)
  if (!renderer || renderer === "Unknown") {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        if (dbg) {
          renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "";
          vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || "";
        }
      }
    } catch (e) {}
  }

  // Format clean GPU name (e.g. remove ANGLE, D3D11 wrappers)
  let cleanName = renderer;
  const match = renderer.match(/(NVIDIA\s+GeForce\s+[^,()]+|AMD\s+Radeon\s+[^,()]+|Intel\s+Arc\s+[^,()]+|Intel\s+Core\s+[^,()]+|Apple\s+M\d+[^,()]*)/i);
  if (match) {
    cleanName = match[1].trim();
  }

  return {
    raw: renderer,
    cleanName: cleanName || renderer || "Generic GPU",
    vendor,
  };
}

/**
 * Check if the browser and GPU strictly support hardware AV1 encoding via WebCodecs
 */
export async function checkAv1EncoderSupport() {
  // 1. Mobile devices are strictly excluded
  if (isMobileDevice()) {
    return { supported: false, isHardware: false, isMobile: true, reason: "Mobile device excluded" };
  }

  const gpuInfo = await getGpuInfo();

  if (typeof window === "undefined" || !("VideoEncoder" in window)) {
    return { supported: false, isHardware: false, gpuInfo, reason: "WebCodecs VideoEncoder not available" };
  }

  // 2. Strictly check PHYSICAL GPU hardware acceleration (require-hardware)
  // Rejects software codecs, old Radeons (RX 6000 and earlier), old GeForces (RTX 30 and earlier), etc.
  const testConfigs = [
    {
      codec: "av01.0.04M.08", // AV1 Main Profile, Level 2.0, 8-bit
      width: 1280,
      height: 720,
      bitrate: 2_500_000,
      framerate: 30,
      hardwareAcceleration: "require-hardware",
    },
    {
      codec: "av01.0.05M.08",
      width: 1280,
      height: 720,
      bitrate: 2_500_000,
      framerate: 30,
      hardwareAcceleration: "require-hardware",
    }
  ];

  for (const config of testConfigs) {
    try {
      const support = await VideoEncoder.isConfigSupported(config);
      if (support && support.supported) {
        return {
          supported: true,
          isHardware: true,
          gpuInfo,
          codec: config.codec,
          config: support.config,
        };
      }
    } catch (e) {
      // Hardware encoder not available or config rejected
    }
  }

  return {
    supported: false,
    isHardware: false,
    gpuInfo,
    reason: "No physical AV1 hardware encoder (NVENC 8th / VCN 4.0 / QSV AV1) detected",
  };
}

/**
 * Extract audio from a video file using Web Audio API
 */
async function extractAudioData(file) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const audioCtx = new AudioContextClass();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();

    if (!audioBuffer || audioBuffer.numberOfChannels === 0 || audioBuffer.duration === 0) {
      return null;
    }
    return audioBuffer;
  } catch (err) {
    console.debug("No audio track detected or audio decode skipped:", err);
    return null;
  }
}

/**
 * Encode an AudioBuffer to AAC chunks (for MP4) using AudioEncoder
 */
async function encodeAudioToAac(audioBuffer, onChunk) {
  if (!("AudioEncoder" in window)) return false;

  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 2); // stereo max
  const bitrate = 128_000;

  const config = {
    codec: "mp4a.40.2", // AAC-LC
    sampleRate,
    numberOfChannels,
    bitrate,
  };

  try {
    const support = await AudioEncoder.isConfigSupported(config);
    if (!support || !support.supported) {
      console.warn("AAC AudioEncoder not supported, audio will be omitted");
      return false;
    }

    const encoder = new AudioEncoder({
      output: (chunk, meta) => {
        onChunk(chunk, meta);
      },
      error: (e) => {
        console.error("AudioEncoder error:", e);
      },
    });

    encoder.configure(config);

    // Feed AudioData in chunks of 1024 samples
    const frameSize = 1024;
    const totalSamples = audioBuffer.length;
    let offset = 0;

    while (offset < totalSamples) {
      const length = Math.min(frameSize, totalSamples - offset);
      const audioData = new AudioData({
        format: "f32-planar",
        sampleRate,
        numberOfFrames: length,
        numberOfChannels,
        timestamp: Math.round((offset / sampleRate) * 1_000_000), // microseconds
        data: (() => {
          // Flatten channels
          const buffer = new Float32Array(length * numberOfChannels);
          for (let ch = 0; ch < numberOfChannels; ch++) {
            const channelData = audioBuffer.getChannelData(ch).subarray(offset, offset + length);
            buffer.set(channelData, ch * length);
          }
          return buffer;
        })(),
      });

      encoder.encode(audioData);
      audioData.close();
      offset += length;
    }

    await encoder.flush();
    encoder.close();
    return true;
  } catch (err) {
    console.warn("Audio encoding failed:", err);
    return false;
  }
}

/**
 * Encode video to AV1 MP4 or WebM using WebCodecs GPU acceleration
 * 
 * @param {Object} options
 * @param {File} options.file Input video file
 * @param {number} options.bitrateMbps Target video bitrate in Mbps (e.g. 2.5)
 * @param {string} options.container "mp4" or "webm"
 * @param {number} options.maxDimension Max width/height limit (e.g. 1920 or 0 for original)
 * @param {boolean} options.preserveAudio Whether to keep audio track
 * @param {Function} options.onProgress Progress callback: ({ percent, currentFrame, totalFrames }) => void
 * @returns {Promise<{ blob: Blob, duration: number, width: number, height: number }>}
 */
export async function encodeVideoToAv1({
  file,
  bitrateMbps = 3.0,
  container = "mp4",
  maxDimension = 0,
  preserveAudio = true,
  onProgress = () => {},
}) {
  const support = await checkAv1EncoderSupport();
  if (!support.supported) {
    throw new Error(`AV1 エンコードに対応していません: ${support.reason}`);
  }

  // 1. Load video metadata
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  const videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("動画メタデータの読み込みに失敗しました。"));
  });

  const duration = video.duration || 1;
  let targetWidth = video.videoWidth;
  let targetHeight = video.videoHeight;

  // Scale down if maxDimension is set
  if (maxDimension > 0) {
    const maxSide = Math.max(targetWidth, targetHeight);
    if (maxSide > maxDimension) {
      const scale = maxDimension / maxSide;
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }
  }

  // AV1 encoders require even dimensions
  targetWidth = targetWidth - (targetWidth % 2);
  targetHeight = targetHeight - (targetHeight % 2);

  // Estimate FPS
  const fps = 30; // standard 30fps baseline
  const totalFrames = Math.max(1, Math.round(duration * fps));

  // 2. Extract audio if requested
  let audioBuffer = null;
  let hasAudio = false;
  if (preserveAudio) {
    onProgress({ stage: "audio", percent: 5, message: "音声トラック解析中..." });
    audioBuffer = await extractAudioData(file);
    hasAudio = Boolean(audioBuffer && audioBuffer.numberOfChannels > 0);
  }

  // 3. Setup Muxer
  let muxer = null;
  const isMp4 = container.toLowerCase() === "mp4";
  const targetBuffer = isMp4 ? new Mp4ArrayBufferTarget() : new WebmArrayBufferTarget();

  if (isMp4) {
    muxer = new Mp4Muxer({
      target: targetBuffer,
      video: {
        codec: "av1",
        width: targetWidth,
        height: targetHeight,
      },
      audio: (hasAudio && isMp4) ? {
        codec: "aac",
        numberOfChannels: Math.min(audioBuffer.numberOfChannels, 2),
        sampleRate: audioBuffer.sampleRate,
      } : undefined,
      fastStart: "in-memory",
    });
  } else {
    muxer = new WebmMuxer({
      target: targetBuffer,
      video: {
        codec: "V_AV1",
        width: targetWidth,
        height: targetHeight,
      },
    });
  }

  // 4. Encode Audio (if applicable)
  if (hasAudio && isMp4) {
    onProgress({ stage: "audio", percent: 10, message: "音声をエンコード中 (AAC)..." });
    await encodeAudioToAac(audioBuffer, (chunk, meta) => {
      muxer.addAudioChunk(chunk, meta);
    });
  }

  // 5. Setup VideoEncoder
  let encoderError = null;
  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => {
      muxer.addVideoChunk(chunk, meta);
    },
    error: (err) => {
      console.error("VideoEncoder error:", err);
      encoderError = err;
    },
  });

  const encoderConfig = {
    codec: support.codec || "av01.0.04M.08",
    width: targetWidth,
    height: targetHeight,
    bitrate: Math.round(bitrateMbps * 1_000_000),
    framerate: fps,
    bitrateMode: "variable", // VBR
    latencyMode: "quality",
    hardwareAcceleration: "require-hardware",
  };

  videoEncoder.configure(encoderConfig);

  // 6. Draw video frames to offscreen canvas and feed VideoEncoder
  const canvas = new OffscreenCanvas(targetWidth, targetHeight);
  const ctx = canvas.getContext("2d", { willReadFrequently: false, alpha: false });

  onProgress({ stage: "video", percent: 15, currentFrame: 0, totalFrames, message: "GPU AV1 エンコード中..." });

  const seek = (time) => new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = Math.min(time, duration);
  });

  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      if (encoderError) throw encoderError;

      const currentTime = (frameIndex / fps);
      await seek(currentTime);

      // Draw current video frame scaled
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Create VideoFrame from OffscreenCanvas
      const timestampUs = Math.round(currentTime * 1_000_000);
      const frame = new VideoFrame(canvas, {
        timestamp: timestampUs,
        duration: Math.round((1 / fps) * 1_000_000),
      });

      // Keyframe every 2 seconds (60 frames)
      const isKeyFrame = (frameIndex % (fps * 2)) === 0;
      videoEncoder.encode(frame, { keyFrame: isKeyFrame });
      frame.close();

      const percent = 15 + Math.round((frameIndex / totalFrames) * 80);
      onProgress({
        stage: "video",
        percent,
        currentFrame: frameIndex + 1,
        totalFrames,
        message: `GPU エンコード中 (${frameIndex + 1}/${totalFrames} フレーム)`,
      });
    }

    // Flush remaining frames
    onProgress({ stage: "finalize", percent: 96, message: "ストリーム完了処理中..." });
    await videoEncoder.flush();
    videoEncoder.close();

    // Finalize muxing
    muxer.finalize();
    const resultBuffer = targetBuffer.buffer;
    const mimeType = isMp4 ? "video/mp4" : "video/webm";
    const resultBlob = new Blob([resultBuffer], { type: mimeType });

    onProgress({ stage: "done", percent: 100, message: "完了!" });

    return {
      blob: resultBlob,
      duration,
      width: targetWidth,
      height: targetHeight,
      container: isMp4 ? "mp4" : "webm",
      isHardware: support.isHardware,
    };
  } finally {
    URL.revokeObjectURL(videoUrl);
    video.remove();
  }
}
