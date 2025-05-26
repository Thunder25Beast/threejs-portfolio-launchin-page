import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import {OrbitControls} from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

const initialCameraPosition = new THREE.Vector3(0, 0, 50);
const initialCameraRotation = new THREE.Euler(0, 0, 0);
let controls; // Declare controls here to be accessible

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


controls = new OrbitControls(camera, renderer.domElement); // Assign to the higher-scoped variable
camera.position.copy(initialCameraPosition);
camera.rotation.copy(initialCameraRotation);
controls.target.set(0, 0, 0);
controls.update(); // Important after setting position/target


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
// const tl = gsap.timeline(); // Old intro timeline, replaced for clarity
const introTextAnimation = gsap.timeline({ paused: true }); // Initialize paused

// Text Animation (runs first)
introTextAnimation.from(".animate-text", {
  duration: 1,
  opacity: 0,
  y: 50,
  stagger: 0.3,
  ease: "power3.out"
});

// REMOVE initial camera animation or comment it out
// introTextAnimation.to(camera.position, { // If you had camera animations here, ensure they are on introTextAnimation
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


if (sessionStorage.getItem('isReturningFromPortfolio') === 'true') {
    sessionStorage.removeItem('isReturningFromPortfolio');
    if (controls) controls.enabled = false; // Disable controls

    // Set camera to the state it was in *just before* navigating away
    camera.position.set(initialCameraPosition.x, 1000, 300);
    camera.rotation.set(Math.PI / 2, initialCameraRotation.y, initialCameraRotation.z);
    if (controls) {
        controls.target.set(initialCameraPosition.x, 0, 0); 
        // controls.update(); // Update after re-enabling later
    }

    const returnTl = gsap.timeline();

    // Reverse step 3 of clickTl: y from 1000 to -100
    returnTl.to(camera.position, {
        y: -100,
        duration: 1.5,
        ease: "power2.out" 
    });

    // Reverse step 2 & 1 of clickTl (simultaneously)
    // y from -100 to initialCameraPosition.y
    // z from 300 to initialCameraPosition.z
    // rotation.x from Math.PI / 2 to initialCameraRotation.x
    returnTl.to(camera.position, {
        y: initialCameraPosition.y,
        z: initialCameraPosition.z,
        duration: 2,
        ease: "power2.inOut" 
    }, "<"); 

    returnTl.to(camera.rotation, {
        x: initialCameraRotation.x,
        duration: 2,
        ease: "power3.inOut" 
    }, "<"); 

    returnTl.call(() => {
        // Ensure camera is exactly at initial state and controls are reset
        camera.position.copy(initialCameraPosition);
        camera.rotation.copy(initialCameraRotation);
        if (controls) {
            controls.target.set(0, 0, 0);
            controls.enabled = true; // Re-enable controls
            controls.update();       // Update controls
        }
        introTextAnimation.play(0); // Play intro text animation from the beginning
    });

} else {
    // Normal load, play intro text animation
    if (controls) controls.enabled = true; // Ensure controls are enabled
    introTextAnimation.play();
}


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
  sessionStorage.setItem('isReturningFromPortfolio', 'true'); // Set flag before animation
  if (controls) controls.enabled = false; // Disable controls before animation starts

  const clickTl = gsap.timeline({
    onComplete: () => {
      // Controls remain disabled as we navigate away.
      // On return, they'll be re-initialized or handled by the return logic.
      window.location.href = "https://thunder25beast.github.io/portfolio.github.io/";
    }
  });

  // 1. Initial Zoom (Commented out in original, kept for reference)
  // clickTl.to(camera.position, {
  //   z: 50, 
  //   duration: 1.5,
  //   ease: "power2.inOut"
  // });

  // 2. Rotate and Travel Upwards (Simultaneously)
  clickTl.to(camera.rotation, { // Rotation part
    x: Math.PI / 2, // Rotate upwards
    duration: 2,    // Duration for rotation
    ease: "power3.inOut"
  }, ">"); 

  clickTl.to(camera.position, { // Upward travel part (y-axis and z-axis)
    y: -100, 
    z: 10, // Corrected from Z to z
    duration: 2,    // Match rotation duration
    ease: "power2.inOut"
  }, "<"); 

  // 3. Final Zoom Towards Sky (y-axis)
  clickTl.to(camera.position, {
    y: 1000, // Final upward movement
    duration: 1.5, // Duration for this final movement
    ease: "power2.in",
    // onComplete is now part of the timeline definition
  }, ">"); 
  // clickTl.play(); // Not strictly necessary if timeline is not paused by default
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
