import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { STLLoader } from './jsm/loaders/STLLoader.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { PixelShader } from './jsm/shaders/PixelShader.js';
import Stats from './jsm/libs/stats.module.js'
import {Board,Entity, Brute, Predator, Scout, Guardian} from './public/dg.js';


const scene = new THREE.Scene();
var texture0 = new THREE.TextureLoader().load( '/images/background.jpeg' );
scene.background = texture0;

const axesHelper = new THREE.AxesHelper(500);
scene.add( axesHelper );

const light1 = new THREE.AmbientLight( 0xFFFFFF,0.6);
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


scene.add(light1);
scene.add(light2);
const helper = new THREE.DirectionalLightHelper( light2, 3);
scene.add( helper );

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );

const cameraHelper = new THREE.CameraHelper(light2.shadow.camera);
//scene.add(cameraHelper);

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
//controls.enableZoom = false;
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

const geometry1 = new THREE.BoxBufferGeometry(50,50, 50);

// create a default (white) Basic material
const material1 = new THREE.MeshPhongMaterial({color: 0xfab47B});
// create a Mesh containing the geometry and material
const characters = new THREE.Group();






function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}
const b = new Board();

let team1 = [];
let team2 = [];
const loader = new STLLoader();
//team1

const KintanStrider = new Brute([0,7],team1,"KintanStrider","images/kintan_strider.stl",b,scene); 

const NgOk = new Predator([1,6],team1,"NgOk","images/NG_OK.stl",b,scene);
///sfdfdsfds
const Houjix = new Scout([0,6],team1,"Houjix","images/Houjix.stl",b,scene);
const Monnok = new Guardian([1,7],team1,"Monnok","images/monnok.stl",b,scene);

//team2, clockwise asignment of indices for orbitsfkyea

const MantellianSavrip = new Brute([0,1],team2,"MantellianSavrip","images/Mantellian_Savrip.stl",b,scene);
const KLorSlug = new Predator([1,0],team2,"KLorSlug","images/K_LOR_SLUG.stl",b,scene);
const Ghhhk = new Scout([1,1],team2,"Ghhhk","images/Ghhhk.stl",b,scene);
const GrimtaashTheMolator = new Guardian([0,0],team2,"GrimtaashTheMolator",'images/grimtaash.stl',b,scene);

/*
loader.load(
    'images/K_LOR_SLUG.stl',
    function (geometry) {
        
        const NG_OK_material = new THREE.MeshPhongMaterial( {color: 0xFF00FF} );
        const mesh = new THREE.Mesh(geometry, NG_OK_material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.rotateX(-1.5708);

        //radius (y displacement) of inner orbit: 65.42 or 80 units
        //radius (y displacement) of outer orbit: 124.69 units
        //
        const r = 145;
        let x = Math.cos(toRadians(15))*r;
        let z = Math.sin(toRadians(15))*r;
        console.log(x,z);
        mesh.position.set(x,5,z);
        const b = new THREE.Vector3(0,0,1 );
        mesh.rotateOnAxis(b,toRadians(90-15));
        
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
console.log(scene.children);
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}
*/
const stats = Stats();
document.body.appendChild(stats.dom);
  

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var pickedObject = null;
var pickedObjectMaterial = null;
window.addEventListener('mousemove', function(event){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // cast a ray through the frustum
    raycaster.setFromCamera(pointer, camera);
    // get the list of objects the ray intersected
    var intersectedObjects = raycaster.intersectObjects(characters.children,true);
    if(intersectedObjects[0] != pickedObject && pickedObject != null){
        pickedObject.material = pickedObjectMaterial;
    }
    if(intersectedObjects.length >= 1){
        // pick the first object. It's the closest one
        pickedObject = intersectedObjects[0].object;
        pickedObjectMaterial = pickedObject.material;
        pickedObject.material = new THREE.MeshPhongMaterial( {color: 0x990000} );
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
window.setTimeout(function(){
    animate();
    render();
},1000);
