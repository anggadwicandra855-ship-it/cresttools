"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Maximize2 } from "lucide-react";
import type { SkyboxFace } from "@/utils/skyboxConverter";

interface SkyboxPreviewProps {
  /** 6 face "ideal" dari converter. */
  faces: Record<SkyboxFace, string> | null;
  /** Panorama asli, fallback sebelum face selesai dihitung. */
  panoramaUrl: string | null;
  autoRotate: boolean;
}

// ------------------------------------------------------------
// Preview pakai CUBEMAP ASLI (samplerCube), bukan 6 plane terpisah.
// GPU nge-filter lintas sisi kubus secara seamless -> garis di tepi hilang.
//
// Arah sampling: (x, y, -z). Dengan flip-Z ini, urutan face WebGL
// [+X, -X, +Y, -Y, +Z, -Z] = [rt, lf, up, dn, ft, bk] tanpa rotasi/flip,
// dan arah depan (-Z) = kamera default (sama kayak Roblox).
// ------------------------------------------------------------
const VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vDir = wp.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAG = /* glsl */ `
  uniform samplerCube tCube;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    gl_FragColor = textureCube(tCube, vec3(d.x, d.y, -d.z));
  }
`;

const disposeMaterial = (mat: THREE.Material) => {
  const sm = mat as THREE.ShaderMaterial;
  if (sm.uniforms) {
    Object.values(sm.uniforms).forEach((u) => {
      const v = (u as { value?: unknown }).value as { dispose?: () => void } | undefined;
      if (v && typeof v.dispose === "function") v.dispose();
    });
  }
  const bm = mat as THREE.MeshBasicMaterial;
  if (bm.map) bm.map.dispose();
  mat.dispose();
};

const disposeMesh = (mesh: THREE.Mesh) => {
  mesh.geometry.dispose();
  const mat = mesh.material;
  if (Array.isArray(mat)) mat.forEach(disposeMaterial);
  else disposeMaterial(mat);
};

const loadCube = (urls: string[]) =>
  new Promise<THREE.CubeTexture>((resolve, reject) => {
    new THREE.CubeTextureLoader().load(urls, resolve, undefined, reject);
  });

export default function SkyboxPreview({ faces, panoramaUrl, autoRotate }: SkyboxPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // ---------- 1. Setup renderer SEKALI (mount) ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      1000
    );
    // Kamera default ngadep -Z = DEPAN
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
    renderer.domElement.style.touchAction = "none";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; // zoom pakai FOV (di bawah), bukan geser kamera
    controls.enablePan = false;
    controls.rotateSpeed = -0.5;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.5;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
      camera.updateProjectionMatrix();
    };
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    sceneRef.current = scene;
    controlsRef.current = controls;

    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener("wheel", onWheel);
      controls.dispose();
      if (meshRef.current) {
        scene.remove(meshRef.current);
        disposeMesh(meshRef.current);
        meshRef.current = null;
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  // ---------- 2. Auto rotate: cukup set flag ----------
  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // ---------- 3. Ganti isi kubus pas face berubah (kamera ga reset) ----------
  useEffect(() => {
    let cancelled = false;

    const swapMesh = (mesh: THREE.Mesh) => {
      const scene = sceneRef.current;
      if (!scene) {
        disposeMesh(mesh);
        return;
      }
      if (meshRef.current) {
        scene.remove(meshRef.current);
        disposeMesh(meshRef.current);
      }
      scene.add(mesh);
      meshRef.current = mesh;
    };

    if (faces) {
      // Urutan WebGL: +X, -X, +Y, -Y, +Z, -Z
      const urls = [faces.rt, faces.lf, faces.up, faces.dn, faces.ft, faces.bk];

      // Load semua dulu, baru tukar mesh -> ga ada kedip hitam
      loadCube(urls)
        .then((tex) => {
          if (cancelled) {
            tex.dispose();
            return;
          }
          // Tampilkan warna apa adanya (tanpa konversi), sama kayak gambar aslinya
          tex.colorSpace = THREE.NoColorSpace;
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;

          const material = new THREE.ShaderMaterial({
            uniforms: { tCube: { value: tex } },
            vertexShader: VERT,
            fragmentShader: FRAG,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
          });
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(500, 500, 500), material);
          mesh.frustumCulled = false;
          mesh.renderOrder = -1;
          swapMesh(mesh);
        })
        .catch((e) => console.error("Gagal load cubemap preview:", e));
    } else if (panoramaUrl) {
      new THREE.TextureLoader().load(
        panoramaUrl,
        (texture) => {
          if (cancelled) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          const geometry = new THREE.SphereGeometry(500, 64, 64);
          geometry.scale(-1, 1, 1);
          geometry.rotateY(-Math.PI / 2); // titik tengah panorama -> depan (-Z)
          swapMesh(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture })));
        },
        undefined,
        (e) => console.error("Gagal load panorama preview:", e)
      );
    }

    return () => {
      cancelled = true;
    };
  }, [faces, panoramaUrl]);

  const isEmpty = !faces && !panoramaUrl;

  return (
    <div className="relative w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
      />
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono text-xs pointer-events-none">
          <Maximize2 className="w-8 h-8 mb-2 opacity-50" />
          Upload panorama untuk inspect hasil 6 sisi
        </div>
      )}
    </div>
  );
}
