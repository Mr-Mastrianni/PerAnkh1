// Physically-based animated hero background (Three.js over a transparent canvas)
// - Soft shadows, contact shadow floor
// - Realistic lighting via HDRI environment
// - Subtle ambient particle animations

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
initHeroScene({ reducedMotion: prefersReducedMotion }).catch((e) => console.warn('Hero scene init failed:', e));

async function initHeroScene({ reducedMotion = false } = {}) {
  const canvas = document.getElementById('hero-canvas');
  const section = document.querySelector('.hero-section');
  if (!canvas || !section) return;
  // Mark hero as 3D-active for CSS adjustments
  section.setAttribute('data-hero3d', 'on');

  // Import Three.js and post-processing modules locally
  let THREE, RGBELoader, EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, FXAAShader;
  try {
    THREE = await import('three');
    ({ RGBELoader } = await import('three/examples/jsm/loaders/RGBELoader.js'));
    ({ EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js'));
    ({ RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js'));
    ({ UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js'));
    ({ ShaderPass } = await import('three/examples/jsm/postprocessing/ShaderPass.js'));
    ({ FXAAShader } = await import('three/examples/jsm/shaders/FXAAShader.js'));
  } catch (e) {
    console.warn('Three.js post-processing unavailable; using basic renderer.', e);
    return initFallback2D(canvas, section);
  }
  console.log('Hero scene: Three.js loaded');

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (e) {
    console.warn('WebGL not supported, falling back to 2D');
    return initFallback2D(canvas, section);
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // Scene
  const scene = new THREE.Scene();
  // Transparent background to blend with CSS gradients
  scene.background = null;
  
  // Add subtle fog for atmospheric depth
  scene.fog = new THREE.Fog(0x1a1a2e, 8, 25);

  // Camera
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0.6, 1.6, 6.5);
  scene.add(camera);

  // Post-processing setup for cinematic effects (after scene/camera creation)
  const composer = new EffectComposer(renderer);
  
  // Base render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  // Bloom pass for golden glow
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.4,   // strength
    0.6,   // radius
    0.85   // threshold
  );
  composer.addPass(bloomPass);
  
  // Anti-aliasing pass for smooth edges
  const fxaaPass = new ShaderPass(FXAAShader);
  fxaaPass.material.uniforms['resolution'].value.x = 1 / window.innerWidth;
  fxaaPass.material.uniforms['resolution'].value.y = 1 / window.innerHeight;
  composer.addPass(fxaaPass);

  // Enhanced Multi-Light Setup for Cinematic Look
  
  // Key light (main directional)
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(-4, 6, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.bias = -0.00015;
  keyLight.shadow.radius = 4;
  const d = 8;
  keyLight.shadow.camera.left = -d;
  keyLight.shadow.camera.right = d;
  keyLight.shadow.camera.top = d;
  keyLight.shadow.camera.bottom = -d;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 30;
  scene.add(keyLight);
  
  // Fill light (softer, opposite side)
  const fillLight = new THREE.DirectionalLight(0xffd4a3, 0.4);
  fillLight.position.set(3, 4, -2);
  scene.add(fillLight);
  
  // Rim light (back light for edge definition)
  const rimLight = new THREE.DirectionalLight(0xd4af37, 0.6);
  rimLight.position.set(0, 2, -8);
  scene.add(rimLight);
  
  // Ambient/hemisphere light for general illumination
  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.3);
  scene.add(hemiLight);

  // Contact shadow floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.35 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.8;
  floor.receiveShadow = true;
  scene.add(floor);

  // Environment (procedural instead of external HDR to avoid CSP issues)
  // Create a simple gradient environment map
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMapSize = 256;
  const envMapCanvas = document.createElement('canvas');
  envMapCanvas.width = envMapSize;
  envMapCanvas.height = envMapSize;
  const envMapCtx = envMapCanvas.getContext('2d');
  
  // Create a subtle gradient that resembles studio lighting
  const gradient = envMapCtx.createLinearGradient(0, 0, 0, envMapSize);
  gradient.addColorStop(0, '#87CEEB'); // Sky blue top
  gradient.addColorStop(0.7, '#DDD8C4'); // Warm mid
  gradient.addColorStop(1, '#8B7355'); // Earth bottom
  envMapCtx.fillStyle = gradient;
  envMapCtx.fillRect(0, 0, envMapSize, envMapSize);
  
  const envMapTexture = new THREE.CanvasTexture(envMapCanvas);
  envMapTexture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envMapTexture;
  pmrem.dispose();

  // Objects group
  const group = new THREE.Group();
  scene.add(group);

  // Ambient floating particles (golden dust)
  const particles = createAmbientParticles(200);
  scene.add(particles);

  function createAmbientParticles(count) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = Math.random() * 3 - 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speeds[i] = 0.1 + Math.random() * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
    
    const material = new THREE.PointsMaterial({
      color: new THREE.Color('#DAA520'),
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      fog: true
    });
    
    const points = new THREE.Points(geometry, material);
    points.userData.speeds = speeds;
    return points;
  }

  // Layout & resize handling
  function applyResponsiveLayout(width, height) {
    const isMobile = width < 768;
    camera.fov = isMobile ? 55 : 40;
    camera.position.set(0.6, isMobile ? 1.2 : 1.6, isMobile ? 7.6 : 6.5);
    camera.updateProjectionMatrix();

    const s = isMobile ? 0.85 : 1.0;
    group.scale.set(s, s, s);
  }

  function resize() {
    const width = section.clientWidth;
    const height = section.clientHeight;
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    applyResponsiveLayout(width, height);
    
    // Update post-processing uniforms
    fxaaPass.material.uniforms['resolution'].value.x = 1 / width;
    fxaaPass.material.uniforms['resolution'].value.y = 1 / height;
    bloomPass.setSize(width, height);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(section);
  window.addEventListener('resize', resize);

  // Visibility handling (pause when offscreen)
  let isVisible = true;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (isVisible = e.isIntersecting));
  }, { threshold: 0.05 });
  io.observe(section);

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const t = clock.getElapsedTime();

    // Animate particles (skip if reduced motion is preferred)
    if (!reducedMotion) {
      const pos = particles.geometry.attributes.position;
      const speeds = particles.userData.speeds;
      
      for (let i = 0; i < speeds.length; i++) {
        // Gentle upward drift with horizontal sway
        pos.array[i * 3 + 1] += speeds[i] * 0.002;
        pos.array[i * 3 + 0] += Math.sin(t * 0.3 + i) * 0.0005;
        
        // Reset particles that drift too high
        if (pos.array[i * 3 + 1] > 3) {
          pos.array[i * 3 + 1] = -0.5;
          pos.array[i * 3 + 0] = (Math.random() - 0.5) * 10;
          pos.array[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
      }
      pos.needsUpdate = true;
    }

    composer.render();
  }
  
  if (reducedMotion) {
    // Render a single high-quality frame
    composer.render();
  } else {
    animate();
  }
}

// 2D fallback: animated radial gradients and drifting particles
function initFallback2D(canvas, section) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    canvas.width = section.clientWidth * (window.devicePixelRatio || 1);
    canvas.height = section.clientHeight * (window.devicePixelRatio || 1);
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      r: 2 + Math.random() * 3,
      speed: 0.0005 + Math.random() * 0.001
    });
  }

  function draw() {
    requestAnimationFrame(draw);
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // subtle radial gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'rgba(218,165,32,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // particles
    ctx.fillStyle = 'rgba(218,165,32,0.4)';
    for (const p of particles) {
      p.y -= p.speed;
      if (p.y < 0) {
        p.y = 1;
        p.x = Math.random();
      }
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  draw();
}
