
# Project File Structure

## JavaScript Files

### Core
```
js/core/
└── Scene.js            # Main scene setup and management
```FILES.md

### Environment
```
js/environment/
├── WallBuilder.js      # Handles museum wall construction
└── EnvironmentBuilder.js # Overall environment setup
```

### Objects
```FILES.md
js/objects/
├── PedestalManager.js  # Manages artifact pedestals
└── ArtifactLoader.js   # Handles loading of 3D artifacts
```

### Shaders
```
js/shaders/
└── ShaderManager.js    # Custom shader management
```

### Entry Point
```
js/
└── main.js            # Application entry point
```

## Assets
```
assets/
└── characters/
    └── vase/
        └── vase.obj   # 3D model for vase artifact
```

## File Descriptions

### Core Files
- **Scene.js**: Manages the main Three.js scene, including camera setup, lighting, and render loop.

### Environment Files
- **WallBuilder.js**: Creates and textures museum walls, including decorative elements and lighting effects.
- **EnvironmentBuilder.js**: Coordinates overall environment construction, including walls, floors, and ambient elements.

### Object Management
- **PedestalManager.js**: Handles the creation and placement of artifact display pedestals.
- **ArtifactLoader.js**: Manages the loading and positioning of 3D artifact models.

### Shader System
- **ShaderManager.js**: Contains custom shader implementations for special visual effects.

### Assets
- **vase.obj**: 3D model file for museum artifact display.

## Dependencies
- Three.js
- WebGL support
- Modern JavaScript (ES6+)
```

This FILES.md provides:
- Clear hierarchical structure of the project
- Brief descriptions of key files
- Organization by functionality
- Asset locations

You can modify this file as the project structure evolves or add more detailed descriptions for specific components.
