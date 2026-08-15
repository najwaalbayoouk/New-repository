/* ============================================
   خلفية Three.js — شبكة جسيمات تفاعلية
   ============================================ */
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 480;

  // ---- الجسيمات ----
  const PARTICLE_COUNT = window.innerWidth < 720 ? 90 : 220;
  const RANGE = 900;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * RANGE;
    positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE * 0.6;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    velocities.push({
      x: (Math.random() - 0.5) * 0.25,
      y: (Math.random() - 0.5) * 0.25,
      z: (Math.random() - 0.5) * 0.15
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x7c5cfc,
    size: 3.2,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // ---- خطوط الاتصال بين الجسيمات القريبة ----
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.12
  });
  const lineGeometry = new THREE.BufferGeometry();
  const maxLines = PARTICLE_COUNT * 4;
  const linePositions = new Float32Array(maxLines * 2 * 3);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  const CONNECT_DIST = 130;

  // ---- تفاعل الماوس ----
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function updateLines() {
    let lineIdx = 0;
    const pos = geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT && lineIdx < maxLines; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT && lineIdx < maxLines; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECT_DIST) {
          linePositions[lineIdx * 6]     = pos[i * 3];
          linePositions[lineIdx * 6 + 1] = pos[i * 3 + 1];
          linePositions[lineIdx * 6 + 2] = pos[i * 3 + 2];
          linePositions[lineIdx * 6 + 3] = pos[j * 3];
          linePositions[lineIdx * 6 + 4] = pos[j * 3 + 1];
          linePositions[lineIdx * 6 + 5] = pos[j * 3 + 2];
          lineIdx++;
        }
      }
    }
    // إخفاء الخطوط غير المستخدمة
    for (let k = lineIdx; k < maxLines; k++) {
      linePositions[k * 6] = linePositions[k * 6 + 1] = linePositions[k * 6 + 2] = 0;
      linePositions[k * 6 + 3] = linePositions[k * 6 + 4] = linePositions[k * 6 + 5] = 0;
    }
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.setDrawRange(0, lineIdx * 2);
  }

  function animate() {
    requestAnimationFrame(animate);
    const pos = geometry.attributes.position.array;

    if (!reduceMotion) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3]     += velocities[i].x;
        pos[i * 3 + 1] += velocities[i].y;
        pos[i * 3 + 2] += velocities[i].z;

        if (Math.abs(pos[i * 3]) > RANGE / 2) velocities[i].x *= -1;
        if (Math.abs(pos[i * 3 + 1]) > RANGE * 0.3) velocities[i].y *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 200) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;
      updateLines();

      camera.position.x += (mouseX * 60 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 40 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

      points.rotation.y += 0.0006;
      lineSegments.rotation.y += 0.0006;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
