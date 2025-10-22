const fragmentShader = `
varying vec2 vUv;
varying float vRotation;

uniform sampler2D uTexture;
uniform float uProgress;
uniform vec3 uColor;

void main() {
    vec2 uv = gl_PointCoord - 0.5;
    

    float c = cos(vRotation);
    float s = sin(vRotation);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    uv = rotationMatrix * uv;
    
    float droplet = 0.0;
    
    float bodyWidth = 0.1;
    float bodyLength = 0.1;
    float body = smoothstep(bodyWidth, 0.0, abs(uv.x)) * 
                 smoothstep(bodyLength, 0.0, abs(uv.y));
    

    float tipY = uv.y + 0.3;
    float tipWidth = 0.03 * (1.0 - smoothstep(0.0, 0.3, tipY));
    float tip = smoothstep(tipWidth, 0.0, abs(uv.x)) * 
                smoothstep(0.3, 0.0, tipY) * 
                step(0.0, tipY);
    
    droplet = max(body, tip);
    

    vec3 bloodColor = uColor * (0.9 + 0.1 * (1.0 - length(uv) * 2.0));
    

    float alpha = droplet * 0.95;

    alpha *= (1.0 - uProgress);
    
    gl_FragColor = vec4(bloodColor, alpha);
    

    if (alpha < 0.01) discard;

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}

`;

export default fragmentShader;