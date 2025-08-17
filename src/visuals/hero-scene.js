// Physically-based animated hero background (Three.js over a transparent canvas)
// - Soft shadows, contact shadow floor
// - Realistic lighting via HDRI environment
// - Subtle animations of a pyramid, mushroom, DMT-inspired molecule, and spores

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
initHeroScene({ reducedMotion: prefersReducedMotion }).catch((e) => console.warn('Hero scene init failed:', e));

async function initHeroScene({ reducedMotion = false } = {}) {
  const canvas = document.getElementById('hero-canvas');
  const section = document.querySelector('.hero-section');
  if (!canvas || !section) return;
  // Mark hero as 3D-active for CSS adjustments
  section.setAttribute('data-hero3d', 'on');

  // Use global THREE object loaded from CDN
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded; using basic renderer.');
    return initFallback2D(canvas, section);
  }
  
  // Check if post-processing modules are available
  if (typeof THREE.EffectComposer === 'undefined') {
    console.warn('Three.js post-processing modules not available; using basic renderer.');
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
  
  // Bloom pass for golden glow on metals
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
  
  // Point lights for object-specific highlights
  const goldAccentLight = new THREE.PointLight(0xffd700, 0.8, 3);
  goldAccentLight.position.set(-1.8, 1, 0); // Near pyramid
  scene.add(goldAccentLight);
  
  const mushroomLight = new THREE.PointLight(0xffe4b5, 0.4, 2);
  mushroomLight.position.set(0.6, 1.2, 0.6); // Above mushroom
  scene.add(mushroomLight);

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

  // Enhanced Materials with Procedural Textures
  
  // Create procedural normal maps for surface detail
  function createNormalMap(size = 512, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * scale;
      imageData.data[i] = 127 + noise * 50;     // R (X normal)
      imageData.data[i + 1] = 127 + noise * 50; // G (Y normal)
      imageData.data[i + 2] = 255;              // B (Z normal - pointing up)
      imageData.data[i + 3] = 255;              // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Create procedural roughness maps
  function createRoughnessMap(size = 512, variation = 0.3) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const base = 128;
      const noise = (Math.random() - 0.5) * variation * 255;
      const value = Math.max(0, Math.min(255, base + noise));
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Detailed Gold Material with micro-scratches
  const goldNormal = createNormalMap(512, 0.4);
  const goldRoughness = createRoughnessMap(512, 0.2);
  goldRoughness.repeat.set(2, 2);
  goldNormal.repeat.set(2, 2);
  
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D4AF37'),
    metalness: 0.85,
    roughness: 0.25,
    normalMap: goldNormal,
    roughnessMap: goldRoughness,
    envMapIntensity: 1.5
  });

  // Ancient Stone Material with weathering
  const stoneNormal = createNormalMap(512, 1.2);
  const stoneRoughness = createRoughnessMap(512, 0.6);
  stoneNormal.repeat.set(1.5, 1.5);
  stoneRoughness.repeat.set(1.5, 1.5);
  
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8d826a'),
    metalness: 0.02,
    roughness: 0.95,
    normalMap: stoneNormal,
    roughnessMap: stoneRoughness,
    envMapIntensity: 0.4,
    bumpScale: 0.02
  });

  // Organic Mushroom Material with subsurface-like effect
  const mushroomNormal = createNormalMap(256, 0.8);
  const mushroomRoughness = createRoughnessMap(256, 0.4);
  mushroomNormal.repeat.set(3, 3);
  mushroomRoughness.repeat.set(3, 3);
  
  const organicMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c76d4f'),
    metalness: 0.02,
    roughness: 0.7,
    normalMap: mushroomNormal,
    roughnessMap: mushroomRoughness,
    envMapIntensity: 0.8,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  });

  // Mushroom Stem Material
  const stemNormal = createNormalMap(256, 0.6);
  const stemRoughness = createRoughnessMap(256, 0.3);
  stemNormal.repeat.set(4, 1);
  stemRoughness.repeat.set(4, 1);
  
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ddd6c9'),
    metalness: 0.01,
    roughness: 0.9,
    normalMap: stemNormal,
    roughnessMap: stemRoughness,
    envMapIntensity: 0.3
  });

  const moleculeAtomMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#b0d7ff'),
    metalness: 0.2,
    roughness: 0.3,
    envMapIntensity: 1.1
  });

  const moleculeBondMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#9fb3c8'),
    metalness: 0.3,
    roughness: 0.5,
    envMapIntensity: 1.0
  });

  // Objects
  const group = new THREE.Group();
  scene.add(group);

  // Enhanced Pyramid with detailed geometry and hieroglyphic-like details
  function createDetailedPyramid() {
    const pyramidGroup = new THREE.Group();
    
    // Main pyramid body with more segments for better lighting
    const mainPyramid = new THREE.Mesh(
      new THREE.ConeGeometry(1.4, 1.2, 4, 3),
      stoneMaterial
    );
    mainPyramid.rotation.y = Math.PI / 4;
    pyramidGroup.add(mainPyramid);
    
    // Add capstone with gold material
    const capstone = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.15, 4),
      goldMaterial
    );
    capstone.position.y = 0.6;
    capstone.rotation.y = Math.PI / 4;
    pyramidGroup.add(capstone);
    
    // Removed step details that were causing visual artifacts
    
    pyramidGroup.castShadow = true;
    pyramidGroup.receiveShadow = true;
    return pyramidGroup;
  }
  
  const pyramid = createDetailedPyramid();
  pyramid.position.set(-1.8, 0.1, -1.5); // Moved much further back
  group.add(pyramid);

  // Enhanced Mushroom with realistic details
  function createDetailedMushroom() {
    const mushroomGroup = new THREE.Group();
    
    // Enhanced stem with natural taper and surface irregularities
    const stemGeometry = new THREE.CylinderGeometry(0.12, 0.2, 1.2, 24, 8);
    // Add some irregularities to make it more organic
    const stemPositions = stemGeometry.attributes.position;
    for (let i = 0; i < stemPositions.count; i++) {
      const noise = (Math.random() - 0.5) * 0.02;
      stemPositions.setX(i, stemPositions.getX(i) + noise);
      stemPositions.setZ(i, stemPositions.getZ(i) + noise);
    }
    stemGeometry.attributes.position.needsUpdate = true;
    stemGeometry.computeVertexNormals();
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -0.1;
    stem.castShadow = true;
    stem.receiveShadow = true;
    mushroomGroup.add(stem);
    
    // Enhanced cap with natural variations
    const capGeometry = new THREE.SphereGeometry(0.65, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const capPositions = capGeometry.attributes.position;
    for (let i = 0; i < capPositions.count; i++) {
      const noise = (Math.random() - 0.5) * 0.03;
      const y = capPositions.getY(i);
      const factor = Math.max(0, y / 0.65); // More variation at the edges
      capPositions.setY(i, y + noise * factor);
    }
    capGeometry.attributes.position.needsUpdate = true;
    capGeometry.computeVertexNormals();
    
    const cap = new THREE.Mesh(capGeometry, organicMaterial);
    cap.scale.set(1.25, 0.7, 1.25);
    cap.position.y = 0.55;
    cap.castShadow = true;
    cap.receiveShadow = true;
    mushroomGroup.add(cap);
    

    
    return mushroomGroup;
  }
  
  const mushroom = createDetailedMushroom();
  mushroom.position.set(0.6, -0.2, -1.5); // Moved much further back
  group.add(mushroom);

  // Ornate Persian Magic Flying Carpet
  function createMagicCarpet() {
    const carpet = new THREE.Group();
    
    // Create procedural Persian carpet pattern texture
    function createPersianPattern() {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Base deep red background
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(0, 0, 512, 512);
      
      // Add golden border pattern
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 472, 472);
      
      // Inner decorative border
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 432, 432);
      
      // Central medallion
      ctx.fillStyle = '#DAA520';
      ctx.beginPath();
      ctx.ellipse(256, 256, 120, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner medallion
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.ellipse(256, 256, 80, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Decorative corner patterns
      for (let corner = 0; corner < 4; corner++) {
        ctx.save();
        ctx.translate(256, 256);
        ctx.rotate((corner * Math.PI) / 2);
        ctx.translate(-256, -256);
        
        ctx.fillStyle = '#DAA520';
        ctx.beginPath();
        ctx.moveTo(80, 80);
        ctx.lineTo(120, 60);
        ctx.lineTo(140, 100);
        ctx.lineTo(100, 120);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
      
      // Add geometric patterns
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const x = 64 + i * 48;
          const y = 64 + j * 48;
          if (Math.sqrt((x - 256) ** 2 + (y - 256) ** 2) > 150) {
            ctx.strokeRect(x - 8, y - 8, 16, 16);
          }
        }
      }
      
      return new THREE.CanvasTexture(canvas);
    }
    
    // Create fabric normal map for texture
    function createFabricNormal() {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const imageData = ctx.createImageData(256, 256);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const x = (i / 4) % 256;
        const y = Math.floor((i / 4) / 256);
        
        // Create woven fabric pattern
        const weaveX = Math.sin(x * 0.3) * 20;
        const weaveY = Math.sin(y * 0.3) * 20;
        
        imageData.data[i] = 127 + weaveX;     // R (X normal)
        imageData.data[i + 1] = 127 + weaveY; // G (Y normal)
        imageData.data[i + 2] = 255;          // B (Z normal)
        imageData.data[i + 3] = 255;          // A
      }
      
      ctx.putImageData(imageData, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 3);
      return texture;
    }
    
    const patternTexture = createPersianPattern();
    const fabricNormal = createFabricNormal();
    
    // Rich Persian carpet material with pattern
    const carpetMaterial = new THREE.MeshStandardMaterial({
      map: patternTexture,
      normalMap: fabricNormal,
      metalness: 0.05,
      roughness: 0.95,
      envMapIntensity: 0.4,
      side: THREE.DoubleSide,
      bumpScale: 0.02
    });
    
    // Create carpet with proper thickness (not just a plane)
    const carpetWidth = 1.2;
    const carpetLength = 1.8;
    const carpetThickness = 0.03;
    
    // Main carpet body with thickness
    const carpetGeometry = new THREE.BoxGeometry(carpetLength, carpetThickness, carpetWidth, 32, 1, 24);
    
    // Add realistic carpet deformation
    const positions = carpetGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      if (Math.abs(positions.getY(i)) > carpetThickness/4) { // Only deform top/bottom faces
        const waveX = Math.sin(x * 1.5) * 0.04;
        const waveZ = Math.sin(z * 2) * 0.02;
        positions.setY(i, positions.getY(i) + waveX + waveZ);
      }
    }
    positions.needsUpdate = true;
    carpetGeometry.computeVertexNormals();
    
    const carpetMesh = new THREE.Mesh(carpetGeometry, carpetMaterial);
    carpetMesh.castShadow = true;
    carpetMesh.receiveShadow = true;
    carpet.add(carpetMesh);
    
    // Add fringe/tassels along the edges
    const fringeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#DAA520'),
      metalness: 0.1,
      roughness: 0.9,
      envMapIntensity: 0.5
    });
    
    // Create fringe along short edges
    for (let edge = 0; edge < 2; edge++) {
      const fringeX = edge === 0 ? -carpetLength/2 - 0.05 : carpetLength/2 + 0.05;
      
      for (let i = 0; i < 20; i++) {
        const fringeZ = (i / 19 - 0.5) * carpetWidth * 0.9;
        
        for (let strand = 0; strand < 3; strand++) {
          const fringe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.003, 0.001, 0.08, 6),
            fringeMaterial
          );
          fringe.position.set(
            fringeX + (Math.random() - 0.5) * 0.02,
            -carpetThickness/2 - 0.04,
            fringeZ + (strand - 1) * 0.01
          );
          fringe.rotation.x = (Math.random() - 0.5) * 0.3;
          fringe.rotation.z = (Math.random() - 0.5) * 0.2;
          fringe.castShadow = true;
          carpet.add(fringe);
        }
      }
    }
    
    // Removed magical glow particles for cleaner look
    const sparkles = [];
    
    // Store references for animation
    carpet.userData = {
      carpetMesh,
      sparkles
    };
    
    return carpet;
  }
  
  const magicCarpet = createMagicCarpet();
  magicCarpet.position.set(2.8, 0.5, -0.2);
  // Angle the carpet upward for a natural flying pose
  magicCarpet.rotation.x = 0.25; // Tilt front edge up (~14 degrees)
  magicCarpet.rotation.z = 0.05; // Slight banking angle for dynamic look
  group.add(magicCarpet);



  // Temporarily disabled golden accent ankhs to test for orange block issue
  /*
  // Golden accent ankhs (subtle flat planes, optional)
  // Keeping original floating-ankh image; these are faint background glyphs
  const glyphMaterial = goldMaterial.clone();
  glyphMaterial.transparent = true;
  glyphMaterial.opacity = 0.15;
  const glyph1 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), glyphMaterial);
  glyph1.position.set(-0.2, 0.8, -1.2);
  glyph1.rotation.y = 0.3;
  glyph1.receiveShadow = false;
  group.add(glyph1);
  */

  // Spore particles
  const spores = createSpores(320, 2.6, 1.8);
  scene.add(spores);

  function createSpores(count, spreadX = 2, spreadY = 1.2) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count); // Track lifecycle phase
    
    // Mushroom position for reference
    const mushroomX = 0.6;
    const mushroomY = -0.2;
    const mushroomZ = -1.5;
    const mushroomCapRadius = 0.8; // Approximate mushroom cap radius
    
    for (let i = 0; i < count; i++) {
      // Start spores under the mushroom cap in different phases
      const phase = Math.random();
      phases[i] = phase;
      
      if (phase < 0.3) {
        // 30% start under mushroom cap
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * mushroomCapRadius * 0.8;
        positions[i * 3 + 0] = mushroomX + Math.cos(angle) * radius;
        positions[i * 3 + 1] = mushroomY + 0.3; // Just under the cap
        positions[i * 3 + 2] = mushroomZ + Math.sin(angle) * radius;
      } else {
        // 70% scattered around scene (already drifting)
        positions[i * 3 + 0] = (Math.random() - 0.5) * spreadX * 4;
        positions[i * 3 + 1] = Math.random() * spreadY + 0.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }
      
      speeds[i] = 0.1 + Math.random() * 0.25;
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speeds, 1));
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
    
    // Enhanced spore material with glow effect
    const material = new THREE.PointsMaterial({
      color: new THREE.Color('#DAA520'),
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: false,
      fog: true
    });
    const points = new THREE.Points(geometry, material);
    points.userData.speeds = speeds;
    points.userData.phases = phases;
    return points;
  }



  // Layout & resize handling
  function resize() {
    const width = section.clientWidth;
    const height = section.clientHeight;
    renderer.setSize(width, height, false);
    composer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    
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

    // Subtle motions (skip if reduced motion is preferred)
    if (!reducedMotion) {
      pyramid.rotation.y += 0.0018;
    mushroom.rotation.y = Math.sin(t * 0.2) * 0.15;
    const capScale = 1 + Math.sin(t * 0.9) * 0.03;
    mushroom.children.forEach((child) => {
      if (child.geometry && child.geometry.type.includes('Sphere')) {
        child.scale.set(1.25 * capScale, 0.7 * capScale, 1.25 * capScale);
      }
    });
    // Magic carpet gentle floating animation (maintaining upward tilt)
    magicCarpet.position.y = 0.5 + Math.sin(t * 0.8) * 0.08;
    magicCarpet.rotation.y = Math.sin(t * 0.4) * 0.1;
    magicCarpet.rotation.x = 0.25 + Math.cos(t * 0.6) * 0.03; // Keep upward tilt + gentle motion
    magicCarpet.rotation.z = 0.05 + Math.sin(t * 0.3) * 0.02; // Keep base banking + gentle sway
    
    // Very subtle carpet fabric movement (gentle breathing motion)
    if (magicCarpet.userData.carpetMesh) {
      const positions = magicCarpet.userData.carpetMesh.geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const y = positions.getY(i);
        
        // Only animate the top and bottom surfaces with very gentle motion
        if (Math.abs(y) > 0.01) {
          // Much more subtle wave motion
          const gentleWave = Math.sin(x * 0.8 + t * 0.6) * 0.008;
          const subtleRipple = Math.sin(z * 1.0 + t * 0.4) * 0.005;
          const breathingMotion = Math.sin(t * 0.3) * 0.003;
          
          // Use the original Y position as base and add tiny variations
          const originalY = y > 0 ? 0.015 : -0.015; // Carpet thickness half
          positions.setY(i, originalY + gentleWave + subtleRipple + breathingMotion);
        }
      }
      positions.needsUpdate = true;
    }
    
    // Sparkles removed for cleaner look



    // Spores fall from mushroom gills then drift up
    const pos = spores.geometry.attributes.position;
    const speeds = spores.userData.speeds;
    const phases = spores.userData.phases;
    
    // Mushroom position for reference
    const mushroomX = 0.6;
    const mushroomY = -0.2;
    const mushroomZ = -1.5;
    const mushroomCapRadius = 0.8;
    
    for (let i = 0; i < speeds.length; i++) {
      const currentY = pos.array[i * 3 + 1];
      const currentX = pos.array[i * 3 + 0];
      const currentZ = pos.array[i * 3 + 2];
      
      // Check if spore is under mushroom cap
      const distanceFromMushroom = Math.sqrt(
        (currentX - mushroomX) ** 2 + (currentZ - mushroomZ) ** 2
      );
      
      if (distanceFromMushroom < mushroomCapRadius && currentY < mushroomY + 0.5) {
        // Spore is under mushroom - falls down first with slight drift
        pos.array[i * 3 + 1] -= speeds[i] * 0.001; // Fall down
        pos.array[i * 3 + 0] += (Math.random() - 0.5) * 0.002; // Slight horizontal drift
        pos.array[i * 3 + 2] += (Math.random() - 0.5) * 0.002;
        
        // When spore falls below mushroom, start floating up
        if (currentY < mushroomY - 0.3) {
          pos.array[i * 3 + 1] += speeds[i] * 0.003; // Start rising
        }
      } else {
        // Spore is away from mushroom - normal upward drift
        pos.array[i * 3 + 1] += speeds[i] * 0.0025;
      }
      
      // Reset spores that go too high
      if (pos.array[i * 3 + 1] > 2.2) {
        // Some respawn under mushroom, others randomly
        if (Math.random() < 0.4) {
          // Respawn under mushroom cap
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * mushroomCapRadius * 0.8;
          pos.array[i * 3 + 0] = mushroomX + Math.cos(angle) * radius;
          pos.array[i * 3 + 1] = mushroomY + 0.3;
          pos.array[i * 3 + 2] = mushroomZ + Math.sin(angle) * radius;
        } else {
          // Random respawn
          pos.array[i * 3 + 1] = 0.15 + Math.random() * 0.3;
          pos.array[i * 3 + 0] = (Math.random() - 0.5) * 8 * 0.6;
          pos.array[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
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
  function resize() {
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(section);
  window.addEventListener('resize', resize);

  const spores = new Array(200).fill(0).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 0.6 + Math.random() * 1.8,
    s: 0.2 + Math.random() * 0.6,
    a: 0.4 + Math.random() * 0.5
  }));

  let t = 0;
  function draw() {
    t += 0.005;
    // Background gradient pulses
    const g = ctx.createRadialGradient(
      canvas.width * (0.3 + Math.sin(t) * 0.2),
      canvas.height * (0.7 + Math.cos(t * 0.8) * 0.1),
      40,
      canvas.width * 0.5,
      canvas.height * 0.5,
      Math.max(canvas.width, canvas.height)
    );
    g.addColorStop(0, 'rgba(212,175,55,0.25)');
    g.addColorStop(0.4, 'rgba(45,27,105,0.25)');
    g.addColorStop(1, 'rgba(10,10,10,0)');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Spores
    ctx.globalCompositeOperation = 'lighter';
    spores.forEach((p) => {
      p.y -= p.s;
      if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(218,165,32,${p.a})`;
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';

    requestAnimationFrame(draw);
  }
  draw();
}


