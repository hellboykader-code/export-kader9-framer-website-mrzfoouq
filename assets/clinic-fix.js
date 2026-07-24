/* Novéo — retire les avis/témoignages patients + liens secondaires, après hydratation Framer. */
(function(){
  var KILLNAME=/Review|Testimonial|Smile Journey|Care Journey|Smile Experience|4,920/i;
  var QUOTE=/[“"«][^]{60,}/;                 // longue citation
  var TESTI=/(transformed|makeover|life-changing|smile looks|caring, skilled|stress-free|made me feel|exceeded my expectations|insecure about my teeth|grateful for the gentle)/i;
  function topOfMain(el){
    var main=document.querySelector('main[data-framer-root]')||document.querySelector('main');
    if(!main) return el;
    var p=el;
    while(p && p.parentElement && p.parentElement!==main) p=p.parentElement;
    return (p && p.parentElement===main)?p:null;
  }
  function hide(el){ if(el){ el.style.display='none'; } }
  // « rolling text » (titres animés lettre par lettre) : clé = texte sans espaces -> FR
  var ROLL={
    "AboutUs":"À propos","Appointment":"Rendez-vous","Appointments":"Rendez-vous",
    "BackHome":"Retour à l'accueil","BookAnAppointment":"Prendre rendez-vous",
    "BookYourDentalAppointmentToday":"Prenez rendez-vous dès aujourd'hui",
    "Call(+1)3105552847":"Appeler le 04 78 92 14 60","Call0478921460":"Appeler le 04 78 92 14 60",
    "(+1)3105552847":"04 78 92 14 60","+13105552847":"04 78 92 14 60","(483)356-0058":"04 78 92 14 60",
    "CavityFillings":"Obturations des caries","ClearAligners":"Gouttières transparentes",
    "ConfirmAppointment":"Confirmer le rendez-vous","Contact":"Contact",
    "CrownRestoration":"Restauration par couronne","DentalBonding":"Collage dentaire",
    "DentalCheckups":"Bilans dentaires","DentalImplants":"Implants dentaires",
    "FindaDentists":"Trouver un dentiste","FindaDentist":"Trouver un dentiste",
    "GumTreatment":"Traitement des gencives","InvisalignTreatment":"Traitement Invisalign",
    "Locations":"Nos adresses","MeetOurDentists":"Rencontrez nos dentistes",
    "Orthodontics":"Orthodontie","OurDentists":"Nos dentistes",
    "PediatricDentistry":"Dentisterie pédiatrique","PorcelainVeneers":"Facettes en céramique",
    "PrivacyPolicy":"Politique de confidentialité","RequestAppointment":"Demander un rendez-vous",
    "RootCanalTherapy":"Traitement de racine","SedationDentistry":"Sédation consciente",
    "Services":"Soins","SmileMakeovers":"Esthétique du sourire","TeethCleaning":"Détartrage",
    "TeethWhitening":"Blanchiment dentaire","TermsConditions":"Conditions générales",
    "GeneralDentistry":"Dentisterie générale","CosmeticDentistry":"Dentisterie esthétique",
    "EmergencyDentalCare":"Soins dentaires d'urgence","DentalVeneers":"Facettes dentaires",
    "About":"À propos","AboutUs":"À propos","Home":"Accueil","Team":"Équipe","Search":"Rechercher",
    "DentalTeam":"Équipe dentaire","OurServices":"Nos soins","ContactUs":"Contact"
  };
  function fixRolling(){
    document.querySelectorAll('p,h1,h2,h3,h4').forEach(function(p){
      if(p.getAttribute('data-frfixed')==='1') return;
      var chars=[].filter.call(p.querySelectorAll('span'),function(s){return s.children.length===0 && (s.textContent||'').length===1;});
      if(chars.length<4) return;
      var txt=chars.map(function(s){return s.textContent;}).join('');
      var key=txt.replace(/\s+/g,'');
      while(key.length%2===0 && key.slice(0,key.length/2)===key.slice(key.length/2)) key=key.slice(0,key.length/2);
      var fr=ROLL[key];
      if(!fr) return;
      // préserver couleur + police de la lettre d'origine
      var cs=window.getComputedStyle(chars[0]);
      var sp=document.createElement('span');
      sp.textContent=fr;
      sp.style.color=cs.color; sp.style.fontFamily=cs.fontFamily; sp.style.fontSize=cs.fontSize;
      sp.style.fontWeight=cs.fontWeight; sp.style.letterSpacing=cs.letterSpacing; sp.style.whiteSpace='nowrap';
      p.innerHTML=''; p.appendChild(sp); p.setAttribute('data-frfixed','1');
    });
  }
  function apply(){
    // 1) sections/cartes de témoignage : nom = « Review/… », ou le nom EST la citation
    document.querySelectorAll('[data-framer-name]').forEach(function(el){
      var n=el.getAttribute('data-framer-name')||'';
      if(KILLNAME.test(n) || TESTI.test(n) || (/^[“"«]/.test(n) && n.length>50)){ hide(topOfMain(el)); hide(el); }
    });
    // 2b) « rolling text » : le nom (FR) est bon mais le texte lettre-par-lettre est resté EN -> forcer le FR
    var SKIP=/^(Desktop|Container|Card|Wrapper|Content|Slider|Home \/|Link →|Heading|Menu|Nav|Icon|Image|Frame|Group|Stack|Section)/;
    var ENW=/\b(Book|Appointment|Dental|Smile|Today|Your|Care|Meet|Trusted|Welcome|Read More|Learn More|View All|Get In Touch|Why Choose|About Us|Our Dentists|Our Team)\b/i;
    document.querySelectorAll('[data-framer-name][data-framer-component-type="RichTextContainer"]').forEach(function(el){
      var n=(el.getAttribute('data-framer-name')||'').trim();
      if(n.length<6 || n.indexOf(' ')<0 || SKIP.test(n)) return;
      var cur=(el.textContent||'');
      if(cur.replace(/\s+/g,'')!==n.replace(/\s+/g,'') && ENW.test(cur)){ el.textContent=n; }
    });
    fixRolling();
    // 3) liens Blog / Legal / Reviews (nav + footer)
    document.querySelectorAll('a[href]').forEach(function(a){
      var h=a.getAttribute('href')||'';
      if(/\/blog|\/legal\/|\/reviews/.test(h)){ (a.closest('li')||a).style.display='none'; a.style.display='none'; }
    });
    // 4) badge « Made in Framer »
    document.querySelectorAll('a[href*="framer.com"]').forEach(function(a){ a.style.display='none'; });
  }
  function boot(){ apply(); [200,500,1000,1800,3000,5000].forEach(function(t){setTimeout(apply,t);});
    var n=0,iv=setInterval(function(){apply(); if(++n>15)clearInterval(iv);},600);
    try{ new MutationObserver(apply).observe(document.body,{childList:true,subtree:true}); }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
