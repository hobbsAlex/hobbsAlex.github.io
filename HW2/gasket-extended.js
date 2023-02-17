"use strict";

var canvas;
var gl;
var x1 = -1;
var y1 = -1;
var x2 = 0;
var y2 = 1;
var x3 = 1;
var y3 = -1;
var points = [];
var disX=0;
var disY=0;
var distort = false;

var colorList = []; 
var numTimesToSubdivide = 0;

function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(x1,y1),
        vec2(x2,y2),
        vec2(x3,y3)
    ];
    divideTriangle( vertices[0], vertices[1], vertices[2],
                    numTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

        document.getElementById("slider").onchange = function(event) {
        numTimesToSubdivide = parseInt(event.target.value);
    };
	
	 var cBuffer = gl.createBuffer();
	 gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	 gl.bufferData( gl.ARRAY_BUFFER, flatten(colorList), gl.STATIC_DRAW );
	 

	 var vColor = gl.getAttribLocation( program, "vColor" );
	 gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	 gl.enableVertexAttribArray( vColor );
	
	canvas.addEventListener("mouseup", function(event) {
	  //console.log(event.clientX, event.clientY);
	  

	  var rect = gl.canvas.getBoundingClientRect();
	  var newx = (event.clientX - rect.left) / canvas.width * 2 - 1;
	  var newy = (event.clientY - rect.top) / canvas.height * -2 + 1;
	  var vertex_id = document.querySelector('input[name="vertex"]:checked').value;
	  console.log(vertex_id);
	if (vertex_id == 0) {
	  distort=false;
	  x1 = newx;
	  y1 = newy;
	} else if (vertex_id == 1) {
	  distort=false;
	  x2 = newx;
	  y2 = newy;
	} else if (vertex_id == 3) {
	  distort=true;
	  disX = newx;
	  disY = newy;
	  
	} else {
	  distort=false;
	  x3 = newx;
	  y3 = newy;
	}

console.log(newx, newy);

	});

 
  
  
    render();
};

function triangle( a, b, c )
{
	if (distort) {
	a = distortion(a);	
	b=distortion(b);
    c=distortion(c);	
	}
	
    points.push( a, b, c );
	var coolColor = vec4(Math.random(),Math.random(),Math.random(),1.0);
	colorList.push(coolColor,coolColor,coolColor);
}

function distortion(point) {
	var distortedX = 0;
	var distortedY = 0;
	var originalX = point[0];
	var originalY = point[1];
	
	var posQuadX = 1-disX;
	var posQuadY = 1-disY;
	var negQuadX = disX+1
	var negQuadY = disY+1
	if(originalX <= disX)
		distortedX = disX+((disX-originalX)*posQuadX/negQuadX);
	else
		distortedX = disX+((disX-originalX)*negQuadX/posQuadX);
	
	if(originalY <= disY)
		distortedY = disY+((disY-originalY)*posQuadY/negQuadY);
	else
		distortedY = disY+((disY-originalY)*negQuadY/posQuadY);
	
	
	return vec2(-1*distortedX, -1*distortedY);
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

window.onload = init;

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
	
		
	gl.drawArrays( gl.TRIANGLES, 0, points.length);
	
	points = [];

	requestAnimFrame(init);
		
}
