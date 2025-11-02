#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

uniform float u_time; // This is passed in as a uniform from the sketch.js file

uniform float u_glowAmount; // This is passed in as a uniform from the sketch.js file

uniform int u_songIndex;

vec2 resolution = vec2(640,480);


// Goes from 0 (bottom of screen) to 0.5 (center of the screen)
uniform float u_glowPosition;

float round(float value){
  return floor(value + 0.5);
}

void main() {
    //***********    Basic setup    **********
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy / resolution;
	  // Position of fragment relative to centre of screen
    vec2 pos = vec2(0.5,u_glowPosition) - uv;



   // float pixelationAmount = resolution.x/u_resolution.x;

    float pixelationAmount = 160.0;

    vec2 pos_pixelated = vec2(round(pos.x * pixelationAmount) / pixelationAmount, round(pos.y * pixelationAmount) / pixelationAmount);


    // Adjust y by aspect for uniform transforms
    //coord_pixelated.y /= resolution.x/resolution.y;


    //**********         Glow        **********

    // Equation 1/x gives a hyperbola which is a nice shape to use for drawing glow as
    // it is intense near 0 followed by a rapid fall off and an eventual slow fade
    float dist = 3.0/length(pos_pixelated);

    //**********        Radius       **********

    // Dampen the glow to control the radius
    dist *= (sin(u_time*2.5)*0.05+ 0.2)*u_glowAmount;

    //**********       Intensity     **********

    // Raising the result to a power allows us to change the glow fade behaviour
    // See https://www.desmos.com/calculator/eecd6kmwy9 for an illustration
    // (Move the slider of m to see different fade rates)
    dist = pow(dist, 0.6);

    // Knowing the distance from a fragment to the source of the glow, the above can be
    // written compactly as:
    //	float getGlow(float dist, float radius, float intensity){
    //		return pow(radius/dist, intensity);
	//	}
    // The returned value can then be multiplied with a colour to get the final result

    // Add colour

    vec3 color;
    if (u_songIndex == 0){
      color = vec3(1.0, 0.7, 0.2);
    }
    if (u_songIndex == 1){
      color = vec3(1.0, 0.2, 0.2);
    }
     if (u_songIndex == 2){
      color = vec3(0.1, 0.8, 0.8);
    }
    if (u_songIndex == 3){
      color = vec3(1.0, 0.4, 0.2);
    }
    if (u_songIndex == 4){
      color = vec3(0.3, 0.1, 0.3);
    }
    vec3 col = dist * color;

    // Tonemapping. See comment by P_Malin
    col = 1.0 - exp( -col );

    // Output to screen
    gl_FragColor = vec4(col, 1.0);

}
