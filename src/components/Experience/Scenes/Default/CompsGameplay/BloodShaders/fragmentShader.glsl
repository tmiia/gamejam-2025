const fragmentShader = `
varying vec2 vUv;
varying float vRotation;

uniform sampler2D uTexture;
uniform float uProgress;
uniform vec3 uColor;

void main() {
    vec2 uv = gl_PointCoord - 0.5;


    float s = sin(-vRotation);
    float c = cos(vRotation);
    mat2 rotation = mat2(c, -s, s, c);

    uv = rotation * uv;

    uv += 0.5;

    float textureAlpha = texture(uTexture, uv).r;
    gl_FragColor = vec4(uColor, textureAlpha - uProgress);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

`;

export default fragmentShader;