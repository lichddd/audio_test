<template>
  <div class="hello">
    <audio controls :src="url"></audio>
    <button type="button" name="button" @click="start()">开始</button>
    <button type="button" name="button" @click="stop()">停止</button>
    <div class="waves">
      <div class="wave" v-for="(w,index) in wave" :style="{'height':`${80*(w-128)/128+5}%`,'width':`${60/wave.length}%`,'left':`${index*100/(wave.length)}%`}">
      </div>
    </div>
  </div>
</template>

<script>
import audio_record from '@/util/audio_record'
export default {
  name: 'HelloWorld',
  data () {
    return {
      recorder:null,
      wave:[],
      url:null,
    }
  },
  mounted(){
    this.createAudio();
  },
  methods:{

      async createAudio(){
        this.recorder=await audio_record.createAudioRecord(()=>{},()=>{},64);
        this.recorder.analys((data)=>{
          let arr=data.map(l=>l);
          this.wave=arr;
        });
        this.recorder.progress((data)=>{
          console.log(data);
        });
      },
      start(){
        this.recorder.start();
      }
      ,
      stop(){
        this.recorder.stop((data,url,chunks)=>{
          this.url=url;
        })
      },
  },
  beforeDestroy(){
    if (this.recorder&&this.recorder.destory) {
      this.recorder.destory();
    }
    this.recorder.progress(null);
    this.recorder.analys(null);
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .waves{
    width: 100%;
    height: 100px;
    position: relative;
  }
  .waves .wave{
    height: 0%;
    background: rgb(100, 255, 100);
    bottom: 0%;
    display: inline-block;
    position: absolute;
  }
</style>
