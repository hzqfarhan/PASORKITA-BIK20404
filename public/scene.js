import * as THREE from '/vendor/three/three.module.js';

const canvas=document.querySelector('#hero-three');
if(canvas){
  let renderer;
  try{
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x000000,0);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,40);camera.position.z=7;
    scene.add(new THREE.HemisphereLight(0xfff2de,0x6b3347,3));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,5);scene.add(key);
    const group=new THREE.Group();scene.add(group);
    const gold=new THREE.MeshStandardMaterial({color:0xc3a26a,roughness:.45,metalness:.15,flatShading:true});
    const wine=new THREE.MeshStandardMaterial({color:0x8c3c58,roughness:.6,flatShading:true});
    const lilac=new THREE.MeshStandardMaterial({color:0xb9a0ce,roughness:.6,flatShading:true});
    const shapes=[new THREE.Mesh(new THREE.IcosahedronGeometry(.19,0),gold),new THREE.Mesh(new THREE.OctahedronGeometry(.23,0),wine),new THREE.Mesh(new THREE.BoxGeometry(.22,.22,.22),lilac)];
    const positions=[[-1.75,1.1,0],[1.55,-.6,.2],[-1.55,-1.15,0]];
    shapes.forEach((shape,index)=>{shape.position.set(...positions[index]);group.add(shape);});
    const resize=()=>{const rect=canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();renderer.render(scene,camera);};
    const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
    const motion=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,start=performance.now(),pointerX=0,pointerY=0;
    const move=event=>{const rect=canvas.parentElement.getBoundingClientRect();pointerX=((event.clientX-rect.left)/rect.width-.5)*.08;pointerY=((event.clientY-rect.top)/rect.height-.5)*.08;};
    canvas.parentElement.addEventListener('pointermove',move);
    const draw=time=>{frame=requestAnimationFrame(draw);if(document.hidden||motion.matches)return;const t=(time-start)/1000;shapes.forEach((shape,i)=>{shape.rotation.x=t*.16+i;shape.rotation.y=t*.23+i;shape.position.y=positions[i][1]+Math.sin(t*.65+i)*.12;});group.rotation.y=pointerX;group.rotation.x=pointerY;renderer.render(scene,camera);};
    if(!motion.matches)frame=requestAnimationFrame(draw);
    const motionChange=()=>{cancelAnimationFrame(frame);if(!motion.matches)frame=requestAnimationFrame(draw);else renderer.render(scene,camera);};motion.addEventListener('change',motionChange);
    canvas.dataset.engine='threejs';
    window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();motion.removeEventListener('change',motionChange);canvas.parentElement.removeEventListener('pointermove',move);shapes.forEach(shape=>shape.geometry.dispose());[gold,wine,lilac].forEach(material=>material.dispose());renderer.dispose();},{once:true});
  }catch{
    renderer?.dispose();canvas.hidden=true;
    // The retained SVG artwork and CSS 3D cards work without WebGL.
  }
}
