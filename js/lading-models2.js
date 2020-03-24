// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let controls;
let renderer;
let scene;

//three.js動畫系統負責將動畫附加到模型
const mixers = [];
//時間 幀速
const clock = new THREE.Clock();

function init() {

  container = document.querySelector( '#scene-container' );

  //創造場景
  scene = new THREE.Scene();

  //背景顏色
  const loaderBg = new THREE.TextureLoader();
  const bgTexture = loaderBg.load('../textures/Rainforest.jpg');
  scene.background = bgTexture;
  // scene.background = new THREE.Color( 0x222222 );

  //精簡後的函數
  createCamera();
  createControls();
  createLights();
  loadModels();
  createRenderer();

  renderer.setAnimationLoop( () => {

    update();
    render();

  } );

}

//相機
function createCamera() {

  camera = new THREE.PerspectiveCamera( 30, container.clientWidth / container.clientHeight, 0.1, 100 );
  camera.position.set( -1.5, 1.5, 6.5 );

}

//控制器
function createControls() {

  controls = new THREE.OrbitControls( camera, container );

}

//燈光
function createLights() {

  //半球光源
  const ambientLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 5 );

  //主光源
  const mainLight = new THREE.DirectionalLight( 0xffffff, 5 );
  mainLight.position.set( 10, 10, 10 );

  scene.add( ambientLight, mainLight );

}

//模型
function loadModels() {

  const loader = new THREE.GLTFLoader();

  // 重複使用的函數來設定模型
  // 可分將多個模型別放在場景中
  const onLoad = ( gltf, position ) => {

    const model = gltf.scene.children[ 0 ];
    model.position.copy( position );

    //模型動畫分割
    const animation = gltf.animations[ 0 ];
    
    //為每個模型創建動畫混合器
    const mixer = new THREE.AnimationMixer( model );
    mixers.push( mixer );

    //可控制影片播放 停止 暫停
    const action = mixer.clipAction( animation );
    action.play();

    scene.add( model );

  };

  // 模型載入進度通知
  const onProgress = (xhr) => {
    if (xhr.lengthComputable) {

      var percentComplete = xhr.loaded / xhr.total * 100;
      console.log('model ' + Math.round(percentComplete, 2) + '% downloaded');

    }
  };

  // 模型載入錯誤訊息
  const onError = ( errorMessage ) => { console.log( errorMessage ); };

  //Vector3 模型位置x, y, z

  const parrotPosition = new THREE.Vector3( 0, 0, 0 );
  loader.load( 'models/Parrot.glb', gltf => onLoad( gltf, parrotPosition ), onProgress, onError );

  // const flamingoPosition = new THREE.Vector3( 7.5, 0, -10 );
  // loader.load( 'models/Flamingo.glb', gltf => onLoad( gltf, flamingoPosition ), onProgress, onError );

  // const storkPosition = new THREE.Vector3( 0, -2.5, -10 );
  // loader.load( 'models/Stork.glb', gltf => onLoad( gltf, storkPosition ), onProgress, onError );


}

//渲染器
function createRenderer() {

  // create a WebGLRenderer and set its width and height
  renderer = new THREE.WebGLRenderer( { 
    antialias: true,
    alpha: true,
   } );
  renderer.setSize( container.clientWidth, container.clientHeight );

  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  container.appendChild( renderer.domElement );

}

function update() {

  //動畫更新
  const delta = clock.getDelta();

  for ( const mixer of mixers ) {

    mixer.update( delta );

  }

}

function render() {

  renderer.render( scene, camera );

}

//響應式
function onWindowResize() {
  // console.log( '你調整瀏覽器大小' );

  camera.aspect = container.clientWidth / container.clientHeight;

  // update the camera's frustum
  camera.updateProjectionMatrix();

  renderer.setSize( container.clientWidth, container.clientHeight );

}

window.addEventListener( 'resize', onWindowResize );

init();