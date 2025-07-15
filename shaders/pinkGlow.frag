#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

uniform float u_scale;

uniform float u_time;

vec2 resolution = vec2(640,480);

vec4 pink = vec4(1.0, 0, .35, 1.0);

vec4 yellow = vec4(235./255., 255./255., 82./255., 1.0);

vec4 blue = vec4(85./255., 229./255., 255./255., 1.0);

vec4 purple = vec4(91./255., 22./255., 201./255., 1.0);

vec4 green = vec4(0./255., 255./255., 89./255., 1.0);

vec4 dark = vec4(12./255., 15./255., 68./255., 1.0);

vec4 gold = vec4(255./255., 192./255., 19./255., 1.0);

uniform int u_transitionStarted;

uniform float u_percentageElapsed;

uniform int u_narrativeCue;

vec2 pixelated_resolution = vec2(64,48);

vec4 baseColor = pink;


float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}



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

void respondToNarrativeCue(){
//I
  if (u_narrativeCue == 47){
    baseColor = yellow;
  }

  //Can
  else  if (u_narrativeCue == 48){
    baseColor = blue;
  }

  //Be
    else  if (u_narrativeCue == 49){
    baseColor = purple;
  }

  //Lieve
   else  if (u_narrativeCue == 50){
    baseColor = green;
  }


  //in
   else  if (u_narrativeCue == 51){
    baseColor = dark;
  }

  //the
    else if (u_narrativeCue == 52){
    baseColor = gold;
  }

  //truth
  else  if (u_narrativeCue == 53){
    baseColor = blue;
  }

  //of
    else  if (u_narrativeCue == 54){
    baseColor = green;
  }

  //sen
   else  if (u_narrativeCue == 55){
    baseColor = purple;
  }


  //sations
   else  if (u_narrativeCue == 56){
    baseColor = yellow;
  }

//There is wisdom chest

 else  if (u_narrativeCue == 57){
    baseColor = green;
}

  //There is wisdom chest

 else  if (u_narrativeCue == 67){
    baseColor = blue;
}


// clench jaws
 else  if (u_narrativeCue == 77){
    baseColor = yellow;
}

// ache of heart
 else  if (u_narrativeCue == 87){
    baseColor = dark;
}


// What do I want
 else  if (u_narrativeCue == 97){
    baseColor = pink;
  }

  // ache of heart
 else  if (u_narrativeCue == 98){
    baseColor = gold;
  }
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
	float raySpeed1 = 6.0;

	vec2 rayPos2 = vec2(resolution.x * 0.5, resolution.y * 0.5);
	vec2 rayRefDir2 = normalize(vec2(1.0, 0));
	const float raySeedA2 = 22.39910;
	const float raySeedB2 = 18.0234;
	const float raySpeed2 = 4.0;

	// Calculate the colour of the sun rays on the current fragment
	vec4 rays1 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1);

	vec4 rays2 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2);


    float transitionBrightness = 0.0;
    float radialBrightness = 0.0;


  if (u_transitionStarted == 1){
    transitionBrightness =  0.8-0.8*u_percentageElapsed;

  }

  respondToNarrativeCue();



   radialBrightness = (1.0-distanceFromCenter(uv))*.7;


  float r = baseColor.x + rays1.x*.2 + rays2.x*.3 + radialBrightness + transitionBrightness;
  float g = baseColor.y + rays1.y*.2 + rays2.y*.3 + radialBrightness + transitionBrightness;
  float b = baseColor.z + rays1.z*.2 + rays2.z*.3 + radialBrightness + transitionBrightness;

  float a = 1.0;


  gl_FragColor.x = r;
  gl_FragColor.y = g;
  gl_FragColor.z = b;
  gl_FragColor.w = a;

}
