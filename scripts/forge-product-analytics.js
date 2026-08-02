(function(){
  // Product events are intentionally small and anonymous. They help us
  // understand session shape without storing question text or answer content.
  window.forgeTrack = function(name, details){
    var event = {name:name, at:new Date().toISOString(), details:details||{}};
    try {
      var key='forge-product-events', events=JSON.parse(localStorage.getItem(key)||'[]');
      events.push(event); if(events.length>100) events=events.slice(-100);
      localStorage.setItem(key,JSON.stringify(events));
    } catch(e) {}
    if(typeof window.gtag==='function') window.gtag('event',name,details||{});
  };
})();
