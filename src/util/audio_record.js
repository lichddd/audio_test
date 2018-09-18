(function() {
  window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;
  navigator.getUserMedia = (
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    ? function(c, os, oe) {
      navigator.mediaDevices.getUserMedia(c).then(os, oe);
    }
    : null) || navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
})();

export default {
  DO_NOT_SUPPORT_WEB_MIC:"DO_NOT_SUPPORT_WEB_MIC",
  CAN_NOT_LINK_MIC:"CAN_NOT_LINK_MIC",
  async createAudioRecord(success=null, error=null,analyser_size=32) {
    return new Promise((resolve, reject) => {
      if (navigator.getUserMedia&&window.MediaRecorder) {
        navigator.getUserMedia({
          audio: true
        }, (stream) => {
          var chunks = [];
          let g_recorder = new MediaRecorder(stream,{'type' : 'audio/ogg; codecs=opus'});


          let audioCtx = new (window.AudioContext || webkitAudioContext)();
          let source = audioCtx.createMediaStreamSource(stream);
          let analyser = audioCtx.createAnalyser();
          analyser.fftSize = analyser_size;
          var dataArray = new Uint8Array(analyser.frequencyBinCount);





          if (success) {
            success();
          }
          let r={
            isrecording:false,
            destory: () => {
              stream.getTracks().forEach(l => {
                l.stop();
              });
              window.URL.revokeObjectURL(stream);
              r.isrecording=false;
            },
            start: () => {
              chunks=[];
              g_recorder.ondataavailable = function(e) {
                chunks.push(e.data);
                if (r._progressCallBack) {
                  r._progressCallBack(e.data);
                }
              }
              source.connect(analyser);
              g_recorder.start(1000);
              r.isrecording=true;
              requestAnimationFrame(progress);
            },
            stop: (callback) => {
              g_recorder.onstop = function(e) {
                var blob = new Blob(chunks, {'type' : 'audio/ogg; codecs=opus'});
                var url = URL.createObjectURL(blob);
                callback(blob, url,chunks);
              }
              g_recorder.stop();
              r.isrecording=false;
              source.disconnect(analyser);
            },
            progress:(callback)=>{
              r._progressCallBack=callback;
            },
            analys:(callback)=>{
              r._analysCallBack=callback;
            },
            _progressCallBack:null,
            _analysCallBack:null,
          }

          function progress(){
            if (r.isrecording&&r._progressCallBack) {
              analyser.getByteTimeDomainData(dataArray);
              r._analysCallBack(dataArray);
              requestAnimationFrame(progress);
            }
          }
          resolve(r);
        }, (e)=> {
          if (error) {
            error(this.CAN_NOT_LINK_MIC);
          }
          alert(this.CAN_NOT_LINK_MIC);
          console.error(e);
          reject(this.CAN_NOT_LINK_MIC);
        });
      } else {
        if (error) {
          error(this.DO_NOT_SUPPORT_WEB_MIC);
        }
        alert(this.DO_NOT_SUPPORT_WEB_MIC);
        console.error(this.DO_NOT_SUPPORT_WEB_MIC);
        reject(this.DO_NOT_SUPPORT_WEB_MIC);
      }

    });

  }

}
