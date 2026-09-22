import { Billboard, Float, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const particleVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  attribute float aSpeed;
  attribute float aOffset;
  varying float vGlow;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec3 p = position;
    float motion = uTime * aSpeed;
    p.xz *= rotate2d(motion + aOffset);
    p.xy *= rotate2d(motion * 0.37 - aOffset * 0.4);
    float wave = sin(uTime * 7.0 + aOffset * 9.0) * 0.5 + sin(uTime * 12.7 + aOffset * 3.0) * 0.5;
    p *= 1.0 + wave * (0.012 + uEnergy * 0.075);
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (2.2 + uEnergy * 1.6) * (8.0 / max(1.0, -mvPosition.z));
    vGlow = 0.55 + 0.45 * sin(aOffset * 20.0 + uTime * 2.0);
  }
`;

const particleFragmentShader = /* glsl */ `
  varying float vGlow;
  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float strength = 1.0 - smoothstep(0.08, 0.5, length(point));
    gl_FragColor = vec4(1.0, 0.36, 0.04, strength * (0.35 + vGlow * 0.65));
  }
`;

function DenseParticleCloud({ phase }) {
  const material = useRef(null);
  const cloud = useRef(null);
  // Optimized from 260,000 to 26,000 particles (10x performance boost while keeping dense visual volume)
  const count = 26_000;
  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const offsets = new Float32Array(count);
    let seed = 73129;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < count; i += 1) {
      const u = random() * 2 - 1;
      const theta = random() * Math.PI * 2;
      const ringBias = Math.pow(random(), 0.58);
      const radius = 0.86 + ringBias * 2.35;
      const planar = Math.sqrt(1 - u * u);
      positions[i * 3] = Math.cos(theta) * planar * radius;
      positions[i * 3 + 1] = u * radius * (0.58 + random() * 0.42);
      positions[i * 3 + 2] = Math.sin(theta) * planar * radius;
      speeds[i] = 0.035 + random() * 0.22;
      offsets[i] = random() * Math.PI * 2;
    }
    return { positions, speeds, offsets };
  }, []);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    if (material.current) {
      const uniforms = material.current.uniforms;
      if (uniforms?.uTime) {
        uniforms.uTime.value = clock.elapsedTime;
      }
      if (uniforms?.uEnergy) {
        uniforms.uEnergy.value = THREE.MathUtils.damp(
          uniforms.uEnergy.value,
          phase === "speaking" ? 1 : phase === "thinking" || phase === "listening" ? 0.55 : 0,
          7,
          delta,
        );
      }
    }
    if (cloud.current) cloud.current.rotation.y += delta * (phase === "idle" ? 0.025 : 0.08);
  });

  return (
    <points ref={cloud} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSpeed" args={[speeds, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={particleVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={{ uTime: { value: 0 }, uEnergy: { value: 0 } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

const TRAIL_POINTS = 36;

function Orbit({ radius, tilt, speed, phase, offset }) {
  const electron = useRef(null);
  const trail = useRef(null);
  const positions = useMemo(() => new Float32Array(TRAIL_POINTS * 3), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempEuler = useMemo(() => new THREE.Euler(...tilt), [tilt]);

  useFrame(({ clock }, delta) => {
    const multiplier = phase === "idle" ? 1 : phase === "speaking" ? 2.1 : 2.8;
    const a = clock.elapsedTime * speed * multiplier + offset;
    tempVec.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    tempVec.applyEuler(tempEuler);

    if (electron.current) {
      electron.current.position.copy(tempVec);
      electron.current.scale.setScalar(1 + Math.sin(a * 2) * 0.12);
    }

    // Zero-allocation buffer shift (native typed array copy - prevents GC pauses)
    positions.copyWithin(3, 0, (TRAIL_POINTS - 1) * 3);
    positions[0] = tempVec.x;
    positions[1] = tempVec.y;
    positions[2] = tempVec.z;

    const attr = trail.current?.geometry.getAttribute("position");
    if (attr) attr.needsUpdate = true;

    if (trail.current) trail.current.rotation.y += delta * 0.03;
  });

  return (
    <group>
      <mesh rotation={tilt}>
        <torusGeometry args={[radius, 0.008, 6, 96]} />
        <meshBasicMaterial color="orange" transparent opacity={0.38} blending={THREE.AdditiveBlending} />
      </mesh>
      <points ref={trail}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="orange" size={0.035} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <mesh ref={electron}>
        <sphereGeometry args={[0.075, 14, 14]} />
        <meshBasicMaterial color="white" toneMapped={false} />
        <pointLight color="orange" intensity={0.8} distance={2.5} />
      </mesh>
    </group>
  );
}

function Atom({ phase }) {
  const atom = useRef(null);
  const isListening = phase === "listening";

  useFrame(({ clock, pointer }, rawDelta) => {
    if (!atom.current) return;
    const delta = Math.min(rawDelta, 0.05);
    atom.current.rotation.y += delta * (phase === "idle" ? 0.08 : isListening ? 0.35 : 0.2);
    const speechWave =
      Math.sin(clock.elapsedTime * 8.2) * 0.55 +
      Math.sin(clock.elapsedTime * 13.7) * 0.3 +
      Math.sin(clock.elapsedTime * 21.1) * 0.15;
    const pulse =
      isListening
        ? 0.55 + Math.sin(clock.elapsedTime * 4.2) * 0.09
        : phase === "speaking"
        ? 0.2 + Math.max(0, speechWave) * 0.14
        : phase === "thinking"
        ? 0.12 + Math.sin(clock.elapsedTime * 6.0) * 0.05
        : Math.sin(clock.elapsedTime * 2.2) * 0.018;
    const targetScale = 1 + pulse;
    const scale = THREE.MathUtils.damp(
      atom.current.scale.x,
      targetScale,
      isListening ? 7 : 5,
      delta,
    );
    atom.current.scale.setScalar(scale);
    const wobbleX = pointer.y * 0.32 + Math.sin(clock.elapsedTime * 1.6) * 0.025;
    const wobbleZ = -pointer.x * 0.24 + Math.cos(clock.elapsedTime * 1.3) * 0.02;
    atom.current.rotation.x = THREE.MathUtils.damp(atom.current.rotation.x, wobbleX, 5.5, delta);
    atom.current.rotation.z = THREE.MathUtils.damp(atom.current.rotation.z, wobbleZ, 5.5, delta);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.12}>
      <group ref={atom}>
        <mesh>
          <icosahedronGeometry args={[0.72, 4]} />
          <meshStandardMaterial
            color={isListening ? "#00f3ff" : "orange"}
            emissive={isListening ? "#00f3ff" : "orange"}
            emissiveIntensity={isListening ? 4.5 : 3.5}
            roughness={0.2}
          />
        </mesh>
        <mesh scale={1.35}>
          <sphereGeometry args={[0.72, 24, 24]} />
          <meshBasicMaterial
            color={isListening ? "#00f3ff" : "orange"}
            wireframe
            transparent
            opacity={isListening ? 0.3 : 0.16}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <pointLight
          color={isListening ? "#00f3ff" : "orange"}
          intensity={isListening ? 22 : 10}
          distance={isListening ? 12 : 7}
          decay={2}
        />
        <DenseParticleCloud phase={phase} />
        <Orbit radius={2.2} tilt={[0.35, 0.1, 0.2]} speed={0.7} phase={phase} offset={0} />
        <Orbit radius={2.65} tilt={[1.1, 0.25, 0.55]} speed={0.52} phase={phase} offset={1.7} />
        <Orbit radius={2.38} tilt={[0.55, 1.2, -0.3]} speed={0.9} phase={phase} offset={3.2} />
        <Orbit radius={3.0} tilt={[1.45, -0.25, 0.9]} speed={0.43} phase={phase} offset={4.5} />
        <Sparkles count={75} scale={6} size={1.4} speed={0.25} color={isListening ? "#00f3ff" : "orange"} opacity={0.72} />
      </group>
    </Float>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    // Narrow portrait mobile screens (aspect ratio < 0.7)
    if (aspect < 0.7) {
      camera.position.set(0, 0.25, 12.5);
      camera.fov = 45;
    } else if (aspect < 1.05) {
      // Tablet portrait / square screens
      camera.position.set(0, 0.35, 10.2);
      camera.fov = 43;
    } else if (size.height < 520) {
      // Mobile landscape (very limited height)
      camera.position.set(0, 0.1, 9.0);
      camera.fov = 36;
    } else {
      // Standard desktop wide
      camera.position.set(0, 0.4, 8.5);
      camera.fov = 42;
    }
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

export function JarvisAtom({ phase = "idle", onAtomClick }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      onClick={onAtomClick}
      dpr={[1, 1.25]}
      camera={{ position: [0, 0.4, 8.5], fov: 42 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
    >
      <ResponsiveCamera />
      <ambientLight intensity={0.35} />
      <Atom phase={reducedMotion ? "idle" : phase} />
      <Billboard position={[0, -3.35, 0]}>
        <mesh>
          <ringGeometry args={[2.1, 2.12, 64]} />
          <meshBasicMaterial color="orange" transparent opacity={0.18} />
        </mesh>
      </Billboard>
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={5}
        maxDistance={15}
        autoRotate={!reducedMotion && phase === "idle"}
        autoRotateSpeed={0.25}
        dampingFactor={0.07}
        enableDamping
      />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.8} luminanceThreshold={0.12} luminanceSmoothing={0.75} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
