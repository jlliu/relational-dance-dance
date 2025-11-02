#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file

uniform float u_scale;

uniform float u_time;

vec2 resolution = vec2(640,480);

vec4 pink = vec4(1.0, 0, .35, 1.0);

vec4 white = vec4(1.0, 1.0, 1.0, 1.0);

vec4 yellow = vec4(220./255., 249./255., 82./255., 1.0);

vec4 blue = vec4(0./255., 192./255., 226./255., 1.0);

vec4 purple = vec4(91./255., 22./255., 201./255., 1.0);

vec4 green = vec4(0./255., 210./255., 35./255., 1.0);

vec4 dark = vec4(12./255., 15./255., 68./255., 1.0);

vec4 orange = vec4(231./255., 131./255., 0./255., 1.0);

uniform int u_transitionStarted;

uniform float u_percentageElapsed;

uniform int u_narrativeCue;

vec4 baseColor = pink;

float m_r = 1.0; float m_g = 1.0; float m_b = 1.0;


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

void respondToNarrativeCue(vec2 uv){
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
    baseColor = pink;
  }

  //the
    else if (u_narrativeCue == 52){
    baseColor = orange;
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

 else  if (u_narrativeCue >= 57 && u_narrativeCue <67){
    baseColor = green;
}

  //There is wisdom chest

 else  if (u_narrativeCue >= 67 && u_narrativeCue <77){
    baseColor = blue;
}


// clench jaws
 else  if (u_narrativeCue >= 77 && u_narrativeCue <87){
    baseColor = purple;
}

// ache of heart
 else  if (u_narrativeCue >= 87 && u_narrativeCue <97){
    baseColor = pink;
}


// What do I want
 else  if (u_narrativeCue == 97){
    baseColor = dark;
  }

  // In this body of mine
 else  if (u_narrativeCue == 98){
    baseColor = dark;
  }

   // I want to...
 else  if (u_narrativeCue == 99){
    baseColor = pink;
  }

   else  if (u_narrativeCue == 100){
    baseColor = purple;
  }

   else  if (u_narrativeCue == 101){
    baseColor = green;
  }

   else  if (u_narrativeCue == 102){
    baseColor = blue;
  }

   else  if (u_narrativeCue == 103){
    baseColor = orange;
  }
   else  if (u_narrativeCue == 104){
    baseColor = pink;
  }
   else  if (u_narrativeCue == 105){
    baseColor = yellow;
  }
   else  if (u_narrativeCue == 106){
    baseColor = purple;
  }

  // i wanted to become an artist
  else if (u_narrativeCue >= 107 && u_narrativeCue <=110){

    int stepsToEnd = 110 - u_narrativeCue;
    float brightness = .5-(float(stepsToEnd) / float(4));
    baseColor = vec4(brightness,brightness,brightness,1.0)+dark;
  }


  // now i see .. all laong
  else if (u_narrativeCue >= 111 && u_narrativeCue <=130){
    int stepsToEnd = 130 - u_narrativeCue;
    float brightness = float(stepsToEnd) / float(29);
    baseColor = vec4(brightness,brightness,brightness,1.0)+pink;
  }


  // I create to see
 else  if (u_narrativeCue >= 131 && u_narrativeCue <=132){
  baseColor = pink + vec4(0.15,0.15,0.15,1.0);
  }

  // I create to be seen
   else  if (u_narrativeCue >= 133 && u_narrativeCue <=134){
  baseColor = pink + vec4(0.3,0.3,0.3,1.0);
  }

  // Can you part 1
  else  if (u_narrativeCue >= 135 && u_narrativeCue <=138){

  baseColor = pink;
  baseColor.x = sin(u_time*2.0);
  }

   else  if (u_narrativeCue >= 139 && u_narrativeCue <=142){

  baseColor = blue;
  baseColor.y = sin(u_time*2.0);
  }


   else  if (u_narrativeCue >= 143 && u_narrativeCue <=146){

  baseColor = purple;
  baseColor.y = sin(u_time*2.0);
  }

  else  if (u_narrativeCue >= 147 && u_narrativeCue <=150){

  baseColor = green;
  baseColor.z = sin(u_time*2.0);
  }

  // Can you pt 2
  else  if (u_narrativeCue >= 151 && u_narrativeCue <=154){
  baseColor = vec4(uv.x-.2, uv.y-.2, 0.8, 1.0);
  }

    else  if (u_narrativeCue >= 155 && u_narrativeCue <=158){
  baseColor = vec4(0.8, uv.x-.2, uv.y-.2, 1.0);
  }

     else  if (u_narrativeCue >= 159 && u_narrativeCue <=162){
  baseColor = vec4(uv.y-.2, 0.8, uv.x-.2, 1.0);
  }

  else  if (u_narrativeCue >= 163 && u_narrativeCue <=166){
  baseColor = vec4(uv.x-.2, (1.0-uv.x), 0.4, 1.0);
  }

  // Will you..

  else  if (u_narrativeCue >= 167 && u_narrativeCue <=170){
  baseColor = vec4(sin(u_time*2.), uv.x, uv.y, 1.0);
  }

  else  if (u_narrativeCue >= 171 && u_narrativeCue <=174){
   baseColor = vec4(uv.x,sin(u_time*2.), uv.y, 1.0);
  }


  else  if (u_narrativeCue >= 175 && u_narrativeCue <=178){
   baseColor = vec4(uv.y,uv.x, sin(u_time*2.), 1.0);
  }


  else  if (u_narrativeCue >= 179 && u_narrativeCue <=182){
   baseColor = vec4(uv.y,sin(u_time*2.), uv.x, 1.0);
  }

  // Will you part 2
  else  if (u_narrativeCue >= 183 && u_narrativeCue <=186){
   baseColor = vec4(sin(u_time*2.), uv.x, uv.y, 1.0);
  }


  else  if (u_narrativeCue >= 187 && u_narrativeCue <=190){
   baseColor = vec4(uv.x,sin(u_time*2.), uv.y, 1.0);
  }

    else  if (u_narrativeCue >= 191 && u_narrativeCue <=194){
  baseColor = vec4(uv.y,uv.x, sin(u_time*2.), 1.0);
  }

      else  if (u_narrativeCue >= 195 && u_narrativeCue <=198){
   baseColor = vec4(uv.y,sin(u_time*2.), uv.x, 1.0);
  }

  //lose me
   else  if (u_narrativeCue >= 199 && u_narrativeCue <=222){
   baseColor = vec4(cos(u_time*.2),sin(u_time*.5), sin(u_time*.1+3.), 1.0);
  }
}


float round(float value){
  return floor(value + 0.5);
}

void main() {

  vec2 uv = gl_FragCoord.xy / resolution;
	uv.y = 1.0 - uv.y;
	vec2 coord = vec2(gl_FragCoord.x, resolution.y - gl_FragCoord.y);

  float pixelationAmount = u_resolution.x/resolution.x *2.0;

  vec2  coord_pixelated = vec2(round(coord.x/pixelationAmount) *pixelationAmount, round(coord.y/pixelationAmount) * pixelationAmount);

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
		rayStrength(rayPos1, rayRefDir1, coord_pixelated, raySeedA1, raySeedB1, raySpeed1);

	vec4 rays2 =
		vec4(1.0, 1.0, 1.0, 1.0) *
		rayStrength(rayPos2, rayRefDir2, coord_pixelated, raySeedA2, raySeedB2, raySpeed2);


    float transitionBrightness = 0.0;
    float radialBrightness = 0.0;


  if (u_transitionStarted == 1){
    baseColor = dark;
    transitionBrightness =  0.8-0.8*u_percentageElapsed;

  }

  respondToNarrativeCue(uv);



   radialBrightness = (1.0-distanceFromCenter(uv))*.7;






  float r = m_r*baseColor.x + rays1.x*.2 + rays2.x*.3 + radialBrightness + transitionBrightness;
  float g = m_g*baseColor.y + rays1.y*.2 + rays2.y*.3 + radialBrightness + transitionBrightness;
  float b = m_b*baseColor.z + rays1.z*.2 + rays2.z*.3 + radialBrightness + transitionBrightness;

  float a = 1.0;


  gl_FragColor.x = r;
  gl_FragColor.y = g;
  gl_FragColor.z = b;
  gl_FragColor.w = a;

}
