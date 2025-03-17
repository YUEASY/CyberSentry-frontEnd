<template>
    <div ref="modelContainer" class="model-container"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
  
  const modelContainer = ref(null);
  let scene, camera, renderer, model;
  
  const loadGLTFModel = (url, onLoad) => {
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      scene.add(gltf.scene);
      model = gltf.scene;
      if (onLoad) onLoad(model); // 调用回调，确保模型加载完成后再执行逻辑
    }, undefined, (error) => {
      console.error('An error happened', error);
    });
  };
  
  onMounted(() => {
    // 创建场景
    scene = new THREE.Scene();
  
    // 创建相机
    const aspect = modelContainer.value.clientWidth / modelContainer.value.clientHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(0, 0, 0); // 调整相机位置以确保模型在正视图中

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    modelContainer.value.appendChild(renderer.domElement);
  
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);
  
    // 加载 GLTF 模型
    loadGLTFModel('/cpu/03.gltf', (loadedModel) => {
        loadedModel.rotation.set(0, 0, 0); // 确保模型以正视图显示
        // 调整模型位置和缩放
        loadedModel.position.set(0, 0, 0);
        loadedModel.scale.set(0.01, 0.01, 0.01); // 缩小模型
    });
  
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
  
      if (model) {
        model.rotation.y += 0.01;
      }
  
      renderer.render(scene, camera);
    };
  
    animate();
  
    // 处理窗口大小调整
    window.addEventListener('resize', onWindowResize);
  
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  
    onBeforeUnmount(() => {
      window.removeEventListener('resize', onWindowResize);
    });
  });
  </script>
  
  <style scoped>
  .model-container {
    width: 400px;
    height: 400px;
    overflow: hidden;
  }
  </style>