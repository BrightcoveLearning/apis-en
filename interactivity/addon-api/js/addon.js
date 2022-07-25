window.onYouTubeIframeAPIReady = function() {
   var ytPlayer = new YT.Player("hapyak-player-45306-9847", {
       height: "405",
       width: "720",
       videoId: "mKA4-MA-jPY",
       playerVars: {
           controls: /(iPhone|iPad)/i.test(navigator.userAgent) ? 0 : 2,
           html: 1,
           playsinline: 1,
           autohide: 1,
           modestbranding: 1,
           rel: 0,
           fs: 0,
           showinfo: 0,
           wmode: "opaque"
       }
   });
   hapyak.viewer({
       apiKey: "40b67897058b404fa75b",
       projectId: 45313,
       environment: "production",
       player: ytPlayer,
       playerType: "youtube",
       width: 720,
       height: 405,
       autoplay: false
   });
};

document.addEventListener("DOMContentLoaded", function () {
  var span = document.getElementById("span");

  // Setup an addon to listen for events from the iframe annotation
  hapyak.addon("color-change-listener", {
    init: function () {
      console.log("This is a message from init. Perform any setup needed here.");
    },
    "notify-color": function (e) {
      span.innerHTML = "Iframe background is " + e.data.color;
    }
  });

  document.getElementById("button").addEventListener("click", function () {
    // Broadcast a message to all iframes on the page
    Array.prototype.forEach.call(document.querySelectorAll("iframe"), function (iframe) {
      // Send a message to the iframe annotation telling it to change its color to red
      hapyak.message.send(iframe.contentWindow, "change-color", {
        "color": "red"
      });
      span.innerHTML = "Iframe background is red";
    });
  }, false);
}, false);
