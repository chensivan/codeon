var client = require('socket.io-client');
var prefs = require('../../utils/user_preferences');
var _ = require('underscore')

module.exports = function(app) {
    app.factory('RequestReplayer', RequestReplayer);

    RequestReplayer.$inject = ['$rootScope', '$timeout', '$q'];
    function RequestReplayer($rootScope, $timeout, $q) {

  		function getAudio(url) {
  			return $q(function(resolve, reject) {
          var serverURL = prefs.getServerURL() + url;
          console.log(serverURL);
  				var audio = new Audio(serverURL);
  				audio.addEventListener('canplaythrough', function() {
  					resolve(audio);
  				}, false);
  			});
  		}

      function getJSON(url) {
          return $http({
              url: prefs.getServerURL() + url
          }).then(function(response) {
              return response.data;
          });
      }

  		var playRequest = function(request, onDone) {
  			var sound;
  			var requestID = request.question_id;

  			getAudio('/get_audio/' + requestID).then(function(audio) {
  				sound = audio;
  				var start_timestamp;

  				audio.play();
          var delay =  1000*audio.duration;
          //when audio stops, change request status
          $timeout(function() {
								onDone();
							},delay);


  			}).then(function(){
          console.log("okok");
        });

  			return {
  				stop: function() {
  					if(sound) {
  						sound.pause();
  						sound.currentTime = 0;
  					}
  				}
  			};
  		};
      return {
  	       playRequest: playRequest
      };
    }

}