/**
 * LUXE HAIR STUDIO - App Logic
 * Handles hero rotation, mega menu, search, dock theme toggle, and chatbot
 */

(function() {
  'use strict';

  const config = window.__LUXE_CONFIG__ || {};

  // === HERO ROTATOR ===
  function initHeroRotator() {
    const stages = document.querySelectorAll('.hero-stage');
    const heroConfig = config.hero || {};
    const rotationSpeed = heroConfig.rotationSpeed || 6000;
    const fadeDuration = heroConfig.fadeDuration || 1200;
    
    if (stages.length === 0) return;

    let currentIndex = 0;
    
    function rotateStage() {
      stages.forEach((stage, index) => {
        stage.classList.remove('active');
        if (index === currentIndex) {
          stage.classList.add('active');
        }
      });
      
      currentIndex = (currentIndex + 1) % stages.length;
      setTimeout(rotateStage, rotationSpeed);
    }
    
    // Start rotation after initial delay
    setTimeout(rotateStage, rotationSpeed);
  }

  // === MEGA MENU ===
  function initMegaMenu() {
    const navItems = document.querySelectorAll('.nav-item.has-mega-menu');
    
    navItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const menu = item.querySelector('.nav-mega-menu');
        if (menu) {
          menu.style.opacity = '1';
          menu.style.visibility = 'visible';
          menu.style.transform = 'translateY(0)';
        }
      });
      
      item.addEventListener('mouseleave', () => {
        const menu = item.querySelector('.nav-mega-menu');
        if (menu) {
          menu.style.opacity = '0';
          menu.style.visibility = 'hidden';
          menu.style.transform = 'translateY(10px)';
        }
      });
    });
  }

  // === SEARCH OVERLAY ===
  function initSearch() {
    const searchBtn = document.querySelector('.search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.querySelector('.search-input');
    
    if (!searchBtn || !searchOverlay) return;

    function openSearch() {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput && searchInput.focus(), 400);
    }
    
    function closeSearch() {
      searchOverlay.classList.remove('active');
      if (searchInput) searchInput.value = '';
    }
    
    searchBtn.addEventListener('click', openSearch);
    
    if (searchClose) {
      searchClose.addEventListener('click', closeSearch);
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        closeSearch();
      }
    });
    
    // Close on outside click
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        closeSearch();
      }
    });
  }

  // === DOCK THEME TOGGLE ===
  function initDockThemeToggle() {
    const toggle = document.querySelector('.dock-theme-toggle');
    if (!toggle) return;
    
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      localStorage.setItem('luxe-theme', isDark ? 'dark' : 'light');
    });
    
    // Restore saved theme
    const savedTheme = localStorage.getItem('luxe-theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }

  // === CHATBOT ===
  function initChatbot() {
    const chatbotConfig = config.chatbot || {};
    if (!chatbotConfig.enabled) return;

    const toggleBtn = document.querySelector('.chatbot-toggle');
    const chatbotWindow = document.querySelector('.chatbot-window');
    const closeBtn = document.querySelector('.chatbot-close');
    const sendBtn = document.querySelector('.chatbot-send');
    const input = document.querySelector('.chatbot-input');
    const messagesContainer = document.querySelector('.chatbot-messages');
    
    if (!toggleBtn || !chatbotWindow) return;

    const knowledge = chatbotConfig.knowledge || [];
    const botName = chatbotConfig.name || 'Vivienne';

    function toggleChatbot() {
      const isVisible = chatbotWindow.style.display !== 'none';
      chatbotWindow.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && input) setTimeout(() => input.focus(), 300);
    }

    function addMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
      msgDiv.textContent = text;
      msgDiv.style.marginBottom = '12px';
      msgDiv.style.padding = '12px 16px';
      msgDiv.style.borderRadius = '8px';
      msgDiv.style.maxWidth = '85%';
      msgDiv.style.background = isUser ? '#D4A5A5' : '#F5F5F5';
      msgDiv.style.color = isUser ? '#fff' : '#2C2C2C';
      msgDiv.style.alignSelf = isUser ? 'flex-end' : 'flex-start';
      
      if (messagesContainer) {
        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    function getResponse(userMessage) {
      const lowerMsg = userMessage.toLowerCase();
      
      for (const item of knowledge) {
        const keywords = item.keywords || [];
        if (keywords.some(kw => lowerMsg.includes(kw))) {
          return item.response;
        }
      }
      
      return "Thank you for your message. For immediate assistance, please use the 'Book Now' button or call us at " + (config.salon?.phone || '+44 20 7946 0958') + ".";
    }

    function sendMessage() {
      const text = input?.value.trim();
      if (!text) return;
      
      addMessage(text, true);
      input.value = '';
      
      // Simulate bot response delay
      setTimeout(() => {
        const response = getResponse(text);
        addMessage(response, false);
      }, 600);
    }

    toggleBtn.addEventListener('click', toggleChatbot);
    
    if (closeBtn) {
      closeBtn.addEventListener('click', toggleChatbot);
    }
    
    if (sendBtn) {
      sendBtn.addEventListener('click', sendMessage);
    }
    
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }

    // Initial greeting
    setTimeout(() => {
      addMessage("Hello! I'm " + botName + ", your virtual beauty assistant. How may I help you today?");
    }, 1000);
  }

  // === INITIALIZE ALL ===
  document.addEventListener('DOMContentLoaded', () => {
    initHeroRotator();
    initMegaMenu();
    initSearch();
    initDockThemeToggle();
    initChatbot();
  });

})();
