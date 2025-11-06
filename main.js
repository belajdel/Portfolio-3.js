import './style.css';
import * as THREE from 'three';
import * as dat from 'dat.gui';
import gsap from 'gsap';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// VARIABLES
let theme = 'light';
let bookCover = null;
let cvBook = null; // New: CV book reference
let lightSwitch = null;
let titleText = null;
let subtitleText = null;
let mixer;
let isMobile = window.matchMedia('(max-width: 992px)').matches;
let canvas = document.querySelector('.experience-canvas');
const loaderWrapper = document.getElementById('loader-wrapper');
let clipNames = [
  'fan_rotation',
  'fan_rotation.001',
  'fan_rotation.002',
  'fan_rotation.003',
  'fan_rotation.004',
];
let projects = [
  {
    image: 'textures/project-spaze.webp',
    url: 'https://www.spaze.social/',
  },
  {
    image: 'textures/project-myteachers.jpg',
    url: '',
  },
  {
    image: 'textures/project-wholesale.jpg',
    url: '',
  },
  {
    image: 'textures/project-pelotero.jpg',
    url: '',
  },
];

// NEW: Graphic design work array
let graphicDesigns = [
  {
    image: 'textures/design-1.jpg',
    title: 'Brand Identity',
  },
  {
    image: 'textures/design-2.jpg',
    title: 'Poster Design',
  },
  {
    image: 'textures/design-3.jpg',
    title: 'UI/UX Design',
  },
  {
    image: 'textures/design-4.jpg',
    title: 'Social Media',
  },
];

let aboutCameraPos = {
  x: 0.12,
  y: 0.2,
  z: 0.55,
};
let aboutCameraRot = {
  x: -1.54,
  y: 0.13,
  z: 1.41,
};
let projectsCameraPos = {
  x: 1,
  y: 0.45,
  z: 0.01,
};
let projectsCameraRot = {
  x: 0.05,
  y: 0.05,
  z: 0,
};

// NEW: CV camera position
let cvCameraPos = {
  x: 0.15,
  y: 0.35,
  z: 0.25,
};
let cvCameraRot = {
  x: -0.8,
  y: 0.5,
  z: 0.6,
};

// NEW: Graphic design wall camera position
let designCameraPos = {
  x: -0.5,
  y: 0.5,
  z: 0.3,
};
let designCameraRot = {
  x: 0,
  y: -1.57,
  z: 0,
};

// SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
let defaultCameraPos = {
  x: 1.009028643133046,
  y: 0.5463638814987481,
  z: 0.4983449671971262,
};
let defaultCamerRot = {
  x: -0.8313297556598935,
  y: 0.9383399492446749,
  z: 0.7240714481613063,
};
camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.minDistance = 0.9;
controls.maxDistance = 1.6;
controls.minAzimuthAngle = 0.2;
controls.maxAzimuthAngle = Math.PI * 0.78;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// LOAD MODEL & ASSET
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  'models/room.glb',
  function (room) {
    loaderWrapper.style.display = 'none';

    // load video
    const video = document.createElement('video');
    video.src = 'textures/arcane.mp4';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    room.scene.children.forEach((child) => {
      if (child.name !== 'Wall') {
        child.castShadow = true;
      }
      child.receiveShadow = true;

      if (child.children) {
        child.children.forEach((innerChild) => {
          if (innerChild.name !== 'Book001' && innerChild.name !== 'Switch') {
            innerChild.castShadow = true;
          }
          innerChild.receiveShadow = true;
        });
      }

      if (child.name === 'Stand') {
        child.children[0].material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
        video.play();
      }

      if (child.name === 'CPU') {
        child.children[0].material = new THREE.MeshPhysicalMaterial();
        child.children[0].material.roughness = 0;
        child.children[0].material.color.set(0x999999);
        child.children[0].material.ior = 3;
        child.children[0].material.transmission = 2;
        child.children[0].material.opacity = 0.8;
        child.children[0].material.depthWrite = false;
        child.children[0].material.depthTest = false;
        child.children[1].material = new THREE.MeshPhysicalMaterial();
        child.children[1].material.roughness = 0;
        child.children[1].material.color.set(0x999999);
        child.children[1].material.ior = 3;
        child.children[1].material.transmission = 1;
        child.children[1].material.opacity = 0.8;
        child.children[1].material.depthWrite = false;
        child.children[1].material.depthTest = false;
      }

      if (child.name === 'Book') {
        bookCover = child.children[0];
        const bookTexture = new THREE.TextureLoader().load(
          'textures/book-inner.jpg'
        );
        bookTexture.flipY = false;
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: bookTexture,
        });
      }

      if (child.name === 'SwitchBoard') {
        lightSwitch = child.children[0];
      }
    });

    scene.add(room.scene);
    
    // NEW: Add CV book on desk
    createCVBook();
    
    // NEW: Add graphic design wall gallery
    createDesignGallery();
    
    // NEW: Add interactive lighting effects
    addInteractiveLighting();
    
    animate();

    mixer = new THREE.AnimationMixer(room.scene);
    const clips = room.animations;
    clipNames.forEach((clipName) => {
      const clip = THREE.AnimationClip.findByName(clips, clipName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
    });

    loadIntroText();
    aboutMenuListener();
    projectsMenuListener();
    // NEW: Add design gallery listener
    designMenuListener();
    init3DWorldClickListeners();
    initResponsive(room.scene);
  },
  function (error) {
    console.error(error);
  }
);

// ADD LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const roomLight = new THREE.PointLight(0xffffff, 2.5, 10);
roomLight.position.set(0.3, 2, 0.5);
roomLight.castShadow = true;
roomLight.shadow.radius = 5;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
roomLight.shadow.camera.far = 2.5;
roomLight.shadow.bias = -0.002;
scene.add(roomLight);

// Fan lights
const fanLight1 = new THREE.PointLight(0xff0000, 30, 0.2);
const fanLight2 = new THREE.PointLight(0x00ff00, 30, 0.12);
const fanLight3 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight4 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight5 = new THREE.PointLight(0x00ff00, 30, 0.05);
fanLight1.position.set(0, 0.29, -0.29);
fanLight2.position.set(-0.15, 0.29, -0.29);
fanLight3.position.set(0.21, 0.29, -0.29);
fanLight4.position.set(0.21, 0.19, -0.29);
fanLight5.position.set(0.21, 0.08, -0.29);
scene.add(fanLight1, fanLight2, fanLight3, fanLight4, fanLight5);

// Text lights
const pointLight1 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight2 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight3 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight4 = new THREE.PointLight(0xff0000, 0, 1.1);
pointLight1.position.set(-0.2, 0.6, 0.24);
pointLight2.position.set(-0.2, 0.6, 0.42);
pointLight3.position.set(-0.2, 0.6, 0.01);
pointLight4.position.set(-0.2, 0.6, -0.14);
scene.add(pointLight1, pointLight2, pointLight3, pointLight4);

// NEW: Spotlight for CV book
const cvSpotlight = new THREE.SpotLight(0xffffff, 0, 1, Math.PI / 6, 0.5, 2);
cvSpotlight.position.set(0.2, 0.6, 0.3);
cvSpotlight.target.position.set(0.2, 0.15, 0.3);
cvSpotlight.castShadow = true;
scene.add(cvSpotlight);
scene.add(cvSpotlight.target);

// NEW: Gallery wall lights
const galleryLight1 = new THREE.SpotLight(0xffffff, 2, 2, Math.PI / 4, 0.3, 1);
const galleryLight2 = new THREE.SpotLight(0xffffff, 2, 2, Math.PI / 4, 0.3, 1);
const galleryLight3 = new THREE.SpotLight(0xffffff, 2, 2, Math.PI / 4, 0.3, 1);
const galleryLight4 = new THREE.SpotLight(0xffffff, 2, 2, Math.PI / 4, 0.3, 1);
scene.add(galleryLight1, galleryLight2, galleryLight3, galleryLight4);

// NEW: Create CV Book on desk
function createCVBook() {
  const bookGeometry = new THREE.BoxGeometry(0.12, 0.015, 0.16);
  
  // Load CV texture
  const cvTexture = new THREE.TextureLoader().load('textures/cv-cover.jpg');
  const cvMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x8B4513 }), // right
    new THREE.MeshStandardMaterial({ color: 0x8B4513 }), // left
    new THREE.MeshStandardMaterial({ map: cvTexture }), // top (cover)
    new THREE.MeshStandardMaterial({ color: 0xF5F5DC }), // bottom
    new THREE.MeshStandardMaterial({ color: 0x8B4513 }), // front
    new THREE.MeshStandardMaterial({ color: 0x8B4513 }), // back
  ];
  
  cvBook = new THREE.Mesh(bookGeometry, cvMaterials);
  cvBook.name = 'CVBook';
  cvBook.position.set(0.2, 0.158, 0.3); // On the desk
  cvBook.rotation.y = -0.3;
  cvBook.castShadow = true;
  cvBook.receiveShadow = true;
  scene.add(cvBook);
  
  // Add subtle glow effect
  const glowGeometry = new THREE.BoxGeometry(0.13, 0.02, 0.17);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0,
  });
  const cvGlow = new THREE.Mesh(glowGeometry, glowMaterial);
  cvGlow.name = 'CVGlow';
  cvBook.add(cvGlow);
}

// NEW: Create Design Gallery on opposite wall
function createDesignGallery() {
  graphicDesigns.forEach((design, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    
    // Create frame
    const frameGeometry = new THREE.BoxGeometry(0.35, 0.25, 0.01);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2C2C2C,
      metalness: 0.3,
      roughness: 0.7,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    
    // Create design plane
    const designGeometry = new THREE.PlaneGeometry(0.32, 0.22);
    const designTexture = new THREE.TextureLoader().load(design.image);
    const designMaterial = new THREE.MeshStandardMaterial({
      map: designTexture,
      emissive: 0x000000,
      emissiveIntensity: 0,
    });
    const designPlane = new THREE.Mesh(designGeometry, designMaterial);
    designPlane.position.z = 0.011;
    designPlane.name = 'design';
    designPlane.userData = { 
      index: i,
      originalEmissive: 0x000000,
    };
    
    frame.add(designPlane);
    frame.position.set(-0.7, 0.6 - row * 0.35, 0.2 + col * 0.4);
    frame.rotation.y = Math.PI / 2;
    frame.castShadow = true;
    frame.receiveShadow = true;
    
    // Store references
    design.mesh = designPlane;
    design.frame = frame;
    
    // Setup gallery light
    const galleryLights = [galleryLight1, galleryLight2, galleryLight3, galleryLight4];
    galleryLights[i].position.set(-0.5, 0.8 - row * 0.35, 0.2 + col * 0.4);
    galleryLights[i].target.position.set(-0.7, 0.6 - row * 0.35, 0.2 + col * 0.4);
    scene.add(galleryLights[i].target);
    
    scene.add(frame);
  });
}

// NEW: Add interactive lighting effects
function addInteractiveLighting() {
  const mousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  
  // Mouse move for spotlight effects
  window.addEventListener('mousemove', (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Reset all design emissive
    graphicDesigns.forEach(design => {
      if (design.mesh) {
        gsap.to(design.mesh.material, {
          emissiveIntensity: 0,
          duration: 0.3,
        });
      }
    });
    
    // Highlight hovered design
    intersects.forEach(intersect => {
      if (intersect.object.name === 'design') {
        gsap.to(intersect.object.material, {
          emissive: 0xffaa00,
          emissiveIntensity: 0.3,
          duration: 0.3,
        });
      }
      
      // Highlight CV book
      if (intersect.object.name === 'CVBook') {
        const glow = intersect.object.children.find(c => c.name === 'CVGlow');
        if (glow) {
          gsap.to(glow.material, {
            opacity: 0.3,
            duration: 0.3,
          });
          gsap.to(cvSpotlight, {
            intensity: 3,
            duration: 0.3,
          });
        }
      } else {
        // Reset CV glow
        if (cvBook) {
          const glow = cvBook.children.find(c => c.name === 'CVGlow');
          if (glow) {
            gsap.to(glow.material, {
              opacity: 0,
              duration: 0.3,
            });
          }
        }
        gsap.to(cvSpotlight, {
          intensity: 0,
          duration: 0.3,
        });
      }
    });
  });
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  
  // NEW: Animate fan lights cycling
  const time = clock.getElapsedTime();
  fanLight1.intensity = 30 + Math.sin(time * 2) * 5;
  fanLight2.intensity = 30 + Math.sin(time * 2 + 1) * 5;
  fanLight3.intensity = 30 + Math.sin(time * 2 + 2) * 5;
  
  renderer.render(scene, camera);
}

function loadIntroText() {
  const loader = new FontLoader();
  loader.load('fonts/unione.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const titleGeo = new TextGeometry('Amine Belajdel', {
      font: font,
      size: 0.08,
      height: 0.01,
    });
    titleText = new THREE.Mesh(titleGeo, textMaterials);
    titleText.rotation.y = Math.PI * 0.5;
    titleText.position.set(-0.27, 0.55, 0.5);
    scene.add(titleText);
  });

  loader.load('fonts/helvatica.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const subTitleGeo = new TextGeometry(
      '                                                    Web Designer / Developer',
      {
        font: font,
        size: 0.018,
        height: 0,
      }
    );
    subtitleText = new THREE.Mesh(subTitleGeo, textMaterials);
    subtitleText.rotation.y = Math.PI * 0.5;
    subtitleText.position.set(-0.255, 0.5, 0.5);
    scene.add(subtitleText);
  });
}

function switchTheme(themeType) {
  if (themeType === 'dark') {
    lightSwitch.rotation.z = Math.PI / 7;
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');

    gsap.to(roomLight.color, {
      r: 0.27254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(ambientLight.color, {
      r: 0.17254901960784313,
      g: 0.23137254901960785,
      b: 0.6862745098039216,
    });
    gsap.to(roomLight, { intensity: 1.5 });
    gsap.to(ambientLight, { intensity: 0.3 });
    gsap.to(fanLight5, { distance: 0.07 });

    // Enhance gallery lights in dark mode
    [galleryLight1, galleryLight2, galleryLight3, galleryLight4].forEach(light => {
      gsap.to(light, { intensity: 3, duration: 1 });
    });

    gsap.to(titleText.material[0].color, { r: 8, g: 8, b: 8, duration: 0 });
    gsap.to(titleText.material[1].color, { r: 5, g: 5, b: 5, duration: 0 });
    gsap.to(subtitleText.material[0].color, { r: 8, g: 8, b: 8, duration: 0 });
    gsap.to(subtitleText.material[1].color, { r: 5, g: 5, b: 5, duration: 0 });

    gsap.to(pointLight1, { intensity: 0.6 });
    gsap.to(pointLight2, { intensity: 0.6 });
    gsap.to(pointLight3, { intensity: 0.6 });
    gsap.to(pointLight4, { intensity: 0.6 });
  } else {
    lightSwitch.rotation.z = 0;
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    gsap.to(roomLight.color, { r: 1, g: 1, b: 1 });
    gsap.to(ambientLight.color, { r: 1, g: 1, b: 1 });
    gsap.to(roomLight, { intensity: 2.5 });
    gsap.to(ambientLight, { intensity: 0.6 });
    gsap.to(fanLight5, { distance: 0.05 });

    [galleryLight1, galleryLight2, galleryLight3, galleryLight4].forEach(light => {
      gsap.to(light, { intensity: 2, duration: 1 });
    });

    gsap.to(titleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(titleText.material[1].color, { r: 1, g: 1, b: 1, duration: 0 });
    gsap.to(subtitleText.material[0].color, {
      r: 0.09019607843137255,
      g: 0.12156862745098039,
      b: 0.15294117647058825,
      duration: 0,
    });
    gsap.to(subtitleText.material[1].color, { r: 1, g: 1, b: 1, duration: 0 });

    gsap.to(pointLight1, { intensity: 0 });
    gsap.to(pointLight2, { intensity: 0 });
    gsap.to(pointLight3, { intensity: 0 });
    gsap.to(pointLight4, { intensity: 0 });
  }
}

function enableOrbitControls() {
  controls.enabled = true;
}

function disableOrbitControls() {
  controls.enabled = false;
}

function enableCloseBtn() {
  document.getElementById('close-btn').style.display = 'block';
}

function disableCloseBtn() {
  document.getElementById('close-btn').style.display = 'none';
}

function resetBookCover() {
  if (!bookCover) return;
  gsap.to(bookCover.rotation, { x: 0, duration: 1.5 });
}

function resetProjects() {
  if (projects.length === 0) return;
  projects.forEach((project) => {
    gsap.to(project.mesh.material, { opacity: 0, duration: 1 });
    gsap.to(project.mesh.position, { y: project.y, duration: 1 });
    gsap.to(project.mesh.scale, { x: 0, y: 0, z: 0, duration: 0, delay: 1 });
  });
}

// NEW: Reset design gallery
function resetDesigns() {
  graphicDesigns.forEach(design => {
    if (design.mesh) {
      gsap.to(design.mesh.material, {
        emissiveIntensity: 0,
        duration: 0.5,
      });
    }
  });
}

function resetCamera() {
  resetBookCover();
  resetProjects();
  resetDesigns();
  disableCloseBtn();
  gsap.to(camera.position, { ...defaultCameraPos, duration: 1.5 });
  gsap.to(camera.rotation, { ...defaultCamerRot, duration: 1.5 });
  gsap.delayedCall(1.5, enableOrbitControls);

  if (theme !== 'dark') {
    gsap.to(roomLight, { intensity: 2.5, duration: 1.5 });
  }
}

function cameraToAbout() {
  if (!bookCover) return;
  gsap.to(camera.position, { ...aboutCameraPos, duration: 1.5 });
  gsap.to(camera.rotation, { ...aboutCameraRot, duration: 1.5 });
  gsap.to(bookCover.rotation, { x: Math.PI, duration: 1.5, delay: 1.5 });

  if (theme !== 'dark') {
    gsap.to(roomLight, { intensity: 1, duration: 1.5 });
  }
}

// NEW: Camera to CV book
function cameraToCVBook() {
  if (!cvBook) return;
  disableOrbitControls();
  resetProjects();
  resetDesigns();
  gsap.to(camera.position, { ...cvCameraPos, duration: 1.5 });
  gsap.to(camera.rotation, { ...cvCameraRot, duration: 1.5 });
  gsap.to(cvSpotlight, { intensity: 5, duration: 1.5 });
  gsap.delayedCall(1.5, enableCloseBtn);
}

// NEW: Camera to design gallery
function cameraToDesigns() {
  disableOrbitControls();
  resetBookCover();
  resetProjects();
  gsap.to(camera.position, { ...designCameraPos, duration: 1.5 });
  gsap.to(camera.rotation, { ...designCameraRot, duration: 1.5 });
  
  // Animate designs appearing
  graphicDesigns.forEach((design, i) => {
    if (design.mesh) {
      gsap.to(design.mesh.material, {
        emissive: 0xffaa00,
        emissiveIntensity: 0.2,
        duration: 0.5,
        delay: 1.5 + i * 0.2,
      });
    }
  });
  
  gsap.delayedCall(1.5, enableCloseBtn);
}

function aboutMenuListener() {
  document.getElementById('about-menu').addEventListener('click', function (e) {
    e.preventDefault();
    disableOrbitControls();
    resetProjects();
    resetDesigns();
    cameraToAbout();
    gsap.delayedCall(1.5, enableCloseBtn);
  });
}

// NEW: Design gallery menu listener
function designMenuListener() {
  // Add design menu button listener if exists
  const designMenu = document.getElementById('design-menu');
  if (designMenu) {
    designMenu.addEventListener('click', function (e) {
      e.preventDefault();
      cameraToDesigns();
    });
  }
}

function projectsMenuListener() {
  projects.forEach((project, i) => {
    const colIndex = i % 3 ===
