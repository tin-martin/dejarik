import * as THREE from 'three';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { STLLoader } from './jsm/loaders/STLLoader.js';
import { EffectComposer } from './jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './jsm/postprocessing/ShaderPass.js';
import { PixelShader } from './jsm/shaders/PixelShader.js';
import { VignetteShader} from './jsm/shaders/VignetteShader.js';
import { OutlinePass} from './jsm/postprocessing/OutlinePass.js';
import Stats from './jsm/libs/stats.module.js'

import {Board,Entity, Brute, Predator, Scout, Guardian, Team} from './public/dg.js';


const scene = new THREE.Scene();
var texture0 = new THREE.TextureLoader().load( '/images/background.jpeg' );
scene.background = texture0;

//const axesHelper = new THREE.AxesHelper(500);
//scene.add( axesHelper );

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
//const helper = new THREE.DirectionalLightHelper( light2, 3);
//scene.add( helper );

let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 3000 );

//const cameraHelper = new THREE.CameraHelper(light2.shadow.camera);
//scene.add(cameraHelper);

const renderer = new THREE.WebGLRenderer();


renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio( window.devicePixelRatio )
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
document.body.appendChild(renderer.domElement);


var composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.visibleEdgeColor = new THREE.Color( 0.5, 1, 1 );
composer.addPass( outlinePass );

////////////////////////////////////////////////////////////

var pixelPass = new ShaderPass( PixelShader );
pixelPass.uniforms[ 'pixelSize' ].value = 3;//6;
pixelPass.uniforms[ 'resolution' ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
pixelPass.uniforms[ 'resolution' ].value.multiplyScalar( window.devicePixelRatio );
composer.addPass( pixelPass );
//chicken
var a = new ShaderPass(VignetteShader );
composer.addPass( a );

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = false
controls.enableZoom = false;
//0.5 is scale (smaller number means closer)
camera.position.set(250*1.25,70*1.25, 0);
controls.update();
controls.maxPolarAngle = 1.28;

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



function toDegrees (angle) {
    return angle * (180 / Math.PI);
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
}
const b = new Board();

//const characters = new THREE.Group();

let team1 = new Team("team1",0xFF0000);
let team2 = new Team("team2",0x0000FF);

var activeTeam = team2;
//for sudden death
let team1Counter = 3;
let team2Counter = 3;

const loader = new STLLoader();
//team1
const KintanStrider = new Brute([0,6],team1,"KintanStrider","images/kintan_strider.stl",b,scene,outlinePass); 

const NgOk = new Predator([1,7],team1,"NgOk","images/NG_OK.stl",b,scene,outlinePass);
const Houjix = new Scout([0,7],team1,"Houjix","images/Houjix.stl",b,scene,outlinePass);
const Monnok = new Guardian([1,6],team1,"Monnok","images/monnok.stl",b,scene,outlinePass);

//team2, clockwise asignment of indices for orbitsfkyea
const MantellianSavrip = new Brute([0,0],team2,"MantellianSavrip","images/Mantellian_Savrip.stl",b,scene,outlinePass);
const KLorSlug = new Predator([1,1],team2,"KLorSlug","images/K_LOR_SLUG.stl",b,scene,outlinePass);
const Ghhhk = new Scout([1,0],team2,"Ghhhk","images/Ghhhk.stl",b,scene,outlinePass);
const GrimtaashTheMolator = new Guardian([0,1],team2,"GrimtaashTheMolator",'images/grimtaash.stl',b,scene,outlinePass);


/*
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
//const rayHelper = new THREE.CameraHelper(raycaster.frustum.camera);
//scene.add(rayHelper);
const pointer = new THREE.Vector2();
var pickedObject = null;
var pickedObjectMaterial = null;


//centered on 0,0
function isInCircle(r,x,z){
    //equation of circle: r^2 = x^2 + y^2
 // console.log(x,y);

    var z_max = Math.abs( Math.sqrt(Math.pow(r,2)-Math.pow(x,2)) );
    var z_min = -z_max;
    var x_max = Math.abs( Math.sqrt(Math.pow(r,2)-Math.pow(z,2)) );;
    var x_min = -x_max;
    if(z_max > z && z > z_min && x_max > x && x > x_min){
        return true;
    }
    return false;
}

var mouse_x;
var mouse_y;
var entity_orbit;
var entity_ray;

function canAttackChain(entity){
    //enemy coords [coordX,coordY]
    for(let i=0;i<2;i++){
        for(let j=0;j<12;j++){
            let enemy = b.get([i,j]);
            if(entity.isLegalAttack([i,j])){
                if(enemy.team != activeTeam){
                    return true;
                }
            }
        }
    }
    return false;
}
function action(coordX, coordY,entity){
  //  action(entity_orbit,entity_ray,pickedObject);
    if(entity.team != activeTeam){
        console.log("Not your turn",activeTeam.name);
        return;
    }
    //replace all this shtuff with mouse pointing action !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // ACOUNT FOR ANIMATION AND GRPAHICS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //coordX, coordY replaced by mouse_x, mouse_y

    if(entity.isLegalAttack([coordX,coordY])){
       
        console.log(b.get([coordX,coordY]));
        console.log(entity);
        console.log("-------");
        entity.attack([coordX,coordY]);
        //attack
        //restart sudden death
        if(entity.team.length == 1){
            if(team1 == entity.team){
                team1Counter = 3;
            }else{
                team2Counter = 3;
            }
        }
        if(!canAttackChain(entity)){
            activeTeam = activeTeam == team1 ? team2 : team1;
        }
    }else if(entity.isLegalMove([coordX,coordY]) ){
        //move
        console.log(b.get([coordX,coordY]));
        console.log(entity);
        console.log("-------");
        entity.move([coordX,coordY]);
        //for sudden death;
        if(entity.team.length == 1){
            if(team1 == entity.team){
                team1Counter -= 1;
            }else{
                team2Counter -= 1;
            }
        }
      
        activeTeam = activeTeam == team1 ? team2 : team1;
    }else{
        console.log("Invalid");
        console.group(b.get([coordX,coordY]));
    }   
   
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
}




window.addEventListener('mousedown', function(event){
    //for the characters
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    // cast a ray through the frustum
    raycaster.setFromCamera(pointer, camera);
    // get the list of objects the ray intersected
    var intersectedObjects = raycaster.intersectObjects(scene.children,true);
    //ring radii: 31.45,99.35,150
    if(intersectedObjects.length != 0){
        if(intersectedObjects[0].object == cylinder){
          
            //if hits dejarik, return
            var x = intersectedObjects[0].point.x;
            var y = intersectedObjects[0].point.y;
            var z = intersectedObjects[0].point.z;
            if(isInCircle(40,z,x)){
                return;
            }
             //if y coord is not 5 (rounded to nearest int) return <-- means it hits the side
           // if(Math.round(y) != 5){
           //     return;
           // } 
            //check which orbit
            if(isInCircle(125,z,x)){
               
                mouse_x = 0;
            }else {
                mouse_x = 1;
       
            }
            //angles are clockwise
            //check angle 
            var r = Math.sqrt(Math.pow(x,2)+Math.pow(z,2));
            //  sin(angle)
            // r^2 = x^2 + y^2
            var angle = toDegrees(Math.asin(z/r));
            //q1
            if(z > 0 && x > 0){
            }else if(z < 0 && x > 0){
                //q2
                angle = 90*3 + (90 + angle);
            }else if(z < 0 && x < 0){
                //q3
                angle = 180 + Math.abs(angle);
            }else{
                //q4
                angle = 90 + (90 - angle);
            }
            for(var i=0;i<12;i++){
                if(i*30 < angle && angle < 30+i*30){
                    if(i == 11){
                        mouse_y = 0;
                    }else{
                        mouse_y = i+1;
                    }
                    break;
                }
            }
            console.log(mouse_x,mouse_y);
            if(pickedObject != null){
                action(mouse_x, mouse_y,pickedObject);
            }
          
        }else{
            intersectedObjects = raycaster.intersectObjects(scene.children,true);
            if(intersectedObjects[0] != pickedObject && pickedObject != null){
                pickedObject.material = pickedObjectMaterial;
            }
            
            if(intersectedObjects.length >= 1){
                // pick the first object. It's the closest one
                //pickedObject is a mesh dum dum not a friggen Entity obj
                

                var x = intersectedObjects[0].point.x;
                var y = intersectedObjects[0].point.y;
                var z = intersectedObjects[0].point.z;
                if(isInCircle(40,z,x)){
                    return;
                }
                //if y coord is not 5 (rounded to nearest int) return <-- means it hits the side
            // if(Math.round(y) != 5){
            //     return;
            // } 
                //check which orbit
                if(isInCircle(125,z,x)){
                    entity_orbit = 0;
                }else {
                    entity_orbit = 1;
        
                }
                //angles are clockwise
                //check angle 
                var r = Math.sqrt(Math.pow(x,2)+Math.pow(z,2));
                //  sin(angle)
                // r^2 = x^2 + y^2
                var angle = toDegrees(Math.asin(z/r));
                //q1
                if(z > 0 && x > 0){
                }else if(z < 0 && x > 0){
                    //q2
                    angle = 90*3 + (90 + angle);
                }else if(z < 0 && x < 0){
                    //q3
                    angle = 180 + Math.abs(angle);
                }else{
                    //q4
                    angle = 90 + (90 - angle);
                }
                for(var i=0;i<12;i++){
                    if(i*30 < angle && angle < 30+i*30){
                        if(i == 11){
                            entity_ray = 0;
                        }else{
                            entity_ray = i+1;
                        }
                        break;
                    }
                }

              //  var pickedMesh = intersectedObjects[0].object;
               // pickedMesh.material = new THREE.MeshPhongMaterial( {color: 0x999900} );
               // console.log(entity_orbit,entity_ray);
                let temp = b.grid[entity_orbit][entity_ray];
                if(temp.team == activeTeam){
                    pickedObject = b.grid[entity_orbit][entity_ray];
                }else if(pickedObject != null){ 
                    action(entity_orbit,entity_ray,pickedObject);
                }
            }  
        }
    }
  });



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
