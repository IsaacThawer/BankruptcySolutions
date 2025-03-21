const { initMobNab } = require('../admin/js/dashboard.js');
const { initPublicNav } = require('../public/js/menu-toggle.js');

// The mobile navs revolve around the active class therefore most of the testing involves the actice class
describe('mobile nav testing', () => { 
    let menuToggleAdmin, navBarAdmin, sidebarLinks, menuTogglePublic, navBarPublic

    beforeEach(() => {
        document.body.innerHTML = `
      <button id="menuToggleAdmin">Toggle Menu</button>
      <div class="sidebar">
      <a href="#" class="sidebar-link">Link 1</a>
      <a href="#" class="sidebar-link">Link 2</a>
      </div>

      <button id="menuToggle">Toggle Menu</button>
      <div id="navbar"></div>
    `

    globalThis.innerWidth = 768;
    globalThis.dispatchEvent(new Event('resize'))

    menuToggleAdmin = document.getElementById('menuToggleAdmin');
    navBarAdmin = document.querySelector('.sidebar');
    sidebarLinks = document.querySelectorAll('.sidebar a');
    menuTogglePublic = document.getElementById('menuToggle')
    navBarPublic = document.getElementById('navbar')
    })

    test('should toggle the active class on mobie admin nav when menutoggle is clicked', () => { 
        initMobNab()
    
        expect(navBarAdmin.classList.contains('active')).toBe(false)
    
        menuToggleAdmin.click()
    
        expect(navBarAdmin.classList.contains('active')).toBe(true)
    
        menuToggleAdmin.click()
    
        expect(navBarAdmin.classList.contains('active')).toBe(false)
    
     })


    test('Shoudl toggle the active classs on the mobile public nav when menuToggle is clicked', () => { 
      initPublicNav()

      expect(navBarPublic.classList.contains('active')).toBe(false);

      menuTogglePublic.click();

      expect(navBarPublic.classList.contains('active')).toBe(true);

      menuTogglePublic.click();

      expect(navBarPublic.classList.contains('active')).toBe(false);
     })

     test('should close the nav when a link is clicked', () => { 
      initMobNab();
  
      expect(sidebarLinks.length).toBeGreaterThan(0); 
  
      navBarAdmin.classList.add('active');
      expect(navBarAdmin.classList.contains('active')).toBe(true);
      sidebarLinks[0].click();
  
      expect(navBarAdmin.classList.contains('active')).toBe(false);
  });
 })

