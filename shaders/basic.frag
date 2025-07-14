#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

uniform float u_scale;

uniform float u_time;

vec2 resolution = vec2(640,480);

vec4 pink = vec4(1, 0, .35, 1);


float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed)
{
	vec2 sourceToCoord = coord - raySource;
	float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);

	return clamp(
		(0.45 + 0.15 * sin(cosAngle * seedA + u_time * speed)) +
		(0.3 + 0.2 * cos(-cosAngle * seedB + u_time * speed)),
		0.0, 1.0) *
		clamp((resolution.x - length(sourceToCoord)) / resolution.x, 0.5, 1.0);
}

float distanceFromCenter(vec2 uv){
  float a = pow(uv.x - .5,2.0);
  float b = pow(uv.y - .5,2.0);
  float distance = sqrt(a +b);
 return distance;

}


void main() {



  vec2 uv = gl_FragCoord.xy / resolution;
	uv.y = 1.0 - uv.y;
	vec2 coord = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);


	// Set the parameters of the sun rays
	vec2 rayPos1 = vec2(resolution.x * 0.5, resolution.y *0.5);
	vec2 rayRefDir1 = normalize(vec2(0, 1));
	float raySeedA1 = 36.2214;
	float raySeedB1 = 21.11349;
	float raySpeed1 = 3.0;

	vec2 rayPos2 = vec2(resolution.x * 0.5, resolution.y * 0.5);
	vec2 rayRefDir2 = normalize(vec2(1.0, 0));
	const float raySeedA2 = 22.39910;
	const float raySeedB2 = 18.0234;
	const float raySpeed2 = 2.0;

	// Calculate the colour of the sun rays on the current fragment
	vec4 rays1 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);

	vec4 rays2 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);

	//fragColor = rays1 * 0.5 + rays2 * 0.4;
    // gl_FragColor = rays1;

	// Attenuate brightness towards the bottom, simulating light-loss due to depth.
	// Give the whole thing a blue-green tinge as well.



	// float brightness = -.6;

  // float brightness = 1.0- (distanceFromCenter(uv)/100.0);
  float brightness = (1.0-distanceFromCenter(uv))*.7;


	// gl_FragColor.x *= 0.1 + (brightness);
	// gl_FragColor.y *= 0.3 + (brightness * 0.1);
	// gl_FragColor.z *= 0.5 + (brightness * 0.5);
  // gl_FragColor.a = 1.0;

  float r = pink.x + rays1.x*.2 + rays2.x*.3 + brightness;
  float g = pink.y + rays1.y*.2 + rays2.y*.3 + brightness;
  float b = pink.z + rays1.z*.2 + rays2.z*.3 + brightness;
  //   float r =  brightness;
  // float g =  brightness;
  // float b =  brightness;
  float a = 1.0;
  // pink

  gl_FragColor.x = r;
  gl_FragColor.y = g;
  gl_FragColor.z = b;
  gl_FragColor.w = a;

  // gl_FragColor.x = pink.x + rays1.x;
  // gl_FragColor.y = pink.y + rays1.y;
  // gl_FragColor.z = pink.z + rays1.z;



  // position of the pixel divided by resolution, to get normalized positions on the canvas
  // vec2 st = gl_FragCoord.xy/u_resolution.xy;
  // vec2 resolution = vec2(640,480);
  // vec2 scaleVec = vec2(u_scale,u_scale);
  // vec2 st = gl_FragCoord.xy/resolution;

  // Lets use the pixels position on the x-axis as our gradient for the red color
  // Where the position is closer to 0.0 we get black (st.x = 0.0)
  // Where the position is closer to width (defined as 1.0) we get red (st.x = 1.0)

  // float c = 0.0;
  // print(st.x);
  // if (int(floor(st.x)) / 2 == 0){
  //   c = 0.0;
  // } else {
  //   c = 1.0;
  // }


  // gl_FragColor = vec4(sin(st.x+st.y),tan(st.x/st.y),cos(st.y),1.0); // R,G,B,A



  // you can only have one gl_FragColor active at a time, but try commenting the others out
  // try the green component

  //gl_FragColor = vec4(0.0,st.x,0.0,1.0);

  // try both the x position and the y position

  //gl_FragColor = vec4(st.x,st.y,0.0,1.0);
}
