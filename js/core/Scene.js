import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Main Scene class responsible for managing the 3D environment
 * Handles scene initialization, controls, lighting, and rendering
 */
export class Scene {
    /**
     * Constructor initializes the scene, camera, renderer, and control systems
     */
    constructor() {
        this.scene = new THREE.Scene();
        this.initScene();
        this.setupLighting();
        this.setupControls();
        
        // Store reference to skybox material for dynamic updates
        this.skyboxMaterial = this.scene.children[0].material;

        // Array to track pressed keys: [W, A, S, D, E, Q]
        this.key_states = [false, false, false, false, false, false];
        this.setupKeyboardControls();
        this.setupMouseControls();

        // Variables for tracking mouse movement and camera rotation
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.x_rotate = Math.PI / 10;  // Initial X rotation (pitch)
        this.y_rotate = 0;             // Initial Y rotation (yaw)
    }

    /**
     * Initializes the basic scene components including skybox, camera, and renderer
     */
    initScene() {
        // Create skybox with dynamic sunset shader
        const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }  // Uniform for animating the sky
            },
            vertexShader: `
                // Vertex shader calculates world position for fragment shader
                varying vec3 vWorldPosition;
                
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                // Fragment shader creates dynamic sunset effect
                uniform float time;
                varying vec3 vWorldPosition;
                
                vec3 getSunsetColor(vec3 rayDir) {
                    // Define sky gradient colors
                    vec3 skyColorTop = vec3(0.1, 0.2, 0.4);    // Dark blue
                    vec3 skyColorMid = vec3(0.8, 0.35, 0.15);  // Orange
                    vec3 skyColorBot = vec3(0.9, 0.6, 0.3);    // Light orange/yellow
                    
                    // Animate sun position
                    vec3 sunDir = normalize(vec3(sin(time * 0.1), -0.4, cos(time * 0.1)));
                    vec3 sunColor = vec3(1.0, 0.7, 0.3);
                    
                    // Create sky gradient based on view direction
                    float y = rayDir.y;
                    vec3 skyColor = mix(skyColorBot, 
                                      mix(skyColorMid, skyColorTop, 
                                          smoothstep(0.0, 0.8, y)), 
                                      smoothstep(-0.2, 0.2, y));
                    
                    // Add sun glow effect
                    float sunIntensity = pow(max(dot(rayDir, sunDir), 0.0), 32.0);
                    skyColor += sunColor * sunIntensity * 2.0;
                    
                    // Generate animated cloud pattern
                    float cloudPattern = sin(rayDir.x * 10.0 + time) * 
                                       cos(rayDir.z * 10.0 + time * 0.5) * 0.5 + 0.5;
                    float cloudMask = smoothstep(0.3, 0.7, cloudPattern) * 
                                    smoothstep(0.0, 0.4, rayDir.y);
                    vec3 cloudColor = mix(vec3(1.0), vec3(0.8, 0.7, 0.6), cloudMask);
                    skyColor = mix(skyColor, cloudColor, cloudMask * 0.3);
                    
                    // Add atmospheric scattering effect
                    float atmosphere = pow(1.0 - max(rayDir.y, 0.0), 3.0);
                    skyColor += vec3(0.8, 0.6, 0.3) * atmosphere * 0.3;
                    
                    return skyColor;
                }
                
                void main() {
                    vec3 rayDir = normalize(vWorldPosition);
                    vec3 color = getSunsetColor(rayDir);
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide  // Render on inside of cube
        });

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);

        // Setup perspective camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 10, 40);

        // Initialize WebGL renderer with antialiasing and shadows
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // Handle window resizing
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    /**
     * Sets up camera controls (currently disabled in favor of custom controls)
     */
    setupControls() {
        // OrbitControls temporarily disabled for custom control implementation
        /*
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1000;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = 0;
        this.controls.enablePan = false;
        */
    }

    /**
     * Sets up scene lighting including ambient light, directional sun light, and fog
     */
    setupLighting() {
        // Add ambient light for general scene illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Add directional sun light with shadows
        const sunLight = new THREE.DirectionalLight(0xffd500, 1.2);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        
        // Configure shadow properties
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 1000;
        sunLight.shadow.camera.left = -1000;
        sunLight.shadow.camera.right = 1000;
        sunLight.shadow.camera.top = 1000;
        sunLight.shadow.camera.bottom = -1000;
        sunLight.shadow.bias = -0.0001;
        
        this.scene.add(sunLight);
        
        // Add distance fog effect
        this.scene.fog = new THREE.Fog(0x87CEEB, 200, 1000);
    }

    /**
     * Handles window resize events by updating camera and renderer
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Helper method to add objects to the scene
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * Sets up keyboard event listeners
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (event) => this.onDocumentKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.onDocumentKeyUp(event), false);
    }

    /**
     * Sets up mouse event listeners
     */
    setupMouseControls() {
        window.addEventListener('mousemove', (event) => this.onDocumentMouseMove(event), false);
    }

    /**
     * Handles keydown events for movement controls
     */
    onDocumentKeyDown(event) {
        const keyCode = event.which;
        if (keyCode == 87)  // W - Forward
            this.key_states[0] = true;
        if (keyCode == 83)  // S - Backward
            this.key_states[2] = true;
        if (keyCode == 65)  // A - Left
            this.key_states[1] = true;
        if (keyCode == 68)  // D - Right
            this.key_states[3] = true;
        if (keyCode == 69)  // E - Up
            this.key_states[4] = true;
        if (keyCode == 81)  // Q - Down
            this.key_states[5] = true;
    }

    /**
     * Handles keyup events for movement controls
     */
    onDocumentKeyUp(event) {
        const keyCode = event.which;
        if (keyCode == 87) this.key_states[0] = false;  // W
        if (keyCode == 83) this.key_states[2] = false;  // S
        if (keyCode == 65) this.key_states[1] = false;  // A
        if (keyCode == 68) this.key_states[3] = false;  // D
        if (keyCode == 69) this.key_states[4] = false;  // E
        if (keyCode == 81) this.key_states[5] = false;  // Q
    }

    /**
     * Handles mouse movement for camera rotation
     * Only rotates camera when left mouse button is pressed
     */
    onDocumentMouseMove(event) {
        event.preventDefault();
        
        if (event.buttons == 1) {  // Left mouse button pressed
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            // Calculate rotation amounts based on mouse movement
            const changeAmountX = (mouse.x - this.lastMouseX) * 1;
            const changeAmountY = (mouse.y - this.lastMouseY) * 1;
            
            this.lastMouseX = mouse.x;
            this.lastMouseY = mouse.y;
            
            // Update rotation angles
            this.x_rotate += -changeAmountY;
            this.y_rotate -= changeAmountX;
            
            // Clamp vertical rotation to prevent over-rotation
            if (this.x_rotate > Math.PI / 2) this.x_rotate = Math.PI / 2;
            if (this.x_rotate < -Math.PI / 2) this.x_rotate = -Math.PI / 2;
            
            // Apply rotations to camera
            this.camera.setRotationFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
            this.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), this.y_rotate);
            this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.x_rotate);
        } else {
            // Update mouse position even when not rotating
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.lastMouseX = mouse.x;
            this.lastMouseY = mouse.y;
        }
    }

    /**
     * Updates camera position based on current key states
     * Movement is relative to camera's rotation
     */
    updateMovement() {
        const moveSpeed = 0.5;
        const moveVector = new THREE.Vector3();

        // Apply movement based on pressed keys
        if (this.key_states[0]) moveVector.z -= moveSpeed; // W - Forward
        if (this.key_states[2]) moveVector.z += moveSpeed; // S - Backward
        if (this.key_states[1]) moveVector.x -= moveSpeed; // A - Left
        if (this.key_states[3]) moveVector.x += moveSpeed; // D - Right
        if (this.key_states[4]) moveVector.y += moveSpeed; // E - Up
        if (this.key_states[5]) moveVector.y -= moveSpeed; // Q - Down

        // Transform movement vector by camera rotation
        moveVector.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(moveVector);
    }

    /**
     * Main render method called each frame
     * Updates movement, skybox animation, and renders the scene
     */
    render() {
        this.updateMovement();
        // Update skybox time uniform for animation
        if (this.skyboxMaterial.uniforms) {
            this.skyboxMaterial.uniforms.time.value = performance.now() * 0.001;
        }
        this.renderer.render(this.scene, this.camera);
    }
} 