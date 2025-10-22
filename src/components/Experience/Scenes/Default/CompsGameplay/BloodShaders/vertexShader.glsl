const vertexShader = `
varying vec2 vUv;
varying float vRotation;

uniform float uSize;
uniform float uTime;
uniform float uProgress;
uniform vec2 uDirection; 

attribute float aSize;

void main() {
    vUv = uv;

    vec3 newPosition = position;

    float t = uProgress;
    
    float velocityX = uDirection.x * 0.2;
    float velocityY = uDirection.y * 0.15;
    
    float gravity = -0.25;
    
    newPosition.x += velocityX * t;
    
    newPosition.y += velocityY * t + 0.5 * gravity * t * t;
    
    newPosition.z += sin(t * 3.14159) * 0.05;
    
    float velocityAtT = velocityY + gravity * t;
    float targetRotation = atan(velocityAtT, velocityX) + 1.57079;
    
    float rotationProgress = smoothstep(0.0, 0.6, t);
    vRotation = mix(0.0, targetRotation, rotationProgress);
    
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;


    gl_PointSize = uSize * aSize * (1.0 - t * 0.3);
    gl_PointSize *= 1.0 / -viewPosition.z;
}

`;

export default vertexShader;