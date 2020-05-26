import Romania from "./img/Romania.jpg";
import Jewel from "./img/jewel.jpg";
import Norway from "./img/norway.jpg";
import Vernazza from "./img/vernazza.jpg";
import displacement from "./img/14.jpg";

import { TweenMax, Expo } from "gsap/all";
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  TextureLoader,
  ShaderMaterial,
  PlaneBufferGeometry,
  Mesh,
  RepeatWrapping,
  LinearFilter,
} from "three";

var myAnimation;
var myAnimation2;
var myAnimation3;
var myAnimation4;

let background = document.querySelector("#background");
let section = document.querySelector("#section");
let indices = document.querySelectorAll(".index");

let bgImgs = [Jewel, Romania, Norway, Vernazza];

let currentIndex = 0;

var hoverEffect = function (opts) {
  var vertex = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `;

  var fragment = `
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform sampler2D texture2;
        uniform sampler2D disp;
        // uniform float time;
        // uniform float _rot;
        uniform float dispFactor;
        uniform float effectFactor;
        // vec2 rotate(vec2 v, float a) {
        //  float s = sin(a);
        //  float c = cos(a);
        //  mat2 m = mat2(c, -s, s, c);
        //  return m * v;
        // }
        void main() {
            vec2 uv = vUv;
            // uv -= 0.5;
            // vec2 rotUV = rotate(uv, _rot);
            // uv += 0.5;
            vec4 disp = texture2D(disp, uv);
            vec2 distortedPosition = vec2(uv.x + dispFactor * (disp.r*effectFactor), uv.y);
            vec2 distortedPosition2 = vec2(uv.x - (1.0 - dispFactor) * (disp.r*effectFactor), uv.y);
            vec4 _texture = texture2D(texture, distortedPosition);
            vec4 _texture2 = texture2D(texture2, distortedPosition2);
            vec4 finalTexture = mix(_texture, _texture2, dispFactor);
            gl_FragColor = finalTexture;
            // gl_FragColor = disp;
        }
    `;

  var parent = opts.parent || console.warn("no parent");
  var dispImage =
    opts.displacementImage || console.warn("displacement image missing");
  var image1 = opts.image1 || console.warn("first image missing");
  var image2 = opts.image2 || console.warn("second image missing");
  var intensity = opts.intensity || 1;
  var speedIn = opts.speedIn || 1.6;
  var speedOut = opts.speedOut || 2.5;
  var easing = opts.easing || Expo.easeOut;

  var scene = new Scene();
  var camera = new OrthographicCamera(
    parent.offsetWidth / -2,
    parent.offsetWidth / 2,
    parent.offsetHeight / 2,
    parent.offsetHeight / -2,
    1,
    1000
  );

  camera.position.z = 1;

  var renderer = new WebGLRenderer({
    antialias: false,
    // alpha: true
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0xffffff, 0.0);
  renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  parent.appendChild(renderer.domElement);

  // var addToGPU = function(t) {
  //     renderer.setTexture2D(t, 0);
  // };

  var loader = new TextureLoader();
  loader.crossOrigin = "";
  var texture1 = loader.load(image1);
  var texture2 = loader.load(image2);

  var disp = loader.load(dispImage);
  disp.wrapS = disp.wrapT = RepeatWrapping;

  texture1.magFilter = texture2.magFilter = LinearFilter;
  texture1.minFilter = texture2.minFilter = LinearFilter;

  texture1.anisotropy = renderer.getMaxAnisotropy();
  texture2.anisotropy = renderer.getMaxAnisotropy();

  var mat = new ShaderMaterial({
    uniforms: {
      effectFactor: { type: "f", value: intensity },
      dispFactor: { type: "f", value: 0.0 },
      texture: { type: "t", value: texture1 },
      texture2: { type: "t", value: texture2 },
      disp: { type: "t", value: disp },
    },

    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    opacity: 1.0,
  });

  var geometry = new PlaneBufferGeometry(
    parent.offsetWidth,
    parent.offsetHeight,
    1
  );
  var object = new Mesh(geometry, mat);
  scene.add(object);

  window.addEventListener("resize", function (e) {
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
  });

  this.next = function () {
    TweenMax.to(mat.uniforms.dispFactor, speedIn, {
      value: 1.1,
      ease: easing,
    });
  };

  this.previous = function () {
    TweenMax.to(mat.uniforms.dispFactor, speedOut, {
      value: 0,
      ease: easing,
    });
  };

  var animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  this.remove = function () {
    cancelAnimationFrame(animate);
    scene.remove(object);
    renderer.dispose();
    scene.dispose();
    parent.removeChild(renderer.domElement);
  };
};

indices.forEach((index) => index.classList.remove("activeSlider"));
indices[currentIndex].classList.add("activeSlider");

myAnimation = new hoverEffect({
  parent: background,
  intensity: 0.3,
  imagesRatio: 1080 / 1920,
  image1: bgImgs[0],
  image2: bgImgs[1],
  displacementImage: displacement,
});

myAnimation2 = new hoverEffect({
  parent: background,
  intensity: 0.3,
  imagesRatio: 1080 / 1920,
  image1: bgImgs[1],
  image2: bgImgs[2],
  displacementImage: displacement,
});

myAnimation3 = new hoverEffect({
  parent: background,
  intensity: 0.3,
  imagesRatio: 1080 / 1920,
  image1: bgImgs[2],
  image2: bgImgs[3],
  displacementImage: displacement,
});

myAnimation4 = new hoverEffect({
  parent: background,
  intensity: 0.3,
  imagesRatio: 1080 / 1920,
  image1: bgImgs[3],
  image2: bgImgs[0],
  displacementImage: displacement,
});

let distortAnimations = [myAnimation, myAnimation2, myAnimation3, myAnimation4];

function startNextDistortAnimation() {
  let prevIndex = currentIndex;
  currentIndex = (currentIndex + 1) % 4;
  indices.forEach((index) => index.classList.remove("activeSlider"));
  indices[currentIndex].classList.add("activeSlider");
  distortAnimations[prevIndex].next();
  setTimeout(() => {
    let canvas = background.querySelectorAll("canvas");
    background.appendChild(canvas[0]);
    distortAnimations[prevIndex].previous();
  }, 500);
}
/*
    function startPrevDistortAnimation() {
      currentIndex = currentIndex - 1 < 0 ? 3 : currentIndex - 1;
      indices.forEach((index) => index.classList.remove("activeSlider"));
      indices[currentIndex].classList.add("activeSlider");
      distortAnimations[currentIndex].next();
      setTimeout(() => {
        let canvas = background.querySelectorAll("canvas");
        background.insertBefore(
          canvas[canvas.length - 1],
          background.firstChild
        );
        distortAnimations[currentIndex].previous();
      }, 500);
    } */
let isAnimating = false;
section.addEventListener("click", function () {
  if (isAnimating) {
    return;
  }
  isAnimating = true;
  startNextDistortAnimation();
  setTimeout(function () {
    isAnimating = false;
  }, 900);
});
