import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
console.log(OrbitControls)
const gui= new dat.GUI()
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)
  

gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)

gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)

gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

function generatePlane (){
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

  
// vertice position randomisation
  const { array }= planeMesh.geometry.attributes.position
  const randomValues = []
  for(let i=0; i<array.length ; i ++){

  if(i % 3 ===0){
  const x= array[i]
  const y= array[i + 1]
  const z= array[i + 2]

  array[i ] = x + (Math.random() - 0.5) *3
  array[i + 1] = y + (Math.random() - 0.5) * 3
  array[i + 2] = z +(Math.random() - 0.5) * 3
  }
  randomValues.push(Math.random() * Math.PI *2)
}
planeMesh.geometry.attributes.position.randomValues = randomValues
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array



const colors = []
for (let i=0; i<planeMesh.geometry.attributes.position.count; i++){
  colors.push(0, 0.19, 0.4)
}
planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))

}

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)


new OrbitControls(camera, renderer.domElement)
camera.position.z = 50

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
const planeMaterial = new THREE.MeshPhongMaterial({

side: THREE.DoubleSide, 
flatShading: THREE.FlatShading ,
vertexColors: true
})
const planeMesh= new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(planeMesh)

generatePlane()

// Create starfield
const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff
})

const starVertices = []
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = (Math.random() - 0.5) * 2000
  starVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 1, -1)
scene.add(backLight)

const mouse = {
  x: undefined ,
  y: undefined
}

// GSAP Animations
const tl = gsap.timeline();

// Text Animation (runs first)
tl.from(".animate-text", {
  duration: 1,
  opacity: 0,
  y: 50,
  stagger: 0.3,
  ease: "power3.out"
});

// REMOVE initial camera animation or comment it out
// tl.to(camera.position, {
//   z: 15, 
//   duration: 2,
//   ease: "power3.inOut"
// }, ">"); 

// tl.to(camera.position, {
//   x: -20, 
//   y: 10, 
//   duration: 2,
//   ease: "power2.inOut"
// }, ">-0.5"); 

// tl.to(camera.rotation, {
//   y: Math.PI / 8, 
//   x: -Math.PI / 16, 
//   duration: 2,
//   ease: "power2.inOut"
// }, "<"); 


let frame  = 0
function animate(){
  requestAnimationFrame(animate)
  frame+= 0.01
  renderer.render(scene, camera)

  // Rotate starfield
  stars.rotation.x += 0.0005
  stars.rotation.y += 0.0005

  raycaster.setFromCamera(mouse, camera)

  const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
  for(let i=0;i< array.length; i += 3){
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01
  
    array[i +1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  
  
  
  }

  planeMesh.geometry.attributes.position.needsUpdate = true
  

  const intersects = raycaster.intersectObject(planeMesh)
  if(intersects.length > 0){

    const {color} = intersects[0].object.geometry.attributes
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)

    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    intersects[0].object.geometry.attributes.color.needsUpdate = true
    
    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }

    const hoverColor = {
      r: 0.1,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate :() => {
        color.setX(intersects[0].face.a,  hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)
    
        color.setX(intersects[0].face.b,  hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)
    
        color.setX(intersects[0].face.c,  hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
      }
  })

  }
}


animate()

const viewWorkBtn = document.getElementById('viewWorkBtn');
viewWorkBtn.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default link behavior

  const clickTl = gsap.timeline();

  // 1. Initial Zoom
  // clickTl.to(camera.position, {
  //   z: 50, 
  //   duration: 1.5,
  //   ease: "power2.inOut"
  // });

  // 2. Rotate and Travel Upwards (Simultaneously)
  // This block starts after the initial zoom.
  clickTl.to(camera.rotation, { // Rotation part
    x: Math.PI / 2, // Rotate upwards
    duration: 2,    // Duration for rotation
    ease: "power3.inOut"
  }, ">"); 

  clickTl.to(camera.position, { // Upward travel part (y-axis)
    y: -100, 
    Z: 300,
    duration: 2,    // Match rotation duration
    ease: "power2.inOut"
  }, "<"); 

  // 3. Final Zoom Towards Sky (z-axis)
  // This starts after the rotation and upward travel block completes.
  clickTl.to(camera.position, {
    y: 1000, // Final zoom
    duration: 1.5, // Duration for this final zoom
    ease: "power2.in",
    onComplete: () => {
      window.location.href = "https://thunder25beast.github.io/portfolio.github.io/";
    }
  }, ">"); 
});

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) *2 -1;
  mouse.y = -(event.clientY / innerHeight) *2 + 1;
  // console.log(mouse) // It's good practice to remove or comment out console.logs when not actively debugging
});

// Handle browser resize
window.addEventListener('resize', () => {
  // Update camera
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Consider device pixel ratio for sharpness
});
