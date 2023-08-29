function showTab(tabId) {
   
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach((tabContent) => {
      tabContent.classList.remove('active');
    });
  
    
    const selectedTab = document.getElementById(tabId);
    selectedTab.classList.add('active');
  }