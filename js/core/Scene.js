import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.initScene();
        this.setupLighting();
        this.setupControls();
        
        // Store skybox material for animation
        this.skyboxMaterial = this.scene.children[0].material;

        // Initialize key states
        this.key_states = [false, false, false, false, false, false];
        this.setupKeyboardControls();
        this.setupMouseControls();

        // Mouse rotation variables
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.x_rotate = Math.PI / 10;
        this.y_rotate = 0;
    }

    initScene() {
        // Create skybox
        const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vWorldPosition;
                
                vec3 getSunsetColor(vec3 rayDir) {
                    // Sky colors
                    vec3 skyColorTop = vec3(0.1, 0.2, 0.4);    // Dark blue
                    vec3 skyColorMid = vec3(0.8, 0.35, 0.15);  // Orange
                    vec3 skyColorBot = vec3(0.9, 0.6, 0.3);    // Light orange/yellow
                    
                    // Sun position and colors
                    vec3 sunDir = normalize(vec3(sin(time * 0.1), -0.4, cos(time * 0.1)));
                    vec3 sunColor = vec3(1.0, 0.7, 0.3);
                    
                    // Calculate sky gradient
                    float y = rayDir.y;
                    vec3 skyColor = mix(skyColorBot, 
                                      mix(skyColorMid, skyColorTop, 
                                          smoothstep(0.0, 0.8, y)), 
                                      smoothstep(-0.2, 0.2, y));
                    
                    // Add sun
                    float sunIntensity = pow(max(dot(rayDir, sunDir), 0.0), 32.0);
                    skyColor += sunColor * sunIntensity * 2.0;
                    
                    // Add clouds
                    float cloudPattern = sin(rayDir.x * 10.0 + time) * 
                                       cos(rayDir.z * 10.0 + time * 0.5) * 0.5 + 0.5;
                    float cloudMask = smoothstep(0.3, 0.7, cloudPattern) * 
                                    smoothstep(0.0, 0.4, rayDir.y);
                    vec3 cloudColor = mix(vec3(1.0), vec3(0.8, 0.7, 0.6), cloudMask);
                    skyColor = mix(skyColor, cloudColor, cloudMask * 0.3);
                    
                    // Add atmosphere effect
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
            side: THREE.BackSide
        });

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 10, 40);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupControls() {
        // Comment out or remove OrbitControls
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

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffd500, 1.2);
        sunLight.position.set(100, 200, 100);
        sunLight.castShadow = true;
        
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
        this.scene.fog = new THREE.Fog(0x87CEEB, 200, 1000);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    setupKeyboardControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => this.onDocumentKeyDown(event), false);
        document.addEventListener('keyup', (event) => this.onDocumentKeyUp(event), false);
    }

    setupMouseControls() {
        // Mouse controls
        window.addEventListener('mousemove', (event) => this.onDocumentMouseMove(event), false);
    }

    onDocumentKeyDown(event) {
        const keyCode = event.which;
        if (keyCode == 87)  // W
            this.key_states[0] = true;
        if (keyCode == 83)  // S
            this.key_states[2] = true;
        if (keyCode == 65)  // A
            this.key_states[1] = true;
        if (keyCode == 68)  // D
            this.key_states[3] = true;
        if (keyCode == 69)  // E  
            this.key_states[4] = true;
        if (keyCode == 81)  // Q
            this.key_states[5] = true;
    }

    onDocumentKeyUp(event) {
        const keyCode = event.which;
        if (keyCode == 87)  // W
            this.key_states[0] = false;
        if (keyCode == 83)  // S
            this.key_states[2] = false;
        if (keyCode == 65)  // A
            this.key_states[1] = false;
        if (keyCode == 68)  // D
            this.key_states[3] = false;
        if (keyCode == 69)  // E  
            this.key_states[4] = false;
        if (keyCode == 81)  // Q
            this.key_states[5] = false;
    }

    onDocumentMouseMove(event) {
        event.preventDefault();
        
        if (event.buttons == 1) {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
            const changeAmountX = (mouse.x - this.lastMouseX) * 1;
            const changeAmountY = (mouse.y - this.lastMouseY) * 1;
            
            this.lastMouseX = mouse.x;
            this.lastMouseY = mouse.y;
            
            this.x_rotate += -changeAmountY;
            this.y_rotate -= changeAmountX;
            
            if (this.x_rotate > Math.PI / 2) this.x_rotate = Math.PI / 2;
            if (this.x_rotate < -Math.PI / 2) this.x_rotate = -Math.PI / 2;
            
            this.camera.setRotationFromEuler(new THREE.Euler(0, 0, 0, 'XYZ'));
            this.camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), this.y_rotate);
            this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), this.x_rotate);
        } else {
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            this.lastMouseX = mouse.x;
            this.lastMouseY = mouse.y;
        }
    }

    // Update method to handle movement based on key states
    updateMovement() {
        const moveSpeed = 0.5;
        const moveVector = new THREE.Vector3();

        if (this.key_states[0]) moveVector.z -= moveSpeed; // W
        if (this.key_states[2]) moveVector.z += moveSpeed; // S
        if (this.key_states[1]) moveVector.x -= moveSpeed; // A
        if (this.key_states[3]) moveVector.x += moveSpeed; // D
        if (this.key_states[4]) moveVector.y += moveSpeed; // E
        if (this.key_states[5]) moveVector.y -= moveSpeed; // Q

        // Apply movement relative to camera rotation
        moveVector.applyQuaternion(this.camera.quaternion);
        this.camera.position.add(moveVector);
    }

    render() {
        this.updateMovement();  // Add movement update
        // Update skybox time
        if (this.skyboxMaterial.uniforms) {
            this.skyboxMaterial.uniforms.time.value = performance.now() * 0.001;
        }
        this.renderer.render(this.scene, this.camera);
    }
} 