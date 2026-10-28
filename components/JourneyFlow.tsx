"use client";

import { useEffect, useRef } from "react";

type JourneyStep = readonly [title: string, description: string];

export default function JourneyFlow({ steps }: { steps: readonly JourneyStep[] }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootElement = root.current;
    const canvasElement = canvas.current;
    if (!rootElement || !canvasElement) return;

    let disposed = false;
    let loading = false;
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let three: typeof import("three") | undefined;
    let renderer: import("three").WebGLRenderer | undefined;
    let animationFrame = 0;
    let curve: import("three").CatmullRomCurve3 | undefined;
    let tube: import("three").Mesh | undefined;
    let arrow: import("three").Mesh | undefined;
    let upDirection: import("three").Vector3 | undefined;
    let tubeMaterial: import("three").MeshStandardMaterial | undefined;
    let arrowMaterial: import("three").MeshStandardMaterial | undefined;
    let camera: import("three").OrthographicCamera | undefined;
    let scene: import("three").Scene | undefined;
    let currentProgress = 0;
    let layoutKey = "";
    let resizeObserver: ResizeObserver | undefined;

    const clearAnimation = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const renderArrowAt = (progress: number) => {
      if (!curve || !arrow || !upDirection || !renderer || !scene || !camera || !Number.isFinite(progress)) return false;
      const sampleProgress = Math.min(Math.max(progress, 0), 1);
      const position = curve.getPoint(sampleProgress);
      const tangent = curve.getTangent(sampleProgress);
      if (
        ![position.x, position.y, position.z, tangent.x, tangent.y, tangent.z].every(Number.isFinite) ||
        tangent.lengthSq() === 0
      ) {
        return false;
      }

      arrow.position.copy(position);
      arrow.quaternion.setFromUnitVectors(upDirection, tangent);
      renderer.render(scene, camera);
      return true;
    };

    const updateLayout = () => {
      if (!three || !renderer || !scene || !camera) return;
      const bounds = rootElement.getBoundingClientRect();
      const markers = Array.from(rootElement.querySelectorAll<HTMLElement>("[data-journey-node]"));
      if (bounds.width === 0 || bounds.height === 0 || markers.length < 2) return;

      const key = `${bounds.width}:${bounds.height}:${markers.map((marker) => {
        const rect = marker.getBoundingClientRect();
        return `${rect.left}:${rect.top}`;
      }).join("|")}`;
      if (layoutKey === key) return;
      layoutKey = key;

      renderer.setSize(bounds.width, bounds.height, false);
      camera.left = -bounds.width / 2;
      camera.right = bounds.width / 2;
      camera.top = bounds.height / 2;
      camera.bottom = -bounds.height / 2;
      camera.updateProjectionMatrix();

      const THREE = three;
      if (disposed || !THREE || !renderer || !scene) return;
      const points = markers.map((marker) => {
        const rect = marker.getBoundingClientRect();
        return new THREE.Vector3(
          rect.left + rect.width / 2 - bounds.left - bounds.width / 2,
          bounds.height / 2 - (rect.top + rect.height / 2 - bounds.top),
          0,
        );
      });
      if (points.length < 2 || points.some((point) => ![point.x, point.y, point.z].every(Number.isFinite))) {
        curve = undefined;
        rootElement.removeAttribute("data-animated");
        return;
      }

      if (tube) {
        scene.remove(tube);
        tube.geometry.dispose();
        tubeMaterial?.dispose();
      }
      curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
      tubeMaterial = new THREE.MeshStandardMaterial({ color: "#b8541f", roughness: 0.48, metalness: 0.12, transparent: true, opacity: 0.52 });
      tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(64, points.length * 24), 1.25, 8, false),
        tubeMaterial,
      );
      scene.add(tube);
      rootElement.dataset.animated = "true";
      if (!renderArrowAt(currentProgress)) {
        rootElement.removeAttribute("data-animated");
      }
    };

    const animate = (time: number) => {
      if (disposed || reducedMotion.matches || !curve || !arrow || !upDirection || !renderer || !scene || !camera) return;
      const elapsed = time - startedAt;
      if (!Number.isFinite(elapsed)) {
        clearAnimation();
        rootElement.removeAttribute("data-animated");
        return;
      }
      currentProgress = (((elapsed % 10000) + 10000) % 10000) / 10000;
      if (!renderArrowAt(currentProgress)) {
        clearAnimation();
        rootElement.removeAttribute("data-animated");
        return;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    let startedAt = 0;
    const start = async () => {
      if (disposed || loading || renderer || reducedMotion.matches) return;
      loading = true;
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch (error) {
        loading = false;
        console.warn("Three.js journey animation could not load; static step arrows remain visible.", error);
        return;
      }
      if (disposed || reducedMotion.matches) {
        loading = false;
        return;
      }
      three = THREE;

      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch (error) {
        loading = false;
        console.warn("Three.js journey animation unavailable; static step arrows remain visible.", error);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      canvasElement.replaceChildren(renderer.domElement);
      upDirection = new THREE.Vector3(0, 1, 0);
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.position.z = 40;
      scene.add(new THREE.AmbientLight(0xffffff, 2.2));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2);
      keyLight.position.set(-15, 20, 30);
      scene.add(keyLight);

      arrowMaterial = new THREE.MeshStandardMaterial({ color: "#b8541f", roughness: 0.3, metalness: 0.2 });
      arrow = new THREE.Mesh(new THREE.ConeGeometry(4.5, 13, 12), arrowMaterial);
      arrow.position.z = 2;
      scene.add(arrow);

      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(updateLayout);
        resizeObserver.observe(rootElement);
        rootElement.querySelectorAll("[data-journey-node]").forEach((marker) => resizeObserver?.observe(marker));
      }
      window.addEventListener("resize", updateLayout);
      updateLayout();
      loading = false;
      startedAt = performance.now();
      animationFrame = requestAnimationFrame(animate);
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) {
        clearAnimation();
      } else if (renderer) {
        startedAt = performance.now() - currentProgress * 10000;
        animationFrame = requestAnimationFrame(animate);
      } else {
        void start().catch((error) => {
          loading = false;
          console.warn("Three.js journey animation could not initialize; static step arrows remain visible.", error);
        });
      }
    };

    reducedMotion.addEventListener("change", onMotionChange);
    void start().catch((error) => {
      loading = false;
      console.warn("Three.js journey animation could not initialize; static step arrows remain visible.", error);
    });

    return () => {
      disposed = true;
      clearAnimation();
      reducedMotion.removeEventListener("change", onMotionChange);
      window.removeEventListener("resize", updateLayout);
      resizeObserver?.disconnect();
      if (tube) {
        tube.geometry.dispose();
        tubeMaterial?.dispose();
      }
      if (arrow) {
        arrow.geometry.dispose();
        arrowMaterial?.dispose();
      }
      renderer?.dispose();
      canvasElement.replaceChildren();
    };
  }, []);

  return (
    <div ref={root} className="journey-flow relative">
      <div ref={canvas} aria-hidden="true" className="journey-canvas pointer-events-none absolute inset-0 z-0" />
      <ol className="journey-steps relative z-10 grid gap-5 md:grid-cols-5">
        {steps.map(([title, description], index) => (
          <li key={title} className="journey-step relative flex items-start gap-4 md:block">
            <span data-journey-node className="journey-node relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra font-serif text-lg font-bold text-white shadow">
              {index + 1}
            </span>
            <div className="min-w-0 md:mt-3">
              <b className="block">{title}</b>
              <p className="mt-1 text-sm text-mute">{description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
