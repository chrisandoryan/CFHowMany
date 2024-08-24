function loadData(callback) {
    chrome.storage.local.get("cloudflareData", function(result) {
      callback(result.cloudflareData || []);
    });
  }
  
  function saveData(data) {
    chrome.storage.local.set({ cloudflareData: data });
  }
  
  function resolveDomainToIP(domain, callback) {
    chrome.dns.resolve(domain, function(result) {
      if (result && result.addresses && result.addresses.length > 0) {
        callback(result.addresses[0]); 
      } else {
        callback(null); 
      }
    });
  }
  
  chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      let isCloudflare = details.responseHeaders.some(header =>
        header.name.toLowerCase() === "server" && header.value.toLowerCase().includes("cloudflare")
      );

  
      if (isCloudflare) {
        const url = new URL(details.url);
        const domain = url.hostname;
        const referrer = details.initiator || "Direct Visit";

        loadData(function(cloudflareData) {
            let existingEntry = cloudflareData.find(item => item.domain === domain);

            if (existingEntry) {
              existingEntry.visitCount += 1;
              existingEntry.lastVisitTime = new Date().toISOString();
              existingEntry.referrer = referrer;
            } else {
              cloudflareData.push({
                domain,
                firstVisitTime: new Date().toISOString(),
                lastVisitTime: new Date().toISOString(),
                visitCount: 1,
                referrer: referrer
              });
            }

            saveData(cloudflareData);
            console.log(`Cloudflare detected on: ${domain}`);
          });
      }
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
  );
  
  loadData(function(cloudflareData) {
    console.log('Visited CF sites:', cloudflareData);
  });  