import * as THREE from 'https://unpkg.com/three@0.108.0/build/three.module.js';
import {OrbitControls} from 'https://unpkg.com/three@0.108.0/examples/jsm/controls/OrbitControls.js';
import * as dat from 'https://unpkg.com/three@0.108.0/examples/jsm/libs/dat.gui.module.js';

const earthRadius = 6371;

// We want z axis to point up.
THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);

const view1 = document.querySelector('#view1');
const view2 = document.querySelector('#view2');
view1.style.left= '0px';
view1.style.top = '0px';
view2.style.right= '0px';
view2.style.top = '0px';

const renderer1 = new THREE.WebGLRenderer( { antialias: true } );
renderer1.setPixelRatio( window.devicePixelRatio );
renderer1.setSize( window.innerWidth / 2, window.innerHeight );
view1.appendChild( renderer1.domElement );

const renderer2 = new THREE.WebGLRenderer( { antialias: true } );
renderer2.setPixelRatio( window.devicePixelRatio );
renderer2.setSize( window.innerWidth / 2, window.innerHeight );
view2.appendChild( renderer2.domElement );

let aspect = window.innerWidth / window.innerHeight;
let camera1 = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 1e9);
let camera2 = new THREE.PerspectiveCamera(50, 0.5 * aspect, 1, 1e9);
camera2.position.z = 50000;

const controls1 = new OrbitControls(camera1, renderer1.domElement);
const controls2 = new OrbitControls(camera2, renderer2.domElement);
controls1.enablePan = false;
controls2.enablePan = false;

// Create scene.

let scene = new THREE.Scene();
let cameraHelper = new THREE.CameraHelper(camera1);
scene.add(cameraHelper);

let gridHelper = new THREE.GridHelper(20000, 20);
scene.add(gridHelper);
let gridHelperX = new THREE.GridHelper(20000, 20);
scene.add(gridHelperX);
let gridHelperY = new THREE.GridHelper(20000, 20);
scene.add(gridHelperY);
gridHelperX.rotation.x = Math.PI/2;
gridHelperY.rotation.z = Math.PI/2;

let axisHelper = new THREE.AxisHelper(10000);
scene.add(axisHelper);

let sphereGeometry = new THREE.SphereGeometry(earthRadius, 64, 64);

let sphereMaterial = new THREE.MeshBasicMaterial();

sphereMaterial.map = THREE.ImageUtils.loadTexture('8081_earthmap10k.jpg');
let earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

earthMesh.rotation.x = Math.PI/2;
scene.add(earthMesh);
const light = new THREE.AmbientLight(0xFFFFFF);
scene.add(light);

function onWindowResize()
{
    let aspect = 0.5 * window.innerWidth / window.innerHeight;
    camera1.aspect = aspect;
    camera1.updateProjectionMatrix(); 
    camera2.aspect = aspect;
    camera2.updateProjectionMatrix(); 

    renderer1.setSize( window.innerWidth / 2, window.innerHeight );
    renderer2.setSize( window.innerWidth / 2, window.innerHeight );
}

window.addEventListener('resize', onWindowResize, false);

let guiControls = new function()
{
    //this.preset = "Start";
    this.distance = 20000;
    this.latitude = 0;
    this.longitude = 0;
    this.grid = true;
    this.axes = true;
    this.globe = true;
    this.lockFov = true;
    this.fov = 30.0;
    this.posX = 10000.0;
    this.posY = 0.0;
    this.posZ = 0.0;
    this.targetX = 0;
    this.targetY = 0;
    this.targetZ = 0;
    this.panning = false;
    this.camUpDecl = 90;
    this.camUpAngle = 0;
}

let gui = new dat.GUI();
//gui.add(guiControls, 'preset', ['Start', 'DSCOVR_Moon', '1972_Blue_Marble']);

let posFolder = gui.addFolder('Position');
let distControl = posFolder.add(guiControls, 'distance', earthRadius+100, 2e6);
let latControl = posFolder.add(guiControls, 'latitude', -90, 90, 0.1);
let lonControl = posFolder.add(guiControls, 'longitude', -180, 180, 0.1);

let visFolder = gui.addFolder('Visibility');
visFolder.add(guiControls, 'grid')
          .onChange(function() {
              gridHelper.visible = gridHelperX.visible = gridHelperY.visible = guiControls.grid;
          });
visFolder.add(guiControls, 'axes')
          .onChange(function() {
             axisHelper.visible = guiControls.axes;
          });
visFolder.add(guiControls, 'globe')
          .onChange(function() {
             earthMesh.visible = guiControls.globe;
          });

let cameraFolder = gui.addFolder('Camera');
let lockFovControl = cameraFolder.add(guiControls, 'lockFov');
let fovControl = cameraFolder.add(guiControls, 'fov', 0.1, 180, 0.1);
cameraFolder.add(guiControls, 'panning')
          .onChange(function() {
             controls1.enablePan = guiControls.panning;
          });
let targetX = cameraFolder.add(guiControls, 'targetX', -earthRadius * 1.1, earthRadius * 1.1, 1);
let targetY = cameraFolder.add(guiControls, 'targetY', -earthRadius * 1.1, earthRadius * 1.1, 1);
let targetZ = cameraFolder.add(guiControls, 'targetZ', -earthRadius * 1.1, earthRadius * 1.1, 1);
let camUpAngle = cameraFolder.add(guiControls, 'camUpAngle', -90, 90, 1);
let camUpDecl = cameraFolder.add(guiControls, 'camUpDecl', -180, 180, 1);

let cameraActions = { 
    center : function() 
    {
        targetX.setValue(0);
        targetY.setValue(0);
        targetZ.setValue(0);
    }            
};
cameraFolder.add(cameraActions, 'center');

let presetFolder = gui.addFolder('Presets');
let presets = { 
    blueMarble72 : function() 
    {
        distControl.setValue(35000);
        latControl.setValue(-28);
        lonControl.setValue(39);
        targetX.setValue(0);
        targetY.setValue(0);
        targetZ.setValue(0);
        lockFovControl.setValue(true);
        camUpAngle.setValue(0);
        camUpDecl.setValue(93);
    },
    himawari8 : function() 
    {
        distControl.setValue(42164);
        latControl.setValue(0);
        lonControl.setValue(141);
        targetX.setValue(0);
        targetY.setValue(0);
        targetZ.setValue(0);
        camUpAngle.setValue(0);
        camUpDecl.setValue(90);
        lockFovControl.setValue(true);
    },
    issScandinavia : function()
    {
        distControl.setValue(6765);
        latControl.setValue(51.8);
        lonControl.setValue(9.7);
        targetX.setValue(3290);
        targetY.setValue(800);
        targetZ.setValue(5440);
        camUpAngle.setValue(10);
        camUpDecl.setValue(40);
        lockFovControl.setValue(false);
        fovControl.setValue(53.2-1.2);
    }
};
presetFolder.add(presets, 'blueMarble72');
presetFolder.add(presets, 'himawari8');
presetFolder.add(presets, 'issScandinavia');


function deg2rad(deg)
{
    return 2 * Math.PI * deg / 360.0;
}

function updateCamera()
{
    let r = guiControls.distance;
    let lat = deg2rad(guiControls.latitude);
    let lon = deg2rad(guiControls.longitude);

    camera1.position.x = r * Math.cos(lon) * Math.cos(lat);
    camera1.position.y = r * Math.sin(lon) * Math.cos(lat);
    camera1.position.z = r * Math.sin(lat);
}

distControl.onChange(updateCamera);
latControl.onChange(updateCamera);
lonControl.onChange(updateCamera);

function updateCoordinates()
{
    let p = camera1.position;
    let d = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);

    guiControls.latitude = 360.0 * Math.asin(p.z / d) / (2 * Math.PI);
    guiControls.longitude = 360.0 *  Math.atan2(p.y, p.x) / (2 * Math.PI);
    guiControls.distance = d;

    distControl.setValue(guiControls.distance);
    latControl.setValue(guiControls.latitude);
    lonControl.setValue(guiControls.longitude);

    guiControls.targetX = controls1.target.x;
    guiControls.targetY = controls1.target.y;
    guiControls.targetZ = controls1.target.z;

    targetX.setValue(guiControls.targetX);
    targetY.setValue(guiControls.targetY);
    targetZ.setValue(guiControls.targetZ);
}

controls1.addEventListener('change', updateCoordinates);

let body = document.getElementsByTagName('body')[0];
body.onresize = function()
{
    console.log("resize");
    renderer1.setSize( window.innerWidth / 2 - 1, window.innerHeight );
    renderer2.setSize( window.innerWidth / 2 - 1, window.innerHeight );
}

function render()
{
    // If Earth size on screen is locked, compute field of view.
    let p = camera1.position;
    let d = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);

    if (guiControls.lockFov)
    {
        guiControls.fov = (360.0 / (Math.PI)) * Math.acos(Math.sqrt(d*d - earthRadius*earthRadius)/d);
    }
    camera1.fov = guiControls.fov;
    controls1.target.x = guiControls.targetX;
    controls1.target.y = guiControls.targetY;
    controls1.target.z = guiControls.targetZ;
    let camUpDecl = deg2rad(guiControls.camUpDecl);
    let camUpAngle = deg2rad(guiControls.camUpAngle);
    camera1.up.x = Math.cos(camUpAngle) * Math.cos(camUpDecl);
    camera1.up.y = Math.sin(camUpAngle) * Math.cos(camUpDecl);
    camera1.up.z = Math.sin(camUpDecl);
    fovControl.setValue(guiControls.fov);

    camera1.updateProjectionMatrix();

    controls1.update();
    controls2.update();

    cameraHelper.visible = false;
    renderer1.render(scene, camera1);
    cameraHelper.visible = true;
    cameraHelper.update();
    renderer2.render(scene, camera2);
    requestAnimationFrame(render);
}

render();
presets.himawari8();
