<template>
  <div class="index-page">
    <header id="header" class="header d-flex align-items-center fixed-top">
      <div
        class="container-fluid container-xl position-relative d-flex align-items-center justify-content-between"
      >
        <div class="logo d-flex align-items-center">
          <!-- Uncomment the line below if you also wish to use an image logo -->
          <!-- <img src="assets/img/logo.png" alt=""> -->
          <h1 class="sitename">CyberSentry</h1>
        </div>
        <nav id="navmenu" class="navmenu">
          <i class="mobile-nav-toggle d-xl-none bi bi-list"></i>
        </nav>
        <h1 class="sitename login" @click="showPopup = true">登录</h1>

        <!-- Overlay for modal background -->
        <div v-if="showPopup" class="overlay" @click="closePopup"></div>
        
        <!-- Enhanced Login Popup -->
        <div v-if="showPopup" class="login-popup" @keyup.enter="login">
          <div class="popup-header">
            <div class="popup-logo">
              <i class="bi bi-shield-lock"></i>
            </div>
            <h2 class="popup-title">用户登录</h2>
            <p class="popup-subtitle">安全监控系统</p>
            <button class="close-button" @click="closePopup">
              <i class="bi bi-x"></i>
            </button>
          </div>
          
          <div class="popup-body">
            <!-- Email input -->
            <div class="form-row">
              <div class="form-label">邮箱地址</div>
              <div class="form-input">
                <a-input 
                  v-model="email" 
                  placeholder="请输入您的邮箱" 
                  allow-clear
                  class="styled-input"
                />
              </div>
            </div>
            
            <!-- Verification code -->
            <div class="form-row">
              <div class="form-label">验证码</div>
              <div class="form-input">
                <div class="verification-container">
                  <a-verification-code 
                    v-model="value" 
                    :length="4" 
                    class="verification-input"
                  />
                  <button 
                    class="verification-button" 
                    :class="{ 'disabled': verStatus }"
                    @click="vercode"
                    :disabled="verStatus"
                  >
                    {{ verStatus ? `${countdown}秒后重试` : '获取验证码' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="popup-footer">
            <button 
              class="login-button" 
              @click="login" 
              tabindex="0"
            >
              <i class="bi bi-box-arrow-in-right"></i>
              登录系统
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="main">
      <!--  Section -->
      <div id="hero" class="hero section dark-background">
        <div id="hero-carousel" class="carousel carousel-fade" data-bs-ride="carousel" data-bs-interval="5000">
          <div class="container position-relative">
            <div class="carousel-item active">
              <div class="carousel-container">
                <h2>CyberSentry —— 数字世界的哨兵守卫</h2>
                <p>
                  7×24小时无死角系统监控，毫秒级响应入侵行为。<br />从代码层到流量层，我们构建多维防御矩阵，让漏洞无所遁形，让数据坚不可摧。
                </p>
              </div>
            </div>
            <ol class="carousel-indicators"></ol>
          </div>
        </div>
      </div>

      <!-- Featured Services Section -->
      <div id="featured-services" class="featured-services section">
        <div class="container">
          <div class="row gy-4">
            <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div class="service-item item-cyan position-relative">
                <div class="icon">
                  <i class="bi bi-activity"></i>
                </div>
                <div class="stretched-link">
                  <h3>实时监控</h3>
                </div>
                <p>
                  在系统威胁日益增加的时代，CyberSentry 通过实时监控技术，确保您的系统始终处于安全状态，提前识别并防御潜在风险。
                </p>
              </div>
            </div>
            <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="200">
              <div class="service-item item-orange position-relative">
                <div class="icon">
                  <i class="bi bi-broadcast"></i>
                </div>
                <div  class="stretched-link">
                  <h3>危险警报</h3>
                </div>
                <p>
                  在安全事件发生前，及时发现风险是关键。CyberSentry 依靠先进的危险警报系统，确保任何异常活动都不会被忽视，让您的系统始终处于受控状态。
                </p>
              </div>
            </div>
            <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="300">
              <div class="service-item item-teal position-relative">
                <div class="icon">
                  <i class="bi bi-easel"></i>
                </div>
                <div  class="stretched-link">
                  <h3>AI分析</h3>
                </div>
                <p>
                  传统的安全监控依赖规则匹配，容易错漏威胁，而 CyberSentry 采用AI智能分析技术，能够精准分析识别未知威胁并提供深度安全洞察。
                </p>
              </div>
            </div>
            <div class="col-lg-3 col-md-6" data-aos="fade-up" data-aos-delay="400">
              <div class="service-item item-red position-relative">
                <div class="icon">
                  <i class="bi bi-bounding-box-circles"></i>
                </div>
                <div class="stretched-link">
                  <h3>更多操作</h3>
                </div>
                <p>
                  除了实时监控、危险警报和AI智能分析，CyberSentry 还提供一系列高级安全操作，确保您的数据、软件和系统处于最优保护状态，免受入侵和篡改。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div id="about" class="about section light-background">
        <div class="container">
          <div class="row gy-4">
            <div class="col-lg-6 position-relative align-self-start" data-aos="fade-up" data-aos-delay="100">
              <img src="../assets/img/hero-bg.jpg" class="img-fluid" alt="" />
            </div>
            <div class="col-lg-6 content" data-aos="fade-up" data-aos-delay="200">
              <h3>CyberSentry：智能监控与安全防护</h3>
              <p class="fst-italic">
                CyberSentry 是一款高效精准的系统监控与软件防护解决方案，可实时检测网络威胁，防止未知漏洞带来的安全风险。
              </p>
              <ul>
                <li><i class="bi bi-check2-all"></i> <span>AI智能分析</span></li>
                <li><i class="bi bi-check2-all"></i> <span>24/7 无死角系统监控</span></li>
                <li><i class="bi bi-check2-all"></i> <span>智能警报与自动响应</span></li>
                <li><i class="bi bi-check2-all"></i> <span>文件加密、软件防篡改与系统完整性保护</span></li>
                <li><i class="bi bi-check2-all"></i> <span>数据安全保护</span></li>
              </ul>
              <p>
                在当今系统威胁日益复杂的时代，CyberSentry 提供一体化的系统监控与软件防护解决方案，依托AI智能分析、实时警报和自动防御技术，确保您的数据、应用和系统始终安全无忧。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer id="footer" class="footer dark-background">
      <div class="footer-newsletter">
        <div class="container"></div>
      </div>

      <div class="container footer-top">
        <div class="row gy-4">
          <div class="col-lg-4 col-md-6 footer-about">
            <div to="/" class="d-flex align-items-center">
              <span class="sitename">CyberSentry</span>
            </div>
            <div class="footer-contact pt-3">
              <p><strong>Email:</strong> <span>3298911538@qq.com</span></p>
            </div>
          </div>
        </div>
      </div>

      <div class="container copyright text-center mt-4">
        <!-- <p>© <span>Copyright</span> <strong class="px-1 sitename">CyberSentry</strong> <span>All Rights Reserved</span></p> -->
      </div>
    </footer>

    <!-- Scroll Top -->
    <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center">
      <i class="bi bi-arrow-up-short"></i>
    </a>

    <!-- Preloader -->
    <div id="preloader"></div>
  </div>
</template>


<script setup>
import { useUserStore } from '@/stores/user';
import { onMounted, ref } from 'vue';

const value = ref('');
const email = ref('')
const verStatus = ref(false)
const countdown = ref(60);

const startCountdown = () => {
  const timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(timer);
      verStatus.value = false;
    }
  }, 1000);
};

const vercode = () => {
  
  const res = user.vercode(email.value);
  if (check() && res !== 'error') {
    verStatus.value = true;
    countdown.value = 60; // Reset countdown
    startCountdown(); // Start the countdown
  }
};

const user = useUserStore()

const showPopup = ref(false)

const closePopup = () => {
  showPopup.value = false
}

const check = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    alert('请输入有效的邮箱地址: ', email.value);
    return false;
  }
  return true;
};

const login = () => {
  if (check()) {
    
    const res = user.login(email.value, value.value)
    if (res === 'error') { 
      alert("登录失败，邮箱或验证码错误")
    }
  }
}

const initPreloader = () => {
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }
};

onMounted(() => {
  initPreloader();
});

</script>

<style scoped>
/* Existing styles */
.login {
  cursor: pointer;
  padding: 10px;
  border-radius: 10%;
}

.login:hover {
  background-color: rgba(148, 147, 147, 0.3);
}

.login:active {
  background-color: rgba(162, 162, 162, 0.58);
}

/* Overlay for modal background */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  z-index: 999;
}

/* Enhanced Login Popup Styles */
.login-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.popup-header {
  position: relative;
  padding: 30px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #0c8599, #0a6c7e);
  color: white;
}

.popup-logo {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-logo i {
  font-size: 28px;
}

.popup-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.popup-subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  opacity: 0.8;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.popup-body {
  padding: 30px;
}

/* New form row layout for vertical alignment */
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-label {
  width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: right;
  margin-right: 15px;
}

.form-input {
  flex: 1;
}

.styled-input {
  width: 100%;
  height: 46px;
  border-radius: 8px;
  border: 1px solid #ddd;
  transition: all 0.3s;
}

.styled-input:hover, .styled-input:focus {
  border-color: #0c8599;
  box-shadow: 0 0 0 3px rgba(12, 133, 153, 0.1);
}

.verification-container {
  display: flex;
  gap: 10px;
}

.verification-input {
  flex: 1;
}

.verification-button {
  min-width: 110px;
  height: 46px;
  background: #0c8599;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.verification-button:hover {
  background: #0a6c7e;
}

.verification-button.disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.popup-footer {
  padding: 0 30px 30px;
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #0c8599, #0a6c7e);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.login-button:hover {
  background: linear-gradient(135deg, #0a6c7e, #085666);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(10, 108, 126, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.login-button i {
  font-size: 18px;
}

/* Override Arco Design styles */
:deep(.arco-input-wrapper) {
  background-color: transparent;
}

:deep(.arco-input) {
  height: 46px;
  font-size: 15px;
}

:deep(.arco-verification-code) {
  height: 46px;
}

:deep(.arco-verification-code-item) {
  border-radius: 8px;
  border-color: #ddd;
  font-size: 18px;
}

:deep(.arco-verification-code-item:focus) {
  border-color: #0c8599;
  box-shadow: 0 0 0 3px rgba(12, 133, 153, 0.1);
}

/* Fonts */
@import  'https://fonts.googleapis.com';
@import  'https://fonts.gstatic.com';
@import  'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';

@import  '../assets/vendor/bootstrap/css/bootstrap.min.css';
@import  '../assets/vendor/bootstrap-icons/bootstrap-icons.css';

@import '../assets/css/main.css';
</style>