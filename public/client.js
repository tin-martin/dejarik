
import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import { STLLoader } from './jsm/loaders/STLLoader.js'
import Stats from './jsm/libs/stats.module.js'

const scene = new THREE.Scene()
scene.add(new THREE.AxesHelper(5))

const light = new THREE.SpotLight()
light.position.set(20, 20, 20)
scene.add(light)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.z = 250;

const renderer = new THREE.WebGLRenderer()
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


var texture1 = new THREE.TextureLoader().load( '/images/board.svg' );
const texture2 = new THREE.MeshBasicMaterial( {color: 0xFFFFFF} );
var materials = [];
materials.push(texture2);
materials.push(new THREE.MeshBasicMaterial({ map: texture1 }));

materials.push(texture2);
const geometry = new THREE.CylinderGeometry( 50, 50, 5, 32 );

const cylinder = new THREE.Mesh( geometry, materials );
scene.add( cylinder );



window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()