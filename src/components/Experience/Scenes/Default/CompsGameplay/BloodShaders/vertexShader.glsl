const vertexShader = `
varying vec2 vUv;
varying float vRotation; // on envoie la rotation au fragment

uniform float uSize;
uniform float uTime;
uniform float uProgress;

attribute float aSize;

void main() {
    vUv = uv;

    vec3 newPosition = position;

    float curve = smoothstep(0.2, .8, uProgress);
    float height = uProgress * 0.18;
    float offsetX = -curve * 0.1;

    newPosition.x += offsetX;
    newPosition.y += height;

    vRotation = mix(0.0, 1.0, curve) * 1.2;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aSize;
    gl_PointSize *= 1.0 / -viewPosition.z;
}


`;

export default vertexShader;


