import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export class WallBuilder {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    async createWalls() {
        this.createFloor();
        this.createMainWalls();
        const frontWallMaterials = await this.createFrontWall();
        const titleMaterial = await this.createTitleText();
        this.addPosterArtwork();

        return {
            starMaterials: frontWallMaterials.starMaterials,
            textMaterial: titleMaterial
        };
    }

    createFloor() {
        // Load floor texture
        const floorTexture = this.textureLoader.load('floor/image.png');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(1, 1);  // Adjust texture tiling

        // Create floor material with normal and roughness maps for better realism
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            map: floorTexture,
            roughness: 0.7,
            metalness: 0.2,
            side: THREE.DoubleSide
        });

        // Create floor geometry
        const floorGeometry = new THREE.PlaneGeometry(40, 40);  // Match museum size
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);

        // Position and rotate floor
        floor.rotation.x = -Math.PI / 2;  // Rotate to be horizontal
        floor.position.y = 0;  // At ground level
        floor.receiveShadow = true;  // Enable shadow receiving

        // Add decorative border
        this.createFloorBorder();

        this.scene.add(floor);
    }

    createFloorBorder() {
        // Create border material
        const borderMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,  // Dark brown color
            roughness: 0.6,
            metalness: 0.3
        });

        // Create border geometries
        const borderWidth = 1;
        const borderHeight = 0.2;
        const roomSize = 40;

        // Create four borders
        const borders = [
            // North border
            {
                geometry: new THREE.BoxGeometry(roomSize + borderWidth * 2, borderHeight, borderWidth),
                position: [0, borderHeight/2, -roomSize/2]
            },
            // South border
            {
                geometry: new THREE.BoxGeometry(roomSize + borderWidth * 2, borderHeight, borderWidth),
                position: [0, borderHeight/2, roomSize/2]
            },
            // East border
            {
                geometry: new THREE.BoxGeometry(borderWidth, borderHeight, roomSize),
                position: [roomSize/2, borderHeight/2, 0]
            },
            // West border
            {
                geometry: new THREE.BoxGeometry(borderWidth, borderHeight, roomSize),
                position: [-roomSize/2, borderHeight/2, 0]
            }
        ];

        // Create and position border meshes
        borders.forEach(border => {
            const mesh = new THREE.Mesh(border.geometry, borderMaterial);
            mesh.position.set(...border.position);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // Add corner decorations
        this.createCornerDecorations(roomSize/2, borderHeight);
    }

    createCornerDecorations(size, height) {
        const cornerGeometry = new THREE.CylinderGeometry(0.7, 0.7, height, 8);
        const cornerMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.5,
            metalness: 0.4
        });

        // Position corners
        const cornerPositions = [
            [-size, height/2, -size],  // Northwest
            [size, height/2, -size],   // Northeast
            [-size, height/2, size],   // Southwest
            [size, height/2, size]     // Southeast
        ];

        cornerPositions.forEach(position => {
            const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
            corner.position.set(...position);
            corner.castShadow = true;
            corner.receiveShadow = true;
            this.scene.add(corner);
        });
    }

    createMainWalls() {
        // Load different textures for back and side walls
        const backWallTexture = this.textureLoader.load('walls/image.png');
        const sideWallTexture = this.textureLoader.load('walls/image.png');

        // Configure textures
        [backWallTexture, sideWallTexture].forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(2, 1); // Adjust repeat for Egyptian wall texture
        });

        // Create materials
        const backWallMaterial = new THREE.MeshStandardMaterial({ 
            map: backWallTexture,
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.2
        });

        const sideWallMaterial = new THREE.MeshStandardMaterial({ 
            map: sideWallTexture,
            side: THREE.DoubleSide
        });

        // Back wall with Egyptian texture
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 20),
            backWallMaterial
        );
        backWall.position.z = -20;
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Side walls with original texture
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 20),
            sideWallMaterial
        );
        leftWall.position.x = -20;
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 20),
            sideWallMaterial
        );
        rightWall.position.x = 20;
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }

    createFrontWall() {
        // Create material for front walls

        const frontWallTexture = this.textureLoader.load('walls/image.png');
        frontWallTexture.wrapS = THREE.IncrementStencilOp;
        frontWallTexture.wrapT = THREE.IncrementStencilOp;
        frontWallTexture.repeat.set(10, 10); // Adjust repeat for Egyptian wall texture

        const frontWallMaterial = new THREE.MeshStandardMaterial({ 
            map: frontWallTexture,
            side: THREE.DoubleSide,
            roughness: 0.7,
            metalness: 0.2
        });

        // Front wall group
        const frontWall = new THREE.Group();
        
        // Top part of front wall
        const topWall = new THREE.Mesh(
            new THREE.PlaneGeometry(28, 6),
            frontWallMaterial
        );
        topWall.position.z = 20;
        topWall.position.y = 17;
        topWall.rotation.y = Math.PI;
        topWall.receiveShadow = true;
        frontWall.add(topWall);

        // Side pillars
        const leftPillar = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 20),
            frontWallMaterial
        );
        leftPillar.position.set(-17, 10, 20);
        leftPillar.rotation.y = Math.PI;
        leftPillar.receiveShadow = true;
        frontWall.add(leftPillar);

        const rightPillar = new THREE.Mesh(
            new THREE.PlaneGeometry(6, 20),
            frontWallMaterial
        );
        rightPillar.position.set(17, 10, 20);
        rightPillar.rotation.y = Math.PI;
        rightPillar.receiveShadow = true;
        frontWall.add(rightPillar);

        this.scene.add(frontWall);
        const starMaterials = [];
        
        // Add stars and collect their materials
        this.addStarsToFrontWall(frontWall, starMaterials);
        this.addStarsToPillars(leftPillar, starMaterials);
        this.addStarsToPillars(rightPillar, starMaterials);

        // Add creator names
        const namesMaterial = this.addCreatorNames(frontWall);
        
        return { 
            starMaterials,
            namesMaterial 
        };
    }

    addStarsToPillars(pillar, starMaterials) {
        const starPositions = [
            // Left column - starting from bottom
            [-1.5, -7, -0.1], [-1.5, -5, -0.1], [-1.5, -3, -0.1],
            [-1.5, -1, -0.1], [-1.5, 1, -0.1], [-1.5, 3, -0.1],
            [-1.5, 5, -0.1], [-1.5, 7, -0.1], [-1.5, 9, -0.1],
            
            // Center column - starting from bottom
            [0, -6, -0.1], [0, -4, -0.1], [0, -2, -0.1],
            [0, 0, -0.1], [0, 2, -0.1], [0, 4, -0.1],
            [0, 6, -0.1], [0, 8, -0.1],
            
            // Right column - starting from bottom
            [1.5, -7, -0.1], [1.5, -5, -0.1], [1.5, -3, -0.1],
            [1.5, -1, -0.1], [1.5, 1, -0.1], [1.5, 3, -0.1],
            [1.5, 5, -0.1], [1.5, 7, -0.1], [1.5, 9, -0.1],

            // Diagonal stars - starting from bottom
            [-0.75, -5.5, -0.1], [-0.75, -1.5, -0.1], [-0.75, 2.5, -0.1], [-0.75, 6.5, -0.1],
            [0.75, -3.5, -0.1], [0.75, 0.5, -0.1], [0.75, 4.5, -0.1], [0.75, 8.5, -0.1]
        ];

        starPositions.forEach((position, index) => {
            const star = this.createStar();
            star.position.set(...position);
            star.rotation.z = (index % 5) * Math.PI / 5;
            const scale = 0.3 + (Math.random() * 0.2);
            star.scale.set(scale, scale, scale);
            star.castShadow = true;
            pillar.add(star);
            
            if (star.material) {
                starMaterials.push(star.material);
            }
        });
    }

    // Extract star creation to a separate method for reuse
    createStar() {
        const starShape = new THREE.Shape();
        const points = 5;
        const outerRadius = 0.4;
        const innerRadius = 0.2;
        
        for(let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (points * 2)) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if(i === 0) {
                starShape.moveTo(x, y);
            } else {
                starShape.lineTo(x, y);
            }
        }
        starShape.closePath();

        const starGeometry = new THREE.ExtrudeGeometry(starShape, {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 3
        });

        // Create shader material for stars with enhanced animation
        const starShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0xFFD700) }
            },
            vertexShader: `
                varying vec3 vPosition;
                void main() {
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                varying vec3 vPosition;
                
                void main() {
                    float twinkle = sin(vPosition.x * 10.0 + time * 3.0) * 
                                  cos(vPosition.y * 10.0 + time * 2.0) * 0.5 + 0.5;
                    vec3 color = mix(baseColor, vec3(1.0), twinkle * 0.5);
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        return new THREE.Mesh(starGeometry, starShaderMaterial.clone());
    }

    async createTitleText() {
        return new Promise((resolve) => {
            const fontLoader = new FontLoader();
            fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                const textGeometry = new TextGeometry('Egyptian Museum', {
                    font: font,
                    size: 2,
                    height: 0.2,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.05,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                textGeometry.computeBoundingBox();
                const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
                
                // Enhanced text shader material with more dramatic animation
                const textShaderMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        baseColor: { value: new THREE.Color(0xD4AF37) }
                    },
                    vertexShader: `
                        varying vec3 vPosition;
                        varying vec2 vUv;
                        void main() {
                            vPosition = position;
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        uniform vec3 baseColor;
                        varying vec3 vPosition;
                        varying vec2 vUv;
                        
                        void main() {
                            // Create wave effect
                            float wave = sin(vPosition.x * 0.5 + time * 2.0) * 0.5 + 0.5;
                            
                            // Create sparkle effect
                            float sparkle = sin(vPosition.x * 20.0 + time * 5.0) * 
                                          cos(vPosition.y * 20.0 + time * 3.0) * 0.5 + 0.5;
                            
                            // Combine effects
                            vec3 waveColor = mix(baseColor, vec3(1.0, 0.9, 0.5), wave * 0.5);
                            vec3 finalColor = mix(waveColor, vec3(1.0), sparkle * 0.2);
                            
                            // Add pulsing glow
                            float pulse = sin(time * 3.0) * 0.1 + 0.9;
                            finalColor *= pulse;
                            
                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `,
                    side: THREE.DoubleSide
                });

                const textMesh = new THREE.Mesh(textGeometry, textShaderMaterial);
                textMesh.position.set(-textWidth/2, 14.8, 20.1);
                textMesh.castShadow = true;
                this.scene.add(textMesh);
                resolve(textShaderMaterial);
            });
        });
    }

    addPosterArtwork() {
        const posterScale = { width: 4, height: 6 };
        
        const posterConfigs = [
            // Left wall posters
            {
                position: [-19.5, 8, -10],
                rotation: [0, Math.PI / 2, 0],
                path: 'poster/poster1.jpg'
            },
            {
                position: [-19.5, 8, 5],
                rotation: [0, Math.PI / 2, 0],
                path: 'poster/poster2.jpeg'
            },
            // Right wall posters
            {
                position: [19.5, 8, -10],
                rotation: [0, -Math.PI / 2, 0],
                path: 'poster/poster3.jpeg'
            },
            {
                position: [19.5, 8, 5],
                rotation: [0, -Math.PI / 2, 0],
                path: 'poster/poster4.jpeg'
            },
            // Back wall posters
            {
                position: [-10, 8, -19.5],
                rotation: [0, 0, 0],
                path: 'poster/poster5.jpg'
            },
            {
                position: [10, 8, -19.5],
                rotation: [0, 0, 0],
                path: 'poster/poster6.jpeg'
            }
        ];

        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            metalness: 0.3,
            roughness: 0.7
        });

        posterConfigs.forEach(config => {
            const posterTexture = this.textureLoader.load(config.path);
            const posterMaterial = new THREE.MeshStandardMaterial({
                map: posterTexture,
                side: THREE.DoubleSide
            });

            const posterGeometry = new THREE.PlaneGeometry(posterScale.width - 0.1, posterScale.height - 0.1);
            const poster = new THREE.Mesh(posterGeometry, posterMaterial);

            const frameGeometry = new THREE.BoxGeometry(posterScale.width, posterScale.height, 0.2);
            const frame = new THREE.Mesh(frameGeometry, frameMaterial);

            const posterGroup = new THREE.Group();
            posterGroup.add(frame);
            posterGroup.add(poster);

            poster.position.z = 0.11;
            posterGroup.position.set(...config.position);
            posterGroup.rotation.set(...config.rotation);

            frame.castShadow = true;
            frame.receiveShadow = true;
            poster.castShadow = true;
            poster.receiveShadow = true;

            this.scene.add(posterGroup);
        });
    }

    addStarsToFrontWall(frontWall, starMaterials) {
        // Create star shape
        const starShape = new THREE.Shape();
        const points = 5;
        const outerRadius = 0.4;
        const innerRadius = 0.2;
        
        for(let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i / (points * 2)) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if(i === 0) {
                starShape.moveTo(x, y);
            } else {
                starShape.lineTo(x, y);
            }
        }
        starShape.closePath();

        const starGeometry = new THREE.ExtrudeGeometry(starShape, {
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.05,
            bevelSize: 0.02,
            bevelSegments: 3
        });

        // Enhanced star positions for top wall
        const starPositions = [
            // Top row
            [-13, 19.4, 20.05], [-9, 19.4, 20.05], [-5, 19.4, 20.05],
            [0, 19.4, 20.05], [5, 19.4, 20.05], [9, 19.4, 20.05],
            [13, 19.4, 20.05],
            
            // Middle row
            [-11, 18.2, 20.05], [-7, 18.2, 20.05], [-3, 18.2, 20.05],
            [3, 18.2, 20.05], [7, 18.2, 20.05], [11, 18.2, 20.05],
            
            // Bottom row
            [-13, 17.0, 20.05], [-9, 17.0, 20.05], [-5, 17.0, 20.05],
            [0, 17.0, 20.05], [5, 17.0, 20.05], [9, 17.0, 20.05],
            [13, 17.0, 20.05]
        ];

        // Enhanced star shader with more complex animation
        const starShaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                baseColor: { value: new THREE.Color(0xFFD700) }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying float vDistance;
                
                void main() {
                    vPosition = position;
                    vDistance = length(position);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 baseColor;
                varying vec3 vPosition;
                varying float vDistance;
                
                void main() {
                    // Basic twinkle
                    float twinkle = sin(vPosition.x * 10.0 + time * 3.0) * 
                                  cos(vPosition.y * 10.0 + time * 2.0) * 0.5 + 0.5;
                    
                    // Radial pulse
                    float pulse = sin(vDistance * 3.0 - time * 2.0) * 0.5 + 0.5;
                    
                    // Sparkle effect
                    float sparkle = pow(sin(vPosition.x * 20.0 + time * 4.0) * 
                                     cos(vPosition.y * 20.0 + time * 3.0), 2.0);
                    
                    // Combine effects
                    float effect = mix(twinkle, pulse, 0.5) + sparkle * 0.2;
                    
                    // Color variation
                    vec3 color = mix(baseColor, vec3(1.0, 0.9, 0.5), effect);
                    
                    // Add brightness variation
                    float brightness = 0.8 + effect * 0.4;
                    color *= brightness;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        starPositions.forEach((position, index) => {
            const star = new THREE.Mesh(starGeometry, starShaderMaterial.clone());
            star.position.set(...position);
            star.rotation.z = (index % 5) * Math.PI / 5;
            const scale = 0.6 + (Math.random() * 0.3); // More size variation
            star.scale.set(scale, scale, scale);
            star.castShadow = true;
            frontWall.add(star);
            
            if (star.material) {
                starMaterials.push(star.material);
            }
        });
    }

    async addCreatorNames(frontWall) {
        return new Promise((resolve) => {
            const fontLoader = new FontLoader();
            fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
                // Create simple gold material without effects
                const nameMaterial = new THREE.MeshStandardMaterial({
                    color: 0xD4AF37,  // Gold color
                    metalness: 0.7,
                    roughness: 0.3
                });

                // Create first name text
                const name1Geometry = new TextGeometry('Alara Sermutlu', {
                    font: font,
                    size: 0.6,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                // Create second name text
                const name2Geometry = new TextGeometry('Rabia Yazici', {
                    font: font,
                    size: 0.6,
                    height: 0.1,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 5
                });

                name1Geometry.computeBoundingBox();
                name2Geometry.computeBoundingBox();

                const name1Width = name1Geometry.boundingBox.max.x - name1Geometry.boundingBox.min.x;
                const name2Width = name2Geometry.boundingBox.max.x - name2Geometry.boundingBox.min.x;

                const name1Mesh = new THREE.Mesh(name1Geometry, nameMaterial);
                const name2Mesh = new THREE.Mesh(name2Geometry, nameMaterial);

                // Position names on either side of the entrance
                name1Mesh.position.set(-17 - name1Width/2, 1, 20.1); // Left pillar
                name2Mesh.position.set(17 - name2Width/2, 1, 20.1);  // Right pillar

                name1Mesh.castShadow = true;
                name2Mesh.castShadow = true;

                frontWall.add(name1Mesh);
                frontWall.add(name2Mesh);

                // Since we're not using animated materials anymore, we can return null
                resolve(null);
            });
        });
    }
} 