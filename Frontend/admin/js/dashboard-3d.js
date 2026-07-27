document.addEventListener("DOMContentLoaded", () => {
    initGlobe();
});

function initGlobe() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup - positioned to the right to leave space for content
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 18;
    camera.position.x = 8;
    camera.position.y = 2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Group for globe
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Globe geometry (wireframe for tech look)
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    
    // Core material
    const coreMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xa855f7, 
        transparent: true, 
        opacity: 0.1 
    });
    const core = new THREE.Mesh(geometry, coreMaterial);
    globeGroup.add(core);

    // Wireframe material
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0xa855f7, 
        transparent: true, 
        opacity: 0.25 
    });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    globeGroup.add(wireframe);

    // Add points/markers (representing potholes)
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
        color: 0xff4d4d, // Critical Red
        size: 0.15,
        transparent: true,
        opacity: 0.8
    });

    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i+=3) {
        // Random points on sphere
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const radius = 6.05; // Slightly outside the globe

        posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i+1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i+2] = radius * Math.cos(phi);
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    globeGroup.add(points);

    // Lighting (ambient to keep it subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();

        // Slow rotation
        globeGroup.rotation.y = elapsedTime * 0.05;
        globeGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

        // Pulse points slightly
        pointsMaterial.size = 0.15 + Math.sin(elapsedTime * 2) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
}
