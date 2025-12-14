/************************************************************
 * VARIABLES GLOBALES PRINCIPALES
 ************************************************************/

// Escena, cámara y renderizador de Three.js
let scene, camera, renderer;

// Referencia al objeto 3D actual en la escena
let objetoActual = null;

// Luces del sistema de iluminación
let ambientLight, dirLight, pointLight;

// Textura utilizada para el material tipo agua
let textura = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/water.jpg"
);

// Inicialización de la escena y arranque de la animación
init();
animate();


/************************************************************
 * FUNCIÓN DE INICIALIZACIÓN GENERAL
 ************************************************************/
function init() {

  // Creación de la escena
  scene = new THREE.Scene();

  // Fondo oscuro para resaltar los objetos
  scene.background = new THREE.Color(0x0a0a25);

  // Configuración de la cámara en perspectiva
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Posición inicial de la cámara
  camera.position.set(4, 4, 6);
  camera.lookAt(0, 0, 0);

  // Configuración del renderizador
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  /********************************************************
   * CONFIGURACIÓN DE ILUMINACIÓN
   ********************************************************/

  // Luz ambiental: ilumina uniformemente toda la escena
  ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Luz direccional: simula una fuente lejana como el sol
  dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Luz puntual: emite luz desde un punto específico
  pointLight = new THREE.PointLight(0xffaa00, 1, 30);
  pointLight.position.set(-5, 5, 5);
  scene.add(pointLight);


  /********************************************************
   * EVENTOS DE BOTONES PARA CREAR / ELIMINAR OBJETOS
   ********************************************************/

  cubeBtn.onclick = () => crearObjeto("cubo");
  sphereBtn.onclick = () => crearObjeto("esfera");
  cylinderBtn.onclick = () => crearObjeto("cilindro");
  deleteBtn.onclick = eliminarObjeto;


  /********************************************************
   * EVENTOS PARA RELLENO Y MATERIALES
   ********************************************************/

  solidBtn.onclick = aplicarColor;
  gradientBtn.onclick = aplicarDegradado;
  textureBtn.onclick = aplicarTextura;

  basicBtn.onclick = () => aplicarMaterial("basic");
  lambertBtn.onclick = () => aplicarMaterial("lambert");
  phongBtn.onclick = () => aplicarMaterial("phong");
  flatBtn.onclick = aplicarFlat;
  wireBtn.onclick = toggleWire;
  fractalBtn.onclick = aplicarFractal;


  /********************************************************
   * CONTROLES DE ILUMINACIÓN (CHECKBOXES Y SLIDERS)
   ********************************************************/

  ambientCheck.onchange = () =>
    ambientLight.visible = ambientCheck.checked;

  dirCheck.onchange = () =>
    dirLight.visible = dirCheck.checked;

  pointCheck.onchange = () =>
    pointLight.visible = pointCheck.checked;

  dirIntensity.oninput = () =>
    dirLight.intensity = parseFloat(dirIntensity.value);

  lightX.oninput = () =>
    dirLight.position.x = parseFloat(lightX.value);

  lightY.oninput = () =>
    dirLight.position.y = parseFloat(lightY.value);

  lightZ.oninput = () =>
    dirLight.position.z = parseFloat(lightZ.value);


  /********************************************************
   * CONTROLES DE TRANSFORMACIÓN DEL OBJETO
   ********************************************************/

  // Rotación
  rotX.oninput = () =>
    objetoActual && (objetoActual.rotation.x = parseFloat(rotX.value));

  rotY.oninput = () =>
    objetoActual && (objetoActual.rotation.y = parseFloat(rotY.value));

  rotZ.oninput = () =>
    objetoActual && (objetoActual.rotation.z = parseFloat(rotZ.value));

  // Traslación
  posX.oninput = () =>
    objetoActual && (objetoActual.position.x = parseFloat(posX.value));

  posY.oninput = () =>
    objetoActual && (objetoActual.position.y = parseFloat(posY.value));

  posZ.oninput = () =>
    objetoActual && (objetoActual.position.z = parseFloat(posZ.value));

  // Escalación uniforme
  scale.oninput = () =>
    objetoActual && objetoActual.scale.set(
      parseFloat(scale.value),
      parseFloat(scale.value),
      parseFloat(scale.value)
    );
}


/************************************************************
 * CREACIÓN DE OBJETOS 3D
 ************************************************************/
function crearObjeto(tipo) {

  // Elimina el objeto anterior si existe
  if (objetoActual) scene.remove(objetoActual);

  let g;

  // Selección de geometría según el tipo
  if (tipo === "cubo") g = new THREE.BoxGeometry(1, 1, 1);
  if (tipo === "esfera") g = new THREE.SphereGeometry(0.8, 32, 32);
  if (tipo === "cilindro") g = new THREE.CylinderGeometry(0.6, 0.6, 1.6, 32);

  // Material por defecto
  const m = new THREE.MeshPhongMaterial({ color: 0x00aaff });

  // Creación del mesh y agregado a la escena
  objetoActual = new THREE.Mesh(g, m);
  scene.add(objetoActual);
}


/************************************************************
 * ELIMINACIÓN DEL OBJETO ACTUAL
 ************************************************************/
function eliminarObjeto() {
  if (objetoActual) {
    scene.remove(objetoActual);
    objetoActual = null;
  }
}


/************************************************************
 * RELLENO DE POLÍGONOS
 ************************************************************/

// Color homogéneo
function aplicarColor() {
  if (objetoActual)
    objetoActual.material = new THREE.MeshPhongMaterial({ color: 0x3399ff });
}

// Color degradado por vértices
function aplicarDegradado() {
  const colores = [];

  for (let i = 0; i < objetoActual.geometry.attributes.position.count; i++) {
    colores.push(Math.random(), Math.random(), Math.random());
  }

  objetoActual.geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colores, 3)
  );

  objetoActual.material = new THREE.MeshBasicMaterial({ vertexColors: true });
}

// Material con textura tipo agua
function aplicarTextura() {
  objetoActual.material = new THREE.MeshPhongMaterial({
    map: textura,
    transparent: true,
    opacity: 0.85,
    shininess: 150,
    specular: 0x88ccff,
    color: 0x3399ff
  });
}


/************************************************************
 * TÉCNICAS DE SOMBREADO
 ************************************************************/
function aplicarMaterial(tipo) {
  if (tipo === "basic")
    objetoActual.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

  if (tipo === "lambert")
    objetoActual.material = new THREE.MeshLambertMaterial({ color: 0xffaa00 });

  if (tipo === "phong")
    objetoActual.material = new THREE.MeshPhongMaterial({ color: 0x00ffff });
}

// Flat Shading
function aplicarFlat() {
  objetoActual.material.flatShading = true;
  objetoActual.material.needsUpdate = true;
}

// Wireframe ON / OFF
function toggleWire() {
  objetoActual.material.wireframe = !objetoActual.material.wireframe;
}

// Sombreado fractal mediante shaders
function aplicarFractal() {
  objetoActual.material = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        vec2 c = vUv * 3.0 - 1.5;
        vec2 z = c;
        float i;
        for(i=0.0; i<30.0; i++){
          z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
          if(length(z) > 2.0) break;
        }
        float color = i / 30.0;
        gl_FragColor = vec4(color, 0.3*color, 1.0-color, 1.0);
      }
    `
  });
}


/************************************************************
 * BUCLE DE ANIMACIÓN
 ************************************************************/
function animate() {
  requestAnimationFrame(animate);

  // Rotación automática para visualización dinámica
  if (objetoActual) objetoActual.rotation.y += 0.01;

  // Renderizado de la escena
  renderer.render(scene, camera);
}
