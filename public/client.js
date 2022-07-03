import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import { STLLoader } from './jsm/loaders/STLLoader.js'
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { PixelShader } from './jsm/shaders/PixelShader.js';

import {
  BoxBufferGeometry,
  
} from 'three';
import Stats from './jsm/libs/stats.module.js'

const scene = new THREE.Scene();
var texture0 = new THREE.TextureLoader().load( '/images/background.jpeg' );
scene.background = texture0;

const axesHelper = new THREE.AxesHelper(500);
scene.add( axesHelper );

const light1 = new THREE.AmbientLight( 0xFFFFFF,0.2);
const color = 0xFFFFFF;
const light2 = new THREE.DirectionalLight(color, 1);
light2.castShadow = true;
light2.position.set(0, 250, 0);
light2.target.position.set(-4, 0, -4);
const d = 250;
light2.shadow.camera.left = - d;
light2.shadow.camera.right = d;
light2.shadow.camera.top = d;
light2.shadow.camera.bottom = - d;
light2.shadow.mapSize.width = 5002;  
light2.shadow.mapSize.height = 5002; 
light2.shadow.camera.near = 0.5;
light2.shadow.camera.far = 500  

scene.add(light1);
scene.add(light2);
const helper = new THREE.DirectionalLightHelper( light2, 3);
scene.add( helper );

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );

const cameraHelper = new THREE.CameraHelper(light2.shadow.camera);
scene.add(cameraHelper);

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio( window.devicePixelRatio )
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(renderer.domElement)


var composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );
////////////////////////////////////////////////////////////

var pixelPass = new ShaderPass( PixelShader );
pixelPass.uniforms[ 'pixelSize' ].value = 6;
pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
composer.addPass( pixelPass );

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = false
controls.enableZoom = false;
camera.position.set(250*1.5,70*1.5, 0);
controls.update();
controls.maxPolarAngle =1.28;

var texture1 = new THREE.TextureLoader().load( '/images/board.jpg' );
const texture2 = new THREE.MeshPhongMaterial( {color: 0xffffff} );

var materials = [];
materials.push(texture2);
materials.push(new THREE.MeshStandardMaterial({ map: texture1 }));
materials.push(texture2);
const geometry = new THREE.CylinderGeometry( 190, 190, 10, 100 );

const cylinder = new THREE.Mesh( geometry,materials);
cylinder.position.set(0,0,0);

scene.add( cylinder );
const shadow_material = new THREE.ShadowMaterial();
shadow_material.opacity = 0.5;
const shadow_cylinder = new THREE.Mesh( geometry,shadow_material);
shadow_cylinder.position.set(0,0,0);

shadow_cylinder.receiveShadow = true;
scene.add( shadow_cylinder );

const geometry1 = new BoxBufferGeometry(50,50, 50);

// create a default (white) Basic material
const material1 = new THREE.MeshPhongMaterial({color: 0xfab47B});
// create a Mesh containing the geometry and material
const characters = new THREE.Group();

const loader = new STLLoader();
loader.load(
    'images/K_LOR_SLUG.stl',
    function (geometry) {
        const NG_OK_material = new THREE.MeshPhongMaterial( {color: 0xFF00FF} );
        const mesh = new THREE.Mesh(geometry, NG_OK_material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.rotateX(-1.5708);
        mesh.position.set(0,5,75.664);
        light2.target.position.set(0,5,75.664);
       
        characters.add(mesh);
        //scene.add(mesh);
       
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)
scene.add(characters);
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)


    
  

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var pickedObject = null;
console.log(scene.children);
window.addEventListener('mousemove', function(event){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // cast a ray through the frustum
    raycaster.setFromCamera(pointer, camera);
    // get the list of objects the ray intersected
    var intersectedObjects = raycaster.intersectObjects(characters.children,true);
    
    if(intersectedObjects.length >= 1 || intersectedObjects[0] == cylinder){
        // pick the first object. It's the closest one
        
        pickedObject = intersectedObjects[0].object;
        console.log(intersectedObjects[0])
        // save its color
        // var pickedObjectSavedColor = pickedObject.material.emissive.getHex();
        // set its emissive color to flashing red/yellow
        const tempMat = new THREE.MeshPhongMaterial( {color: 0xFFFFFF} );
        pickedObject.material = tempMat;
    }else if(pickedObject != null ){
        pickedObject.material =  new THREE.MeshPhongMaterial( {color: 0xFF00FF} );
      
        pickedObject = null;
    }
  }
  );


function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    composer.render(scene, camera)
}

animate()
